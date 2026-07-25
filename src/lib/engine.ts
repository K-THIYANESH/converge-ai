import type {
  Alert,
  CorrelationResult,
  CyberEvent,
  RiskLevel,
  RiskScore,
  TimelineStep,
  Transaction,
} from './types';

function minutesBetween(a: string, b: string): number {
  return Math.abs(+new Date(a) - +new Date(b)) / 60_000;
}

/**
 * Rule-based correlation engine.
 * Correlates cyber events and banking transactions into alerts.
 */
export function correlate(
  events: CyberEvent[],
  transactions: Transaction[],
): Alert[] {
  const alerts: Alert[] = [];

  for (const txn of transactions) {
    const nearby = events.filter(
      (e) => minutesBetween(e.timestamp, txn.timestamp) <= 10,
    );

    const hasImpossible = nearby.some((e) => e.type === 'Impossible Travel');
    const hasNewDevice = nearby.some((e) => e.type === 'New Device');
    const hasPhishing = nearby.some((e) => e.type === 'Phishing Email');
    const hasFailedLogins = nearby.filter((e) => e.type === 'Failed Login').length >= 3;
    const isNewBeneficiary = txn.beneficiary_new;
    const isLarge = txn.amount >= 100000;

    const matchedRules: string[] = [];
    const involvedEvents: CyberEvent[] = [];
    let reason = '';
    let risk: RiskLevel = 'low';
    let score = 20;
    let confidence = 0.5;

    // Rule 1: Impossible Travel + New Device + Large Transaction => High Risk
    if (hasImpossible && hasNewDevice && isLarge) {
      matchedRules.push('Impossible Travel + New Device + Large Transaction');
      involvedEvents.push(...nearby.filter((e) => ['Impossible Travel', 'New Device'].includes(e.type)));
      reason =
        'Impossible travel login followed by a new device session and a large transaction within 10 minutes — consistent with account takeover.';
      risk = 'high';
      score = 92;
      confidence = 0.95;
    }
    // Rule 2: Multiple Failed Logins + New Beneficiary => Medium Risk
    else if (hasFailedLogins && isNewBeneficiary) {
      matchedRules.push('Multiple Failed Logins + New Beneficiary');
      involvedEvents.push(...nearby.filter((e) => e.type === 'Failed Login'));
      reason =
        'Multiple failed login attempts followed by a transfer to a new beneficiary — possible brute-force then cash-out.';
      risk = 'medium';
      score = 64;
      confidence = 0.82;
    }
    // Rule 3: Phishing Email + Credential Login + Large Transaction => High Risk
    else if (hasPhishing && isLarge) {
      matchedRules.push('Phishing Email + Large Transaction');
      involvedEvents.push(...nearby.filter((e) => ['Phishing Email', 'Credential Login'].includes(e.type)));
      reason =
        'Phishing email delivered before a large transaction — credentials may have been harvested.';
      risk = 'high';
      score = 78;
      confidence = 0.88;
    }
    // Rule 4: New Device + New Beneficiary => Medium Risk
    else if (hasNewDevice && isNewBeneficiary) {
      matchedRules.push('New Device + New Beneficiary');
      involvedEvents.push(...nearby.filter((e) => e.type === 'New Device'));
      reason =
        'Login from a new device followed by a transfer to a new beneficiary — elevated fraud risk.';
      risk = 'medium';
      score = 55;
      confidence = 0.75;
    }
    // Rule 5: Large transaction alone with impossible travel
    else if (hasImpossible && isLarge) {
      matchedRules.push('Impossible Travel + Large Transaction');
      involvedEvents.push(...nearby.filter((e) => e.type === 'Impossible Travel'));
      reason = 'Large transaction from an impossible-travel session — likely fraudulent.';
      risk = 'high';
      score = 80;
      confidence = 0.85;
    }
    // Low risk otherwise
    else {
      matchedRules.push('No high-risk pattern matched');
      reason = 'No correlated attack pattern detected for this transaction.';
      risk = 'low';
      score = 22;
      confidence = 0.6;
    }

    if (risk === 'low' && Math.random() > 0.85) continue; // don't flood low alerts

    alerts.push({
      id: `ALR-${txn.id.replace('TXN-', '')}`,
      risk,
      score,
      reason,
      matched_rules: matchedRules,
      events: involvedEvents,
      transactions: [txn],
      confidence,
      status: risk === 'high' ? 'open' : risk === 'medium' ? 'investigating' : 'resolved',
      created_at: txn.timestamp,
    });
  }

  return alerts.sort((a, b) => b.score - a.score);
}

/**
 * Build a timeline for a specific alert — the attack flow.
 */
export function buildTimeline(alert: Alert): TimelineStep[] {
  const steps: TimelineStep[] = [];
  const events = [...alert.events].sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp));
  const txn = alert.transactions[0];

  for (const e of events) {
    steps.push({
      id: `step-${e.id}`,
      node_type: 'event',
      label: e.type,
      description: e.description,
      timestamp: e.timestamp,
      severity: e.severity,
      meta: {
        Location: e.location ?? '—',
        Device: e.device ?? '—',
        'Source IP': e.source_ip,
      },
    });
  }

  if (txn) {
    steps.push({
      id: `step-${txn.id}`,
      node_type: 'transaction',
      label: `₹${txn.amount.toLocaleString('en-IN')} Transfer`,
      description: `Transfer to ${txn.beneficiary}${txn.beneficiary_new ? ' (new beneficiary)' : ''} via ${txn.channel}`,
      timestamp: txn.timestamp,
      amount: txn.amount,
      meta: {
        Account: txn.account,
        Beneficiary: txn.beneficiary,
        Channel: txn.channel,
      },
    });
  }

  steps.push({
    id: `step-risk-${alert.id}`,
    node_type: 'alert',
    label: 'Risk Generated',
    description: alert.reason,
    timestamp: alert.created_at,
    severity: alert.risk === 'high' ? 'high' : 'medium',
    meta: {
      'Risk Score': String(alert.score),
      Confidence: `${Math.round(alert.confidence * 100)}%`,
    },
  });

  steps.push({
    id: `step-action-${alert.id}`,
    node_type: 'action',
    label: txn?.status === 'blocked' ? 'Transaction Blocked' : 'Transaction Flagged',
    description:
      txn?.status === 'blocked'
        ? 'High-risk transaction automatically blocked by CONVERGE-AI.'
        : 'Transaction flagged for manual review by the fraud team.',
    timestamp: alert.created_at,
  });

  return steps;
}

export function computeRiskScore(alerts: Alert[]): RiskScore {
  if (alerts.length === 0) {
    return {
      risk: 'low',
      score: 15,
      reason: 'No alerts generated — baseline risk.',
      confidence: 0.5,
      updated_at: new Date().toISOString(),
    };
  }
  const top = alerts[0];
  return {
    risk: top.risk,
    score: top.score,
    reason: top.reason,
    confidence: top.confidence,
    updated_at: new Date().toISOString(),
  };
}

export function correlateAll(
  events: CyberEvent[],
  transactions: Transaction[],
): CorrelationResult & { alerts: Alert[] } {
  const alerts = correlate(events, transactions);
  const risk = computeRiskScore(alerts);
  const topAlert = alerts[0];
  const timeline = topAlert ? buildTimeline(topAlert) : [];
  return {
    risk: risk.risk,
    score: risk.score,
    reason: risk.reason,
    confidence: risk.confidence,
    matched_rules: topAlert?.matched_rules ?? [],
    timeline,
    alerts,
  };
}

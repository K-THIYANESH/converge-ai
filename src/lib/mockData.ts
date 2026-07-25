import type {
  CyberEvent,
  EventType,
  Severity,
  Transaction,
  RiskLevel,
} from './types';

const EVENT_TYPES: EventType[] = [
  'Phishing Email',
  'Credential Login',
  'Failed Login',
  'Impossible Travel',
  'New Device',
  'Malware Detected',
  'Privilege Escalation',
  'Data Exfiltration',
  'VPN Connection',
  'Suspicious API Call',
];

const LOCATIONS = [
  'Mumbai, IN',
  'Delhi, IN',
  'Bengaluru, IN',
  'Chennai, IN',
  'Kolkata, IN',
  'Singapore, SG',
  'Dubai, AE',
  'London, UK',
  'New York, US',
  'Toronto, CA',
  'Berlin, DE',
  'Tokyo, JP',
];

const DEVICES = [
  'iPhone 15 Pro',
  'Pixel 8',
  'Galaxy S24',
  'MacBook Pro',
  'ThinkPad X1',
  'Unknown Device',
];

const BENEFICIARIES = [
  'Acme Corp',
  'Globex Ltd',
  'Initech LLC',
  'Umbrella Inc',
  'Stark Industries',
  'Wayne Enterprises',
  'Soylent Corp',
  'Hooli Inc',
  'Pied Piper',
  'Vandelay Imports',
];

const ACCOUNTS = ['ACC100245', 'ACC100389', 'ACC100512', 'ACC100677', 'ACC100893'];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isoOffset(minutesAgo: number): string {
  const d = new Date(Date.now() - minutesAgo * 60_000);
  return d.toISOString();
}

function severityForType(type: EventType): Severity {
  const map: Record<EventType, Severity> = {
    'Phishing Email': 'medium',
    'Credential Login': 'low',
    'Failed Login': 'medium',
    'Impossible Travel': 'high',
    'New Device': 'medium',
    'Malware Detected': 'high',
    'Privilege Escalation': 'critical',
    'Data Exfiltration': 'critical',
    'VPN Connection': 'low',
    'Suspicious API Call': 'high',
  };
  return map[type];
}

function ip(): string {
  return `${randInt(10, 220)}.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(1, 254)}`;
}

export function generateEvents(count = 100): CyberEvent[] {
  const events: CyberEvent[] = [];
  for (let i = 0; i < count; i++) {
    const type = rand(EVENT_TYPES);
    const minutesAgo = randInt(0, 60 * 24); // last 24h
    events.push({
      id: `EVT-${(1000 + i).toString()}`,
      type,
      description: describeEvent(type),
      source_ip: ip(),
      user_id: rand(['U-20451', 'U-20452', 'U-20453', 'U-20454', 'U-20455']),
      device: rand(DEVICES),
      location: rand(LOCATIONS),
      severity: severityForType(type),
      timestamp: isoOffset(minutesAgo),
    });
  }
  return events.sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
}

function describeEvent(type: EventType): string {
  const templates: Record<EventType, string> = {
    'Phishing Email': 'Credential harvesting email delivered to inbox',
    'Credential Login': 'Successful login using valid credentials',
    'Failed Login': 'Multiple failed authentication attempts detected',
    'Impossible Travel': 'Login from geographically distant location',
    'New Device': 'First-time login from an unrecognized device',
    'Malware Detected': 'Endpoint protection flagged suspicious binary',
    'Privilege Escalation': 'Unauthorized privilege escalation attempt',
    'Data Exfiltration': 'Large outbound data transfer detected',
    'VPN Connection': 'VPN session established from new region',
    'Suspicious API Call': 'Anomalous API request pattern observed',
  };
  return templates[type];
}

export function generateTransactions(count = 100): Transaction[] {
  const txns: Transaction[] = [];
  for (let i = 0; i < count; i++) {
    const minutesAgo = randInt(0, 60 * 24);
    const amount = randInt(500, 500000);
    const isNew = Math.random() < 0.3;
    const risk: RiskLevel = amount > 200000 ? 'high' : amount > 50000 ? 'medium' : 'low';
    const status: Transaction['status'] =
      risk === 'high' && Math.random() < 0.6 ? 'blocked' : Math.random() < 0.2 ? 'flagged' : 'completed';
    txns.push({
      id: `TXN-${(2000 + i).toString()}`,
      account: rand(ACCOUNTS),
      amount,
      currency: 'INR',
      beneficiary: rand(BENEFICIARIES),
      beneficiary_new: isNew,
      channel: rand(['web', 'mobile', 'atm', 'branch']),
      risk,
      status,
      timestamp: isoOffset(minutesAgo),
    });
  }
  return txns.sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
}

/**
 * Generate a single coherent attack scenario for the simulator.
 * Returns events and transactions ordered oldest-first so they form a timeline.
 */
export function generateAttackScenario(): {
  events: CyberEvent[];
  transactions: Transaction[];
} {
  const now = Date.now();
  const baseUser = 'U-20451';
  const baseAccount = 'ACC100245';
  const beneficiary = rand(BENEFICIARIES);
  const farLocation = rand(['Singapore, SG', 'Dubai, AE', 'London, UK', 'New York, US']);
  const device = rand(['Unknown Device', 'Pixel 8', 'Galaxy S24']);
  const amount = randInt(200000, 800000);

  const events: CyberEvent[] = [
    {
      id: `EVT-S${Math.floor(Math.random() * 10000)}`,
      type: 'Phishing Email',
      description: 'Credential harvesting email delivered to inbox',
      source_ip: ip(),
      user_id: baseUser,
      device: 'MacBook Pro',
      location: 'Mumbai, IN',
      severity: 'medium',
      timestamp: new Date(now - 30 * 60_000).toISOString(),
    },
    {
      id: `EVT-S${Math.floor(Math.random() * 10000) + 1}`,
      type: 'Credential Login',
      description: 'Successful login using valid credentials',
      source_ip: ip(),
      user_id: baseUser,
      device,
      location: 'Mumbai, IN',
      severity: 'low',
      timestamp: new Date(now - 24 * 60_000).toISOString(),
    },
    {
      id: `EVT-S${Math.floor(Math.random() * 10000) + 2}`,
      type: 'Impossible Travel',
      description: 'Login from geographically distant location',
      source_ip: ip(),
      user_id: baseUser,
      device,
      location: farLocation,
      severity: 'high',
      timestamp: new Date(now - 18 * 60_000).toISOString(),
    },
    {
      id: `EVT-S${Math.floor(Math.random() * 10000) + 3}`,
      type: 'New Device',
      description: 'First-time login from an unrecognized device',
      source_ip: ip(),
      user_id: baseUser,
      device,
      location: farLocation,
      severity: 'medium',
      timestamp: new Date(now - 15 * 60_000).toISOString(),
    },
  ];

  const transactions: Transaction[] = [
    {
      id: `TXN-S${Math.floor(Math.random() * 10000)}`,
      account: baseAccount,
      amount,
      currency: 'INR',
      beneficiary,
      beneficiary_new: true,
      channel: 'mobile',
      risk: 'high',
      status: 'blocked',
      timestamp: new Date(now - 8 * 60_000).toISOString(),
    },
  ];

  return { events, transactions };
}

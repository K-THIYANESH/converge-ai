export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface CyberEvent {
  id: string;
  type: EventType;
  description: string;
  source_ip: string;
  user_id: string;
  device?: string;
  location?: string;
  severity: Severity;
  timestamp: string; // ISO
}

export type EventType =
  | 'Phishing Email'
  | 'Credential Login'
  | 'Failed Login'
  | 'Impossible Travel'
  | 'New Device'
  | 'Malware Detected'
  | 'Privilege Escalation'
  | 'Data Exfiltration'
  | 'VPN Connection'
  | 'Suspicious API Call';

export interface Transaction {
  id: string;
  account: string;
  amount: number;
  currency: string;
  beneficiary: string;
  beneficiary_new: boolean;
  channel: 'web' | 'mobile' | 'atm' | 'branch';
  risk: RiskLevel;
  status: 'completed' | 'blocked' | 'flagged';
  timestamp: string;
}

export interface Alert {
  id: string;
  risk: RiskLevel;
  score: number;
  reason: string;
  matched_rules: string[];
  events: CyberEvent[];
  transactions: Transaction[];
  confidence: number;
  status: 'open' | 'investigating' | 'resolved';
  created_at: string;
}

export interface TimelineNode {
  id: string;
  kind: 'event' | 'transaction' | 'alert' | 'action';
  label: string;
  detail: string;
  timestamp: string;
  severity?: Severity;
  amount?: number;
}

export interface TimelineStep {
  id: string;
  node_type: 'event' | 'transaction' | 'alert' | 'action';
  label: string;
  description: string;
  timestamp: string;
  severity?: Severity;
  amount?: number;
  meta?: Record<string, string>;
}

export interface CorrelationResult {
  risk: RiskLevel;
  score: number;
  reason: string;
  matched_rules: string[];
  timeline: TimelineStep[];
  confidence: number;
}

export interface RiskScore {
  risk: RiskLevel;
  score: number;
  reason: string;
  confidence: number;
  updated_at: string;
}

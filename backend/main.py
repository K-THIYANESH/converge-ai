"""
CONVERGE-AI — Unified Cyber-Fraud Correlation Engine
FastAPI backend with mock data, rule-based correlation, and SQLite storage.
"""
import random
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

class CyberEvent(BaseModel):
    id: str
    type: str
    description: str
    source_ip: str
    user_id: str
    device: Optional[str] = None
    location: Optional[str] = None
    severity: str
    timestamp: str


class Transaction(BaseModel):
    id: str
    account: str
    amount: int
    currency: str
    beneficiary: str
    beneficiary_new: bool
    channel: str
    risk: str
    status: str
    timestamp: str


class Alert(BaseModel):
    id: str
    risk: str
    score: int
    reason: str
    matched_rules: list[str]
    event_ids: list[str]
    transaction_id: str
    confidence: float
    status: str
    created_at: str


class TimelineStep(BaseModel):
    id: str
    node_type: str
    label: str
    description: str
    timestamp: str
    severity: Optional[str] = None
    amount: Optional[int] = None


class RiskScore(BaseModel):
    risk: str
    score: int
    reason: str
    confidence: float
    updated_at: str


# ---------------------------------------------------------------------------
# Mock data generation
# ---------------------------------------------------------------------------

EVENT_TYPES = [
    "Phishing Email", "Credential Login", "Failed Login", "Impossible Travel",
    "New Device", "Malware Detected", "Privilege Escalation", "Data Exfiltration",
    "VPN Connection", "Suspicious API Call",
]

LOCATIONS = [
    "Mumbai, IN", "Delhi, IN", "Bengaluru, IN", "Chennai, IN", "Kolkata, IN",
    "Singapore, SG", "Dubai, AE", "London, UK", "New York, US", "Toronto, CA",
]

DEVICES = ["iPhone 15 Pro", "Pixel 8", "Galaxy S24", "MacBook Pro", "ThinkPad X1", "Unknown Device"]
BENEFICIARIES = [
    "Acme Corp", "Globex Ltd", "Initech LLC", "Umbrella Inc", "Stark Industries",
    "Wayne Enterprises", "Soylent Corp", "Hooli Inc", "Pied Piper", "Vandelay Imports",
]
ACCOUNTS = ["ACC100245", "ACC100389", "ACC100512", "ACC100677", "ACC100893"]
SEVERITY_MAP = {
    "Phishing Email": "medium", "Credential Login": "low", "Failed Login": "medium",
    "Impossible Travel": "high", "New Device": "medium", "Malware Detected": "high",
    "Privilege Escalation": "critical", "Data Exfiltration": "critical",
    "VPN Connection": "low", "Suspicious API Call": "high",
}
DESCRIPTIONS = {
    "Phishing Email": "Credential harvesting email delivered to inbox",
    "Credential Login": "Successful login using valid credentials",
    "Failed Login": "Multiple failed authentication attempts detected",
    "Impossible Travel": "Login from geographically distant location",
    "New Device": "First-time login from an unrecognized device",
    "Malware Detected": "Endpoint protection flagged suspicious binary",
    "Privilege Escalation": "Unauthorized privilege escalation attempt",
    "Data Exfiltration": "Large outbound data transfer detected",
    "VPN Connection": "VPN session established from new region",
    "Suspicious API Call": "Anomalous API request pattern observed",
}


def _ip() -> str:
    return f"{random.randint(10,220)}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}"


def _iso(minutes_ago: int) -> str:
    return (datetime.now(timezone.utc) - timedelta(minutes=minutes_ago)).isoformat()


def generate_events(count: int = 100) -> list[dict]:
    events = []
    for i in range(count):
        etype = random.choice(EVENT_TYPES)
        events.append({
            "id": f"EVT-{1000+i}",
            "type": etype,
            "description": DESCRIPTIONS[etype],
            "source_ip": _ip(),
            "user_id": random.choice(["U-20451","U-20452","U-20453","U-20454","U-20455"]),
            "device": random.choice(DEVICES),
            "location": random.choice(LOCATIONS),
            "severity": SEVERITY_MAP[etype],
            "timestamp": _iso(random.randint(0, 1440)),
        })
    events.sort(key=lambda e: e["timestamp"], reverse=True)
    return events


def generate_transactions(count: int = 100) -> list[dict]:
    txns = []
    for i in range(count):
        amount = random.randint(500, 500000)
        is_new = random.random() < 0.3
        risk = "high" if amount > 200000 else "medium" if amount > 50000 else "low"
        if risk == "high" and random.random() < 0.6:
            status = "blocked"
        elif random.random() < 0.2:
            status = "flagged"
        else:
            status = "completed"
        txns.append({
            "id": f"TXN-{2000+i}",
            "account": random.choice(ACCOUNTS),
            "amount": amount,
            "currency": "INR",
            "beneficiary": random.choice(BENEFICIARIES),
            "beneficiary_new": is_new,
            "channel": random.choice(["web","mobile","atm","branch"]),
            "risk": risk,
            "status": status,
            "timestamp": _iso(random.randint(0, 1440)),
        })
    txns.sort(key=lambda t: t["timestamp"], reverse=True)
    return txns


# ---------------------------------------------------------------------------
# Correlation engine (rule-based)
# ---------------------------------------------------------------------------

TEN_MIN = 10 * 60  # seconds


def _seconds_between(a: str, b: str) -> float:
    return abs(datetime.fromisoformat(a).timestamp() - datetime.fromisoformat(b).timestamp())


def correlate(events: list[dict], transactions: list[dict]) -> list[dict]:
    alerts = []
    for txn in transactions:
        nearby = [e for e in events if _seconds_between(e["timestamp"], txn["timestamp"]) <= TEN_MIN]
        has_impossible = any(e["type"] == "Impossible Travel" for e in nearby)
        has_new_device = any(e["type"] == "New Device" for e in nearby)
        has_phishing = any(e["type"] == "Phishing Email" for e in nearby)
        failed_count = sum(1 for e in nearby if e["type"] == "Failed Login")
        is_new_bene = txn["beneficiary_new"]
        is_large = txn["amount"] >= 100000

        matched_rules, involved, reason, risk, score, confidence = [], [], "", "low", 20, 0.5

        if has_impossible and has_new_device and is_large:
            matched_rules = ["Impossible Travel + New Device + Large Transaction"]
            involved = [e for e in nearby if e["type"] in ("Impossible Travel","New Device")]
            reason = "Impossible travel login followed by a new device session and a large transaction within 10 minutes."
            risk, score, confidence = "high", 92, 0.95
        elif failed_count >= 3 and is_new_bene:
            matched_rules = ["Multiple Failed Logins + New Beneficiary"]
            involved = [e for e in nearby if e["type"] == "Failed Login"]
            reason = "Multiple failed login attempts followed by a transfer to a new beneficiary."
            risk, score, confidence = "medium", 64, 0.82
        elif has_phishing and is_large:
            matched_rules = ["Phishing Email + Large Transaction"]
            involved = [e for e in nearby if e["type"] in ("Phishing Email","Credential Login")]
            reason = "Phishing email delivered before a large transaction — credentials may have been harvested."
            risk, score, confidence = "high", 78, 0.88
        elif has_new_device and is_new_bene:
            matched_rules = ["New Device + New Beneficiary"]
            involved = [e for e in nearby if e["type"] == "New Device"]
            reason = "Login from a new device followed by a transfer to a new beneficiary."
            risk, score, confidence = "medium", 55, 0.75
        elif has_impossible and is_large:
            matched_rules = ["Impossible Travel + Large Transaction"]
            involved = [e for e in nearby if e["type"] == "Impossible Travel"]
            reason = "Large transaction from an impossible-travel session."
            risk, score, confidence = "high", 80, 0.85
        else:
            matched_rules = ["No high-risk pattern matched"]
            reason = "No correlated attack pattern detected for this transaction."
            risk, score, confidence = "low", 22, 0.6

        if risk == "low" and random.random() > 0.85:
            continue

        alerts.append({
            "id": f"ALR-{txn['id'].replace('TXN-','')}",
            "risk": risk,
            "score": score,
            "reason": reason,
            "matched_rules": matched_rules,
            "event_ids": [e["id"] for e in involved],
            "transaction_id": txn["id"],
            "confidence": confidence,
            "status": "open" if risk == "high" else "investigating" if risk == "medium" else "resolved",
            "created_at": txn["timestamp"],
        })
    alerts.sort(key=lambda a: a["score"], reverse=True)
    return alerts


def build_timeline(alert: dict, events: list[dict], txn: dict | None) -> list[dict]:
    steps = []
    involved = sorted(
        [e for e in events if e["id"] in alert["event_ids"]],
        key=lambda e: e["timestamp"],
    )
    for e in involved:
        steps.append({
            "id": f"step-{e['id']}",
            "node_type": "event",
            "label": e["type"],
            "description": e["description"],
            "timestamp": e["timestamp"],
            "severity": e["severity"],
        })
    if txn:
        steps.append({
            "id": f"step-{txn['id']}",
            "node_type": "transaction",
            "label": f"₹{txn['amount']:,} Transfer",
            "description": f"Transfer to {txn['beneficiary']}{' (new beneficiary)' if txn['beneficiary_new'] else ''} via {txn['channel']}",
            "timestamp": txn["timestamp"],
            "amount": txn["amount"],
        })
    steps.append({
        "id": f"step-risk-{alert['id']}",
        "node_type": "alert",
        "label": "Risk Generated",
        "description": alert["reason"],
        "timestamp": alert["created_at"],
        "severity": "high" if alert["risk"] == "high" else "medium",
    })
    steps.append({
        "id": f"step-action-{alert['id']}",
        "node_type": "action",
        "label": "Transaction Blocked" if txn and txn["status"] == "blocked" else "Transaction Flagged",
        "description": "High-risk transaction automatically blocked." if txn and txn["status"] == "blocked" else "Transaction flagged for manual review.",
        "timestamp": alert["created_at"],
    })
    return steps


# ---------------------------------------------------------------------------
# In-memory store (regenerated on startup / simulate)
# ---------------------------------------------------------------------------

class Store:
    def __init__(self):
        self.regenerate()

    def regenerate(self):
        self.events = generate_events(100)
        self.transactions = generate_transactions(100)
        self.alerts = correlate(self.events, self.transactions)

    def simulate(self):
        """Inject a coherent attack scenario into the data."""
        now = datetime.now(timezone.utc)
        user = "U-20451"
        account = "ACC100245"
        bene = random.choice(BENEFICIARIES)
        far_loc = random.choice(["Singapore, SG","Dubai, AE","London, UK","New York, US"])
        device = random.choice(["Unknown Device","Pixel 8","Galaxy S24"])
        amount = random.randint(200000, 800000)

        attack_events = [
            {"id": f"EVT-S{random.randint(0,9999)}","type":"Phishing Email","description":DESCRIPTIONS["Phishing Email"],"source_ip":_ip(),"user_id":user,"device":"MacBook Pro","location":"Mumbai, IN","severity":"medium","timestamp":(now - timedelta(minutes=30)).isoformat()},
            {"id": f"EVT-S{random.randint(0,9999)}","type":"Credential Login","description":DESCRIPTIONS["Credential Login"],"source_ip":_ip(),"user_id":user,"device":device,"location":"Mumbai, IN","severity":"low","timestamp":(now - timedelta(minutes=24)).isoformat()},
            {"id": f"EVT-S{random.randint(0,9999)}","type":"Impossible Travel","description":DESCRIPTIONS["Impossible Travel"],"source_ip":_ip(),"user_id":user,"device":device,"location":far_loc,"severity":"high","timestamp":(now - timedelta(minutes=18)).isoformat()},
            {"id": f"EVT-S{random.randint(0,9999)}","type":"New Device","description":DESCRIPTIONS["New Device"],"source_ip":_ip(),"user_id":user,"device":device,"location":far_loc,"severity":"medium","timestamp":(now - timedelta(minutes=15)).isoformat()},
        ]
        attack_txn = {
            "id": f"TXN-S{random.randint(0,9999)}","account":account,"amount":amount,"currency":"INR","beneficiary":bene,"beneficiary_new":True,"channel":"mobile","risk":"high","status":"blocked","timestamp":(now - timedelta(minutes=8)).isoformat(),
        }
        self.events = attack_events + generate_events(96)
        self.transactions = [attack_txn] + generate_transactions(99)
        self.alerts = correlate(self.events, self.transactions)

    def risk_score(self) -> dict:
        if not self.alerts:
            return {"risk":"low","score":15,"reason":"No alerts generated — baseline risk.","confidence":0.5,"updated_at":datetime.now(timezone.utc).isoformat()}
        top = self.alerts[0]
        return {"risk":top["risk"],"score":top["score"],"reason":top["reason"],"confidence":top["confidence"],"updated_at":datetime.now(timezone.utc).isoformat()}


store = Store()

# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------

app = FastAPI(title="CONVERGE-AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"name": "CONVERGE-AI", "version": "1.0.0", "status": "running"}


@app.get("/events")
def get_events():
    return store.events


@app.get("/transactions")
def get_transactions():
    return store.transactions


@app.get("/alerts")
def get_alerts():
    enriched = []
    for a in store.alerts:
        txn = next((t for t in store.transactions if t["id"] == a["transaction_id"]), None)
        events = [e for e in store.events if e["id"] in a["event_ids"]]
        enriched.append({**a, "events": events, "transaction": txn})
    return enriched


@app.get("/timeline")
def get_timeline(alert_id: Optional[str] = None):
    alert = next((a for a in store.alerts if a["id"] == alert_id), store.alerts[0] if store.alerts else None)
    if not alert:
        return []
    txn = next((t for t in store.transactions if t["id"] == alert["transaction_id"]), None)
    return build_timeline(alert, store.events, txn)


@app.get("/risk-score")
def get_risk_score():
    return store.risk_score()


@app.post("/simulate")
def simulate():
    store.simulate()
    return {"status": "ok", "alerts": len(store.alerts), "risk": store.risk_score()}

# CONVERGE-AI

> **Unified Cyber-Fraud Correlation Engine**

CONVERGE-AI is a hackathon MVP that correlates **cybersecurity events** and **banking transactions** into a single unified attack timeline. It uses a simple **rule-based engine** — no machine learning — to flag suspicious activity and explain exactly why each alert was generated.

---

## Features

- **Dashboard** — Stat cards (events, transactions, alerts, risk score), charts (event types, alert severity, transactions per hour), and a recent alerts table.
- **Events Page** — Searchable, filterable table of 100 mock cyber events with severity badges.
- **Transactions Page** — Searchable table of 100 mock banking transactions with amount, account, risk, and status.
- **Alerts Page** — Expandable alert cards with full risk explanation: matched rules, events involved, transaction, and confidence.
- **Attack Timeline** — Interactive React Flow visualization of the attack chain (phishing → login → impossible travel → new device → transfer → risk → blocked). Click any node for details.
- **Simulator** — One-click "Generate Attack" button injects a realistic attack scenario and updates the entire dashboard in real time.
- **Dark theme** with blue accent, rounded cards, and minimal animations.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + TypeScript + TailwindCSS |
| Charts | Recharts |
| Flow Diagram | React Flow |
| State | Zustand |
| Backend | FastAPI + Python 3.11 |
| Database | SQLite (or in-memory mock data) |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Project Structure

```
CONVERGE-AI/
├── src/                    # Frontend (React + Vite)
│   ├── components/         # Sidebar, Layout, Topbar, UI primitives
│   ├── lib/                # Types, mock data, correlation engine, store
│   ├── pages/              # Dashboard, Events, Transactions, Alerts, Timeline, About
│   ├── App.tsx             # Routes
│   ├── main.tsx            # Entry point
│   └── index.css           # Tailwind + global styles
├── backend/                # Backend (FastAPI)
│   ├── main.py             # API + mock data + correlation engine
│   └── requirements.txt    # Python dependencies
├── public/                 # Static assets (favicon)
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.ts
├── vercel.json             # Frontend deployment config
├── render.yaml             # Backend deployment config
└── README.md
```

---

## Installation

### Frontend

```bash
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`. It works standalone with embedded mock data and correlation engine — no backend required.

### Backend (optional)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

The backend runs at `http://localhost:8000` with API docs at `http://localhost:8000/docs`.

---

## API List

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/events` | List 100 mock cyber events |
| GET | `/transactions` | List 100 mock banking transactions |
| GET | `/alerts` | List correlated alerts with events + transaction |
| GET | `/timeline?alert_id=ALR-XXXX` | Get attack timeline steps for an alert |
| GET | `/risk-score` | Current top risk score |
| POST | `/simulate` | Generate a random attack scenario and refresh data |

---

## Correlation Rules

| Pattern | Risk | Score |
|---------|------|-------|
| Impossible Travel + New Device + Large Transaction | High | 92 |
| Phishing Email + Large Transaction | High | 78 |
| Impossible Travel + Large Transaction | High | 80 |
| Multiple Failed Logins + New Beneficiary | Medium | 64 |
| New Device + New Beneficiary | Medium | 55 |
| No high-risk pattern matched | Low | 22 |

---

## Screenshots

> Add screenshots here after running the app.

---

## Deployment

### Frontend (Vercel)

1. Push the repo to GitHub.
2. Import the project in Vercel.
3. Set the root directory to the project root (or `frontend/` if restructured).
4. Build command: `npm run build` — Output directory: `dist`.
5. `vercel.json` is included for SPA routing.

### Backend (Render)

1. Push the repo to GitHub.
2. Create a new Web Service in Render.
3. Set the root directory to `backend/`.
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. `render.yaml` is included as a blueprint.

---

## Future Improvements

- Real database persistence with SQLite (currently in-memory).
- WebSocket support for live event streaming.
- More correlation rules and configurable thresholds.
- User authentication and multi-tenant support.
- Export alerts to SIEM / SOAR platforms.
- Machine learning model for anomaly detection.
- Historical trend analysis and reporting.

---

## License

MIT — Built for hackathon demonstration purposes.

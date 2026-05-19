# DecisionOS Backend — Setup & Demo Guide

## Architecture

```
Frontend React/Vite (port 5173)
    │
    │  REST APIs + WebSocket
    ▼
FastAPI Backend (port 8000)
    ├── Telemetry Simulator
    ├── Alert Engine + Suppression
    ├── Root Cause Engine
    ├── Decision Engine
    ├── What-If Simulator
    ├── Downstream Dependency Engine
    ├── Replay Timeline Store
    ├── LangGraph Decision Workflow (optional)
    └── Ollama AI Explanation Layer (optional)
```

---

## Quick Start

### 1. Start Ollama (optional — backend works without it)
```bash
ollama serve
ollama pull llama3.1:8b
```

### 2. Set up and start the backend
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Set up frontend environment
```bash
# In project root
cp .env.example .env
```
`.env` should contain:
```
VITE_API_BASE_URL=http://localhost:8000
```

### 4. Start the frontend
```bash
# In project root
npm install
npm run dev
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Backend + Ollama + LangGraph status |
| GET | `/api/state` | Full combined state (hydrates frontend at once) |
| GET | `/api/telemetry/current` | Current sensor packet |
| POST | `/api/fault/trigger` | Start the coolant flow fault scenario |
| POST | `/api/system/reset` | Reset to normal state |
| GET | `/api/alerts` | Current alerts with suppression info |
| GET | `/api/root-cause` | Root cause chain analysis |
| GET | `/api/decisions` | Recommended operator action with AI explanation |
| POST | `/api/simulate` | What-if simulation for all/one action |
| POST | `/api/apply-action` | Apply selected operator action |
| GET | `/api/downstream` | Downstream subsystem health matrix |
| GET | `/api/replay` | Recent replay timeline |
| POST | `/api/demo/start` | Reset system for demo |
| POST | `/api/demo/auto` | Trigger fault immediately |
| WS | `/ws/telemetry` | Live 1-second telemetry + full state stream |

---

## Demo Sequence

### Manual Demo (for judges)

1. **Open browser** → `http://localhost:5173`
2. **Login** → enter any credentials
3. **Overview tab** shows the DecisionOS dashboard
4. Notice: **"Backend Live"** badge in the header → system is connected
5. Click **"Trigger Fault"** button in the header
6. Watch:
   - Temperature rises, pressure and flow drop in the chart
   - **CRITICAL** alerts appear in the alert panel
   - Root cause updates: "Coolant Flow Restriction"
   - Global Plant Health drops to critical range
   - Cascading Impacts panel shows affected downstream systems
7. Check the **What-If Matrix** on the right — 3 mitigation options appear
8. Click **"Apply: Reduce Load"** (or the green Apply button in header)
9. Watch the system enter **RECOVERY** mode — values normalize
10. Click **"Reset System"** to return to normal state

### API Testing
```bash
# Check backend is running
GET http://localhost:8000/api/health

# Get current telemetry
GET http://localhost:8000/api/telemetry/current

# Trigger the fault scenario
POST http://localhost:8000/api/fault/trigger

# Get AI decision recommendation
GET http://localhost:8000/api/decisions

# Apply the recommended action
POST http://localhost:8000/api/apply-action
Body: {"action": "REDUCE_LOAD_30"}

# Reset system
POST http://localhost:8000/api/system/reset
```

---

## Supported Actions

| Action | Label | Expected Outcome |
|--------|-------|-----------------|
| `REDUCE_LOAD_30` | Reduce Load by 30% | Stable recovery, low risk, moderate cost |
| `INCREASE_COOLANT_FLOW` | Increase Coolant Flow | Partial recovery, medium risk, low cost |
| `EMERGENCY_TRIP` | Emergency Trip | Immediate safety, high disruption |
| `DO_NOTHING` | No Action | Critical escalation — do not use |

---

## Sensor Ranges

| Sensor | Normal Range | Unit |
|--------|-------------|------|
| Generator Temperature | 68–78 | °C |
| Pressure | 60–75 | bar |
| Flow Rate | 68–82 | L/min |
| Vibration | 0.15–0.35 | g |
| Load | 65–80 | % |
| Coolant Level | 80–95 | % |
| Pump RPM | 1350–1550 | RPM |
| Valve Opening | 65–85 | % |

---

## LangGraph Status

- If `langgraph` is installed: full node-graph orchestration is used
- If not installed: linear Python fallback pipeline runs automatically
- Backend never crashes due to missing LangGraph

## Ollama Status

- If Ollama is running at `http://localhost:11434`: AI explanations are generated
- If not running: fallback explanation is returned
- Ollama is only called on `/api/decisions`, fault trigger, and action apply — NOT every WebSocket tick

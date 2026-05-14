# F1 Race Telemetry

An interactive Formula 1 race telemetry visualiser built with React, TypeScript, and Python (FastF1).

## Live Demo

[https://f1-telemetry-sigma.vercel.app](https://f1-telemetry-sigma.vercel.app)

## Features

- Browse race weekends from 2022–2026
- Select any driver and watch their race unfold in real time
- Circuit map with live car position dot in team colour
- Telemetry panel: speed, throttle, brake, RPM, gear, DRS
- Full playback controls: play, pause, scrub, and speed multiplier (0.5x–25x)
- Future races automatically greyed out and unclickable
- Lap counter tracking position through the race

## Tech Stack

**Frontend**
- React 19 + TypeScript
- Vite
- HTML5 Canvas (circuit map)
- Deployed on Vercel

**Backend**
- Python + FastAPI
- FastF1 (official F1 timing data)
- Deployed on Railway

## Local Development

**Backend**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Architecture

The FastAPI backend fetches and caches race data via FastF1, exposing REST endpoints for sessions, drivers, and telemetry. The React frontend fetches all data on driver selection, then replays it locally using a `requestAnimationFrame` loop — no further API calls during playback.

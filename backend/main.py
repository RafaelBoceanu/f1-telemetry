from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import fastf1
import pandas as pd
import numpy as np

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://f1-telemetry-sigma.vercel.app/",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

import os
os.makedirs("cache", exist_ok=True)
fastf1.Cache.enable_cache("cache")

def safe_value(val):
    if val is None:
        return None
    if isinstance(val, float) and np.isnan(val):
        return None
    return val

def load_session(year: int, round_number: int, session_type: str = "R"):
    try:
        session = fastf1.get_session(year, round_number, session_type)
        session.load()
        return session
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
    
@app.get("/seasons/{year}/races")
def get_races(year: int):
    try:
        schedule = fastf1.get_event_schedule(year)
        races = []
        for _, row in schedule.iterrows():
            if row["EventFormat"] == "testing":
                continue
            races.append({
                "round": row["RoundNumber"],
                "name": row["EventName"],
                "country": row["Country"],
                "circuit": row["Location"],
                "date": str(row["EventDate"].date()),
            })
        return races
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/seasons/{year}/races/{round_number}/drivers")
def get_drivers(year: int, round_number: int):
    session = load_session(year, round_number)
    drivers = []
    for abbr in session.drivers:
        info = session.get_driver(abbr)
        drivers.append({
            "number": safe_value(info.get("DriverNumber")),
            "abbreviation": safe_value(info.get("Abbreviation")),
            "full_name": safe_value(info.get("FullName")),
            "team": safe_value(info.get("TeamName")),
            "team_colour": safe_value(info.get("TeamColor")),
        })
    return drivers

@app.get("/seasons/{year}/races/{round_number}/drivers/{abbreviation}/telemetry")
def get_telemetry(year: int, round_number: int, abbreviation: str):
    session = load_session(year, round_number)
    try:
        laps = session.laps.pick_drivers(abbreviation)
    except Exception:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    pit_stops = []
    for _, lap in laps.iterrows():
        if pd.notna(lap.get("PitOutTime")):
            pit_stops.append({
                "lap": int(lap["LapNumber"]),
                "compound": safe_value(lap.get("Compound")),
            })

    all_tel = []
    all_pos = []
    race_time_offset = 0.0

    for _, lap in laps.iterrows():
        try:
            tel = lap.get_telemetry()          
            pos = lap.get_pos_data()

            if tel is None or tel.empty:
                continue

            lap_times_tel = tel["Time"].dt.total_seconds().values
            lap_duration = float(lap_times_tel[-1]) if len(lap_times_tel) else 0

            for _, row in tel.iterrows():
                t = row["Time"].total_seconds() + race_time_offset
                all_tel.append({
                    "time": round(t, 3),
                    "speed": safe_value(row.get("Speed")),
                    "throttle": safe_value(row.get("Throttle")),
                    "brake": bool(row.get("Brake" , False)),
                    "gear": safe_value(row.get("nGear")),
                    "rpm": safe_value(row.get("RPM")),
                    "drs": safe_value(row.get("DRS")),
                    "lap": int(lap["LapNumber"]),
                })

            if pos is not None and not pos.empty:
                for _, row in pos.iterrows():
                    t = row["Time"].total_seconds() + race_time_offset
                    all_pos.append({
                        "time": round(t, 3),
                        "x": safe_value(row.get("X")),
                        "y": safe_value(row.get("Y")),
                        "lap": int(lap["LapNumber"]),
                    })

            race_time_offset += lap_duration

        except Exception:
            continue
    
    all_tel.sort(key=lambda x: x["time"])
    all_pos.sort(key=lambda x: x["time"])

    circuit_points = []
    try: 
        lap = laps.pick_fastest()
        pos = lap.get_pos_data()
        if pos is not None and not pos.empty:
            circuit_points = [
                {"x": safe_value(r["X"]), "y": safe_value(r["Y"])} 
                for _, r in pos.iterrows()
                if r["X"] is not None and r["Y"] is not None
            ]
    except Exception:
        pass

    return {
        "telemetry": all_tel,
        "position": all_pos,
        "pit_stops": pit_stops,
        "circuit": circuit_points,
    }
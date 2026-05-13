// src/api/f1.ts

import type { Race, Driver, DriverData } from '../types/f1'

const BASE_URL = 'f1-telemetry-production-2b0b.up.railway.app';

async function get<T>(path: string): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json() as Promise<T>;
}

export function getRaces(year: number): Promise<Race[]> {
    return get<Race[]>(`/seasons/${year}/races`);
}

export function getDrivers(year: number, round: number): Promise<Driver[]> {
    return get<Driver[]>(`/seasons/${year}/races/${round}/drivers`);
}

export function getDriverData(year: number, round: number, abbreviation: string): Promise<DriverData> {
    return get<DriverData>(`/seasons/${year}/races/${round}/drivers/${abbreviation}/telemetry`);
}
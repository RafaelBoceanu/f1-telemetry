// src/hooks/useF1Data.ts

import { useState, useEffect } from 'react'
import { getRaces, getDrivers, getDriverData } from '../api/f1'
import type { Race, Driver, DriverData } from '../types/f1'

export function useRaces(year: number) {
    const [races, setRaces] = useState<Race[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        getRaces(year)
            .then(setRaces)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [year]);

    return { races, loading, error };
}

export function useDrivers(year: number, round: number | null) {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!round) return;
        setLoading(true);
        setError(null);
        getDrivers(year, round)
            .then(setDrivers)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [year, round]);

    return { drivers, loading, error };
}

export function useDriverData(year: number, round: number | null, abbreviation: string | null) {
    const [data, setData] = useState<DriverData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!round || !abbreviation) return;
        setLoading(true);
        setError(null);
        setData(null);
        getDriverData(year, round, abbreviation)
            .then(setData)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [year, round, abbreviation]);

    return { data, loading, error };
}

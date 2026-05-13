export interface Race {
    round: number;
    name: string;
    country: string;
    circuit: string;
    date: string;
}

export interface Driver {
    number: string;
    abbreviation: string;
    full_name: string;
    team: string;
    team_colour: string;
}

export interface TelemetryPoint {
    time: number;
    speed: number | null;
    throttle: number | null;
    brake: boolean,
    gear: number | null;
    rpm: number | null;
    drs: number | null;
    lap: number;
}

export interface PositionPoint {
    time: number;
    x: number | null;
    y: number | null;
    lap: number;
}

export interface PitStop {
    lap: number;
    compound: string | null;
}

export interface CircuitPoint {
    x: number;
    y: number;
}

export interface DriverData {
    telemetry: TelemetryPoint[];
    position: PositionPoint[];
    pit_stops: PitStop[];
    circuit: CircuitPoint[];
}
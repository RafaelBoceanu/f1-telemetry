// src/component/TelemetryPanel.tsx

import type { TelemetryPoint } from "../types/f1";

interface Props {
    telemetry: TelemetryPoint[];
    currentTime: number;
}

function findClosest(telemetry: TelemetryPoint[], currentTime: number): TelemetryPoint | null {
    if (!telemetry.length) return null;
    let closest = telemetry[0]
    let minDiff = Math.abs(telemetry[0].time - currentTime);
    for (const t of telemetry) {
        const diff = Math.abs(t.time - currentTime);
        if (diff < minDiff) {
            minDiff = diff;
            closest = t;
        }
    }
    return closest;
}

interface BarProps {
    label: string;
    value: number;
    max: number;
    colour: string;
    unit?: string;
}

function Bar({ label, value, max, colour, unit }: BarProps) {
    const pct = Math.min((value / max) * 100, 100);
    return (
        <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4}}>
                <span style={{ fontSize: 10, letterSpacing: 2, color: '#666', fontFamily: 'Barlow Condensed, sans-serif' }}>
                    {label}
                </span>
                <span style={{ fontSize: 13, fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, color: '#f0f0f0'}}>
                    {typeof value === 'number' ? Math.round(value) : value}{unit ?? ''}
                </span>
            </div>
            <div style={{ height: 4, background: '#1a1a1a', borderRadius: 2 }}>
                <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: colour,
                    borderRadius: 2,
                    transition: 'width 0.1 ease',
                }} />
            </div>
        </div>
    );
}

export function TelemetryPanel({ telemetry, currentTime }: Props) {
    const point = findClosest(telemetry, currentTime);

    if (!point) {
        return (
            <div style={{
                padding: 24, background: '#111', border: '1px solid #1a1a1a',
                color: '#444', fontFamily: 'Barlow Condensed, sans-serif',
                fontSize: 13, letterSpacing: 1, textAlign: 'center'
            }}>
                No telemetry data
            </div>
        );
    }

    const drsActive = point.drs !== null && point.drs >= 10;

    return (
        <div style={{ padding: 24, background: '#111', border: '1px solid #1a1a1a' }}>
            <div style={{
                fontFamily: 'Barlow Condensed, sans-serif', fontSize: 10,
                letterSpacing: 2, color: '#444', marginBottom: 20
            }}>
                TELEMETRY - LAP {point.lap}
            </div>

            {/* Speed */}
            <Bar
                label="SPEED"
                value={point.speed ?? 0}
                max={380}
                colour="#e8002d"
                unit=" km/h"
            />

            {/* Throttle */}
            <Bar
                label="THROTTLE"
                value={point.throttle ?? 0}
                max={100}
                colour="#00c853"
                unit="%"
            />

            {/* Brake */}
            <Bar
                label="BRAKE"
                value={point.brake ? 100 : 0}
                max={100}
                colour="#ff6d00"
            />

            {/* RPM */}
            <Bar
                label="RPM"
                value={point.rpm ?? 0}
                max={15000}
                colour="#aa00ff"
            />

            {/* Gear + DRS */}
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                <div style={{
                    flex: 1, background: '#0a0a0a', border: '1px solid #1a1a1a',
                    padding: '12px 16px', textAlign: 'center'
                }}>
                    <div style={{ fontSize: 10, letterSpacing: 2, color: '#666', fontFamily: 'Barlow Condensed, sans-serif' }}>
                        GEAR
                    </div>
                    <div style={{ fontSize: 40, fontWeight: 800, fontFamily: 'Barlow Condensed, sans-serif', lineHeight: 1.2 }}>
                        {point.gear ?? '-'}
                    </div>
                </div>

                <div style={{
                    flex:1, background: drsActive ? '#00c85322' : '#0a0a0a',
                    border: `1px solid ${drsActive ? '#00c853' : '#1a1a1a'}`,
                    padding: '12px 16px', textAlign: 'center',
                    transition: 'all 0.15s'
                }}>
                    <div style={{ fontSize: 10, letterSpacing: 2, color: '#666', fontFamily: 'Barlow Condensed, sans-serif' }}>
                        DRS
                    </div>
                    <div style={{
                        fontSize: 20, fontWeight: 800, fontFamily: 'Barlow Condensed, sans-serif',
                        lineHeight: 1.2, color: drsActive ? '#00c853' : '#333',
                        marginTop: 8
                    }}>
                        {drsActive ? 'OPEN' : 'CLOSED'}
                    </div>
                </div>
            </div>
        </div>
    );
}
import { useEffect, useRef, useMemo } from "react";
import type { CircuitPoint, PositionPoint } from "../types/f1";

interface Props {
    circuit: CircuitPoint[];
    position: PositionPoint[];
    currentTime: number;
    teamColour: string;
}

function normalise(points: CircuitPoint[], width: number, height: number, padding: number) {
    if (!points.length) return [];
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const scaleX = (width - padding * 2) / (maxX - minX);
    const scaleY = (height - padding * 2) / (maxY - minY)
    const scale = Math.min(scaleX, scaleY);

    const offsetX = (width - (maxX - minX) * scale) / 2 - minX * scale;
    const offsetY = (height - (maxY - minY) * scale) / 2 - minY * scale;

    return points.map(p => ({
        x: p.x * scale + offsetX,
        y: p.y * scale + offsetY,
    }));
}

export function CircuitMap({ circuit = [], position = [], currentTime, teamColour }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const width = 600;
    const height = 400;
    const padding = 40;

    const normalisedCircuit = useMemo(
        () => (circuit.length ? normalise(circuit, width, height, padding) : []),
        [circuit]
    );

    const normalisedPosition = useMemo(() => {
        if (!circuit.length || !position.length) return [];

        const validCircuit = circuit.filter(p => p.x != null && p.y != null);
        if (!validCircuit.length) return [];

        const xs = validCircuit.map(p => p.x);
        const ys = validCircuit.map(p => p.y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        if (maxX === minX || maxY === minY) return [];

        const scaleX = (width - padding * 2) / (maxX - minX);
        const scaleY = (height - padding * 2) / (maxY - minY);
        const scale = Math.min(scaleX, scaleY);

        const offsetX = (width - (maxX - minX) * scale) / 2 - minX * scale;
        const offsetY = (height - (maxY - minY) * scale) / 2 - minY * scale;

        return position
            .filter(p => p.x !== null && p.y !== null)
            .map(p => ({
                time: p.time,
                x: p.x! * scale + offsetX,
                y: p.y! * scale + offsetY,
                lap: p.lap,
            }));
    }, [circuit, position]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, width, height);

        //Background
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);

        //Draw Circuit
        if (normalisedCircuit.length > 1) {
            ctx.beginPath();
            ctx.moveTo(normalisedCircuit[0].x, normalisedCircuit[0].y);
            for (let i = 1; i < normalisedCircuit.length; i++) {
                ctx.lineTo(normalisedCircuit[i].x, normalisedCircuit[i].y);
            }
            ctx.closePath();
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 8;
            ctx.lineJoin = 'round';
            ctx.stroke();

            //White racing line on top
            ctx.beginPath();
            ctx.moveTo(normalisedCircuit[0].x, normalisedCircuit[0].y);
            for (let i = 1; i < normalisedCircuit.length; i++) {
                ctx.lineTo(normalisedCircuit[i].x, normalisedCircuit[i].y);
            }
            ctx.closePath();
            ctx.strokeStyle = '#222';
            ctx.lineWidth = 4;
            ctx.stroke();
        }

        //Find current car position
        if (normalisedPosition.length > 0) {
            let closest = normalisedPosition[0];
            let minDiff = Math.abs(normalisedPosition[0].time - currentTime);
            for (const p of normalisedPosition) {
                const diff = Math.abs(p.time - currentTime);
                if (diff < minDiff) {
                    minDiff = diff;
                    closest = p;
                }
            } 

            const colour = teamColour ? `#${teamColour}` : '#e8002d';

            //Glow
            ctx.beginPath();
            ctx.arc(closest.x, closest.y, 12, 0, Math.PI * 2);
            ctx.fillStyle = colour + '33';
            ctx.fill();

            //Dot
            ctx.beginPath();
            ctx.arc(closest.x, closest.y, 6, 0, Math.PI * 2);
            ctx.fillStyle = colour;
            ctx.fill();

            //White centre
            ctx.beginPath();
            ctx.arc(closest.x, closest.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = 'fff';
            ctx.fill();
        }
    }, [normalisedCircuit, normalisedPosition, currentTime, teamColour]);

    if (!circuit.length) {
        return (
            <div style={{
                width, height, background: '#0a0a0a', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: '#444', fontFamily: 'monospace', fontSize: 13,
                border: '1px solid #1a1a1a'
            }}>
                No circuit data
            </div>
        );
    }

    return (
        <canvas 
            ref={canvasRef}
            width={width}
            height={height}
            style={{ border: '1px solid #1a1a1a', display: 'block' }}
        />
    );
}
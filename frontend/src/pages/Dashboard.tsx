import { useState, useEffect, useRef, useCallback } from 'react';
import { useRaces, useDrivers, useDriverData } from '../hooks/useF1Data';
import { CircuitMap } from '../components/CircuitMap';
import { TelemetryPanel } from '../components/TelemetryPanel';
import { PlaybackControls } from '../components/PlaybackControls';

const YEARS = [2026, 2025, 2024, 2023, 2022];

export default function Dashboard() {
  const [year, setYear] = useState(2026);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const { races, loading: racesLoading } = useRaces(year);
  const { drivers, loading: driversLoading } = useDrivers(year, selectedRound);
  const { data, loading: dataLoading } = useDriverData(year, selectedRound, selectedDriver);

  const rafRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const speedRef = useRef(speed);
  const maxTimeRef = useRef(0);

  const minTime = data?.telemetry?.[0]?.time ?? 0;
  const maxTime = data?.telemetry?.[data.telemetry.length - 1]?.time ?? 0;

  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { maxTimeRef.current = maxTime; }, [maxTime]);

  const currentLap = (() => {
    if (!data?.telemetry?.length) return 1;
    let closest = data.telemetry[0];
    let minDiff = Math.abs(data.telemetry[0].time - currentTime);
    for (const t of data.telemetry) {
      const diff = Math.abs(t.time - currentTime);
      if (diff < minDiff) { minDiff = diff; closest = t; }
    }
    return closest.lap;
  })();

  const totalLaps = data?.telemetry?.[data.telemetry.length - 1]?.lap ?? 0;
  const selectedDriverData = drivers.find(d => d.abbreviation === selectedDriver);

  // Reset on new data
  useEffect(() => {
    if (data) {
      setCurrentTime(minTime);
      setPlaying(false);
    }
  }, [data, minTime]);

  // Playback loop — tick never recreated, reads speed/maxTime from refs
  const tick = useCallback((timestamp: number) => {
    if (lastTimestampRef.current === null) {
      lastTimestampRef.current = timestamp;
    }
    const delta = (timestamp - lastTimestampRef.current) / 1000;
    lastTimestampRef.current = timestamp;

    setCurrentTime(prev => {
      const next = prev + delta * speedRef.current;
      if (next >= maxTimeRef.current) {
        setPlaying(false);
        return maxTimeRef.current;
      }
      return next;
    });

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (playing) {
      lastTimestampRef.current = null;
      rafRef.current = requestAnimationFrame(tick);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, tick]);

  function handleSelectRound(round: number) {
    setSelectedRound(round);
    setSelectedDriver(null);
    setPlaying(false);
  }

  function handleSelectDriver(abbreviation: string) {
    setSelectedDriver(abbreviation);
    setPlaying(false);
  }

  function handlePlayPause() {
    if (currentTime >= maxTime) setCurrentTime(minTime);
    setPlaying(p => !p);
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0a',
      color: '#f0f0f0', fontFamily: 'Barlow, sans-serif',
      padding: '24px 32px'
    }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #1a1a1a',
        paddingBottom: 20, marginBottom: 28
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontWeight: 800, fontSize: 28,
            background: '#e8002d', color: 'white',
            padding: '4px 10px 2px',
            clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)'
          }}>F1</div>
          <div>
            <div style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 700, fontSize: 22, letterSpacing: 2
            }}>RACE TELEMETRY</div>
            <div style={{ fontSize: 11, color: '#444', letterSpacing: 1 }}>
              Powered by FastF1
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {YEARS.map(y => (
            <button key={y} onClick={() => { setYear(y); setSelectedRound(null); setSelectedDriver(null); }}
              style={{
                background: year === y ? '#e8002d' : 'transparent',
                border: `1px solid ${year === y ? '#e8002d' : '#1a1a1a'}`,
                color: year === y ? 'white' : '#666',
                fontFamily: 'Barlow Condensed, sans-serif',
                fontSize: 15, fontWeight: 600,
                padding: '6px 16px', cursor: 'pointer'
              }}>
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Race selector */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontSize: 10, letterSpacing: 2, color: '#444', marginBottom: 10
        }}>SELECT RACE</div>
        {racesLoading ? (
          <div style={{ color: '#444', fontSize: 13 }}>Loading races...</div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {races.map(r => {
              const isPast = new Date(r.date) < new Date();
              return (
                <button key={r.round} onClick={() => isPast && handleSelectRound(r.round)}
                  style={{
                    background: selectedRound === r.round ? 'rgba(232,0,45,0.15)' : '#111',
                    border: `1px solid ${selectedRound === r.round ? '#e8002d' : '#1a1a1a'}`,
                    color: isPast ? '#f0f0f0' : '#333',
                    cursor: isPast ? 'pointer' : 'not-allowed',
                    padding: '8px 14px', textAlign: 'left',
                    fontFamily: 'Barlow Condensed, sans-serif',
                    minWidth: 110,
                    opacity: isPast ? 1 : 0.4,
                  }}>
                  <div style={{ fontSize: 10, color: isPast ? '#444' : '#222', letterSpacing: 1 }}>R{r.round}</div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{r.country}</div>
                  <div style={{ fontSize: 11, color: isPast ? '#666' : '#333' }}>{r.circuit}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Driver selector */}
      {selectedRound && (
        <div style={{ marginBottom: 28 }}>
          <div style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: 10, letterSpacing: 2, color: '#444', marginBottom: 10
          }}>SELECT DRIVER</div>
          {driversLoading ? (
            <div style={{ color: '#444', fontSize: 13 }}>Loading drivers...</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {drivers.map(d => (
                <button key={d.abbreviation} onClick={() => handleSelectDriver(d.abbreviation)}
                  style={{
                    background: selectedDriver === d.abbreviation ? 'rgba(232,0,45,0.15)' : '#111',
                    border: `1px solid ${selectedDriver === d.abbreviation ? `#${d.team_colour}` : '#1a1a1a'}`,
                    color: '#f0f0f0', cursor: 'pointer',
                    padding: '8px 14px', textAlign: 'left',
                    fontFamily: 'Barlow Condensed, sans-serif',
                  }}>
                  <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: 1 }}>{d.abbreviation}</div>
                  <div style={{ fontSize: 11, color: '#666' }}>{d.team}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Loading data */}
      {dataLoading && (
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 16, padding: 60,
          color: '#444', fontFamily: 'Barlow Condensed, sans-serif',
          fontSize: 13, letterSpacing: 2
        }}>
          <div style={{
            width: 32, height: 32,
            border: '2px solid #1a1a1a',
            borderTopColor: '#e8002d',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          LOADING RACE DATA — THIS MAY TAKE A MOMENT
        </div>
      )}

      {/* Main view */}
      {data && !dataLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <CircuitMap
              circuit={data.circuit ?? []}
              position={data.position ?? []}
              currentTime={currentTime}
              teamColour={selectedDriverData?.team_colour ?? ''}
            />
            <div style={{ flex: 1, minWidth: 260 }}>
              <TelemetryPanel
                telemetry={data.telemetry}
                currentTime={currentTime}
              />
            </div>
          </div>
          <PlaybackControls
            currentTime={currentTime}
            minTime={minTime}
            maxTime={maxTime}
            playing={playing}
            speed={speed}
            currentLap={currentLap}
            totalLaps={totalLaps}
            onPlayPause={handlePlayPause}
            onSeek={setCurrentTime}
            onSpeedChange={setSpeed}
          />
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        button:hover { opacity: 0.85; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
// src/components/PlaybackControls.tsx

interface Props {
    currentTime: number;
    minTime: number;
    maxTime: number;
    playing: boolean;
    speed: number;
    currentLap: number;
    totalLaps: number;
    onPlayPause: () => void;
    onSeek: (time: number) => void;
    onSpeedChange: (speed: number) => void;
}

const SPEEDS = [0.5, 1, 2, 5, 10, 25];

export function PlaybackControls({
    currentTime,
    minTime,
    maxTime,
    playing,
    speed,
    currentLap,
    totalLaps,
    onPlayPause,
    onSeek,
    onSpeedChange,
}: Props) {
    const progress = maxTime > minTime
        ? ((currentTime - minTime) / (maxTime - minTime)) * 100
        : 0;

    function formatTime(seconds: number): string {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        return `${m}:${String(s).padStart(2, '0')}`;
    }

    return (
    <div style={{
      background: '#111',
      border: '1px solid #1a1a1a',
      padding: '16px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>

      {/* Scrubber */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontSize: 12, color: '#666', minWidth: 40
        }}>
          {formatTime(currentTime - minTime)}
        </span>
        <div style={{ flex: 1, position: 'relative', height: 20, display: 'flex', alignItems: 'center' }}>
          <div style={{ position: 'absolute', width: '100%', height: 3, background: '#1a1a1a', borderRadius: 2 }} />
          <div style={{
            position: 'absolute', height: 3,
            width: `${progress}%`,
            background: '#e8002d', borderRadius: 2,
            pointerEvents: 'none'
          }} />
          <input
            type="range"
            min={minTime}
            max={maxTime}
            step={0.1}
            value={currentTime}
            onChange={e => onSeek(parseFloat(e.target.value))}
            style={{
              position: 'absolute', width: '100%',
              opacity: 0, cursor: 'pointer', height: 20,
            }}
          />
        </div>
        <span style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontSize: 12, color: '#666', minWidth: 40, textAlign: 'right'
        }}>
          {formatTime(maxTime - minTime)}
        </span>
      </div>

      {/* Controls row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Lap indicator */}
        <div style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontSize: 13, color: '#666', letterSpacing: 1
        }}>
          LAP <span style={{ color: '#f0f0f0', fontWeight: 700 }}>{currentLap}</span>
          <span style={{ color: '#444' }}> / {totalLaps}</span>
        </div>

        {/* Play/Pause */}
        <button
          onClick={onPlayPause}
          style={{
            background: '#e8002d',
            border: 'none',
            color: 'white',
            width: 40, height: 40,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}
        >
          {playing ? '⏸' : '▶'}
        </button>

        {/* Speed selector */}
        <div style={{ display: 'flex', gap: 4 }}>
          {SPEEDS.map(s => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              style={{
                background: speed === s ? '#e8002d' : 'transparent',
                border: `1px solid ${speed === s ? '#e8002d' : '#1a1a1a'}`,
                color: speed === s ? 'white' : '#666',
                fontFamily: 'Barlow Condensed, sans-serif',
                fontSize: 11, fontWeight: 600,
                padding: '4px 8px',
                cursor: 'pointer',
                letterSpacing: 0.5,
              }}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
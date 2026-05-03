import { useEffect, useState } from 'react';

interface Props {
  durationSeconds: number;
  score: number;
  onTimeUp: () => void;
}

export function ChallengeTimer({ durationSeconds, score, onTimeUp }: Props) {
  const [remaining, setRemaining] = useState(durationSeconds);

  useEffect(() => {
    if (remaining <= 0) {
      onTimeUp();
      return;
    }

    const id = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining, onTimeUp]);

  const pct = (remaining / durationSeconds) * 100;
  const color = remaining <= 10 ? '#ff6b6b' : remaining <= 20 ? '#ffe59a' : '#83d68e';

  return (
    <div style={{
      position: 'absolute', top: 10, right: 10, zIndex: 20,
      background: 'rgba(0,0,0,0.88)', border: `2px solid ${color}`,
      padding: '8px 12px', minWidth: 140,
      fontFamily: "'Press Start 2P', monospace",
      pointerEvents: 'none',
    }}>
      <div style={{ color, fontSize: 14, fontWeight: 'bold', marginBottom: 4 }}>
        {String(Math.floor(remaining / 60)).padStart(2, '0')}:{String(remaining % 60).padStart(2, '0')}
      </div>
      <div style={{ background: '#333', height: 5, borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
        <div style={{ background: color, width: `${pct}%`, height: '100%', transition: 'width 1s linear' }} />
      </div>
      <div style={{ color: '#aaa', fontSize: 7 }}>Score: <strong style={{ color: '#fff' }}>{score}</strong></div>
    </div>
  );
}

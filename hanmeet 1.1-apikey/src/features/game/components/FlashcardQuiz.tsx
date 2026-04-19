import React, { useState, useEffect } from 'react';
import { NotebookEntry } from '../../../types/domain';

interface Props {
  entries: NotebookEntry[];
  onClose: () => void;
  onGrade: (id: string, grade: number) => void;
}

export function FlashcardQuiz({ entries, onClose, onGrade }: Props) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);

  const cards = entries.slice(0, 10);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const overlayStyle: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 200, fontFamily: "'Press Start 2P', monospace",
  };

  const panelStyle: React.CSSProperties = {
    background: 'var(--pixel-panel)', border: '4px solid var(--pixel-border)',
    boxShadow: '6px 6px 0 #000', padding: 32,
    minWidth: 340, maxWidth: 440, textAlign: 'center', position: 'relative',
  };

  if (cards.length === 0) {
    return (
      <div style={overlayStyle}>
        <div style={{ ...panelStyle, border: '4px solid var(--pixel-yellow)' }}>
          <div style={{ fontSize: 11, color: 'var(--pixel-yellow)', marginBottom: 16 }}>
            No words in notebook yet!
          </div>
          <div style={{ fontSize: 9, color: 'var(--pixel-text)', marginBottom: 20 }}>
            Explore buildings to learn words first.
          </div>
          <button onClick={onClose} style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: 9,
            padding: '10px 18px', background: 'var(--pixel-accent)',
            border: '3px solid #000', boxShadow: '3px 3px 0 #000',
            color: '#fff', cursor: 'pointer',
          }}>CLOSE</button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div style={overlayStyle}>
        <div style={{ ...panelStyle, border: '4px solid var(--pixel-green)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🎉</div>
          <div style={{ fontSize: 11, color: 'var(--pixel-green)', marginBottom: 20 }}>
            Quiz Complete!
          </div>
          <button onClick={onClose} style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: 9,
            padding: '10px 18px', background: 'var(--pixel-green)',
            border: '3px solid #000', boxShadow: '3px 3px 0 #000',
            color: '#000', cursor: 'pointer',
          }}>BACK TO CITY</button>
        </div>
      </div>
    );
  }

  const card = cards[index];

  const grade = (score: number) => {
    onGrade(card.id, score);
    if (index + 1 >= cards.length) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setRevealed(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={panelStyle}>
        <div style={{ fontSize: 8, color: 'var(--pixel-text)', marginBottom: 20, opacity: 0.6 }}>
          {index + 1} / {cards.length}
        </div>
        <div style={{ fontSize: 40, color: 'var(--pixel-yellow)', marginBottom: 12, letterSpacing: 4 }}>
          {card.chinese}
        </div>
        {revealed ? (
          <>
            <div style={{ fontSize: 12, color: 'var(--pixel-blue)', marginBottom: 8 }}>{card.pinyin}</div>
            <div style={{ fontSize: 10, color: 'var(--pixel-text)', marginBottom: 24 }}>{card.english}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>How well did you know it?</div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => grade(1)} style={{
                fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                padding: '10px', background: 'var(--pixel-accent)',
                border: '3px solid #000', boxShadow: '3px 3px 0 #000',
                color: '#fff', cursor: 'pointer',
              }}>😕 HARD</button>
              <button onClick={() => grade(3)} style={{
                fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                padding: '10px', background: 'var(--pixel-yellow)',
                border: '3px solid #000', boxShadow: '3px 3px 0 #000',
                color: '#000', cursor: 'pointer',
              }}>🤔 OK</button>
              <button onClick={() => grade(5)} style={{
                fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                padding: '10px', background: 'var(--pixel-green)',
                border: '3px solid #000', boxShadow: '3px 3px 0 #000',
                color: '#000', cursor: 'pointer',
              }}>😊 EASY</button>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>
              What does this mean?
            </div>
            <button onClick={() => setRevealed(true)} style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 9,
              padding: '12px 20px', background: 'var(--pixel-blue)',
              border: '3px solid #000', boxShadow: '3px 3px 0 #000',
              color: '#fff', cursor: 'pointer',
            }}>REVEAL ANSWER</button>
          </>
        )}
        <button onClick={onClose} style={{
          position: 'absolute', top: 10, right: 10,
          fontFamily: "'Press Start 2P', monospace", fontSize: 7,
          padding: '6px 8px', background: 'transparent',
          border: '2px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.4)',
          cursor: 'pointer',
        }}>✕</button>
      </div>
    </div>
  );
}

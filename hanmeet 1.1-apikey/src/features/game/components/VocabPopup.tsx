import React, { useEffect } from 'react';
import { InteriorItem } from '../../../types/domain';

interface Props {
  item: InteriorItem;
  onClose: () => void;
  onSave: (item: InteriorItem) => void;
  onSpeak: (text: string) => void;
}

export function VocabPopup({ item, onClose, onSave, onSpeak }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        fontFamily: "'Press Start 2P', monospace",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--pixel-panel)',
          border: '4px solid var(--pixel-border)',
          boxShadow: '6px 6px 0 #000',
          padding: '28px 32px',
          minWidth: 300,
          maxWidth: 420,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 56, marginBottom: 16, lineHeight: 1 }}>{item.icon}</div>
        <div style={{ fontSize: 28, color: 'var(--pixel-yellow)', marginBottom: 8, letterSpacing: 4 }}>
          {item.chinese}
        </div>
        <div style={{ fontSize: 11, color: 'var(--pixel-blue)', marginBottom: 16 }}>
          {item.pinyin}
        </div>
        <div style={{ fontSize: 10, color: 'var(--pixel-text)', marginBottom: 24, opacity: 0.9 }}>
          {item.english}
        </div>
        <div style={{
          display: 'inline-block',
          background: 'var(--pixel-green)',
          color: '#000',
          fontSize: 8,
          padding: '4px 10px',
          border: '2px solid #000',
          marginBottom: 20,
        }}>
          +{item.xp} XP
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => onSpeak(item.chinese)}
            style={{
              fontSize: 8,
              padding: '10px 14px',
              background: 'var(--pixel-blue)',
              border: '3px solid #000',
              boxShadow: '3px 3px 0 #000',
              color: '#fff',
              cursor: 'pointer',
              fontFamily: "'Press Start 2P', monospace",
            }}
          >
            🔊 SPEAK
          </button>
          <button
            onClick={() => { onSave(item); onClose(); }}
            style={{
              fontSize: 8,
              padding: '10px 14px',
              background: 'var(--pixel-green)',
              border: '3px solid #000',
              boxShadow: '3px 3px 0 #000',
              color: '#000',
              cursor: 'pointer',
              fontFamily: "'Press Start 2P', monospace",
            }}
          >
            📒 SAVE
          </button>
          <button
            onClick={onClose}
            style={{
              fontSize: 8,
              padding: '10px 14px',
              background: 'var(--pixel-accent)',
              border: '3px solid #000',
              boxShadow: '3px 3px 0 #000',
              color: '#fff',
              cursor: 'pointer',
              fontFamily: "'Press Start 2P', monospace",
            }}
          >
            ✕ CLOSE
          </button>
        </div>
        <div style={{ marginTop: 14, fontSize: 7, color: 'rgba(255,255,255,0.3)' }}>
          ESC to close
        </div>
      </div>
    </div>
  );
}

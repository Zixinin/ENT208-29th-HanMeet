import React, { useState } from 'react';
import { RoomItem } from '../../../types/domain';
import { normalizePinyin } from '../systems/pinyinUtils';

type QuizFormat = 'pinyin' | 'mc';

interface Props {
  item: RoomItem;
  allItems: RoomItem[];   // pool for MC distractors
  format: QuizFormat;
  onComplete: (correct: boolean) => void;
}

function pickDistractors(correct: RoomItem, allItems: RoomItem[]): string[] {
  const others = allItems
    .filter(i => i.english !== correct.english)
    .map(i => i.english);
  const unique = [...new Set(others)];
  const shuffled = unique.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

export function QuizPopup({ item, allItems, format, onComplete }: Props) {
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);

  const checkPinyin = () => {
    const isCorrect = normalizePinyin(input) === normalizePinyin(item.pinyin);
    setCorrect(isCorrect);
    setSubmitted(true);
  };

  const handleMcChoice = (choice: string) => {
    const isCorrect = choice === item.english;
    setCorrect(isCorrect);
    setSubmitted(true);
  };

  const distractors = format === 'mc'
    ? pickDistractors(item, allItems)
    : [];
  const mcOptions = format === 'mc'
    ? [...distractors, item.english].sort(() => Math.random() - 0.5)
    : [];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#0f0f1a',
        border: `3px solid ${submitted ? (correct ? '#83d68e' : '#ff6b6b') : '#ffe59a'}`,
        padding: 20, minWidth: 280,
        fontFamily: "'Press Start 2P', monospace",
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>

        {format === 'pinyin' && (
          <>
            <div style={{ color: '#aaa', fontSize: 8, marginBottom: 12 }}>
              {item.english} — type the pinyin:
            </div>
            {!submitted ? (
              <>
                <input
                  autoFocus
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') checkPinyin(); }}
                  style={{
                    background: '#1a1a2e', border: '2px solid #4a4a6e',
                    color: '#fff', fontSize: 11, padding: '6px 10px',
                    width: 160, fontFamily: "'Press Start 2P', monospace",
                  }}
                  placeholder="pinyin..."
                />
                <br />
                <button
                  onClick={checkPinyin}
                  style={{
                    marginTop: 10, background: '#ffe59a', color: '#000',
                    border: 'none', padding: '6px 14px', fontSize: 8,
                    fontFamily: "'Press Start 2P', monospace", cursor: 'pointer',
                  }}
                >
                  CHECK ✓
                </button>
              </>
            ) : (
              <div style={{ color: correct ? '#83d68e' : '#ff6b6b', fontSize: 8, marginBottom: 8 }}>
                {correct ? '✓ Correct!' : `✗ Answer: ${item.pinyin}`}
              </div>
            )}
          </>
        )}

        {format === 'mc' && (
          <>
            <div style={{ color: '#fff', fontSize: 14, marginBottom: 4 }}>{item.chinese}</div>
            <div style={{ color: '#aaa', fontSize: 8, marginBottom: 12 }}>What does this mean?</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {mcOptions.map(opt => (
                <button
                  key={opt}
                  disabled={submitted}
                  onClick={() => handleMcChoice(opt)}
                  style={{
                    background: submitted && opt === item.english ? '#83d68e'
                              : submitted && opt === input ? '#ff6b6b'
                              : '#2a2a3e',
                    border: `2px solid ${submitted && opt === item.english ? '#83d68e'
                              : submitted && opt === input ? '#ff6b6b'
                              : '#4a4a6e'}`,
                    color: submitted && opt === item.english ? '#000' : '#fff',
                    padding: '6px 10px', fontSize: 8,
                    fontFamily: "'Press Start 2P', monospace", cursor: submitted ? 'default' : 'pointer',
                  }}
                  onMouseDown={() => { if (!submitted) setInput(opt); }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </>
        )}

        {submitted && (
          <button
            onClick={() => onComplete(correct)}
            style={{
              marginTop: 14, background: '#4a4a6e', color: '#fff',
              border: '2px solid #7a7aae', padding: '6px 14px', fontSize: 8,
              fontFamily: "'Press Start 2P', monospace", cursor: 'pointer',
            }}
          >
            CONTINUE →
          </button>
        )}
      </div>
    </div>
  );
}

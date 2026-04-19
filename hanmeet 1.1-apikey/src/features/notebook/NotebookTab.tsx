import React, { useMemo, useState } from 'react';
import { BookOpen, Check, RotateCcw, Trash2, Volume2, X } from 'lucide-react';
import { NotebookEntry } from '../../types/domain';
import { buildQuizOptions, isDue } from './reviewEngine';

type ReviewMode = 'flashcards' | 'quiz';

interface NotebookTabProps {
  entries: NotebookEntry[];
  onRemove: (id: string) => void;
  onGrade: (id: string, grade: 'again' | 'good' | 'easy') => void;
}

function speak(text: string) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  window.speechSynthesis.speak(utterance);
}

export function NotebookTab({ entries, onRemove, onGrade }: NotebookTabProps) {
  const [mode, setMode] = useState<ReviewMode>('flashcards');
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const dueEntries = useMemo(() => entries.filter((entry) => isDue(entry)), [entries]);
  const quizTarget = dueEntries[0] || entries[0] || null;
  const quizOptions = useMemo(() => {
    if (!quizTarget) return [];
    return buildQuizOptions(entries, quizTarget);
  }, [entries, quizTarget]);

  return (
    <div style={{ minHeight: '100%', background: 'var(--pixel-bg)', color: 'var(--pixel-text)', fontFamily: "'Press Start 2P', monospace", padding: '16px' }}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div style={{ background: 'var(--pixel-panel)', border: '3px solid var(--pixel-border)', boxShadow: '3px 3px 0 #000', padding: 16 }} className="flex items-center justify-between">
          <div>
            <h2 style={{ color: 'var(--pixel-yellow)', fontFamily: "'Press Start 2P', monospace", fontSize: '12px' }} className="flex items-center gap-2"><BookOpen className="w-6 h-6" /> Notebook</h2>
            <p style={{ color: 'var(--pixel-text)', fontSize: '9px' }} className="mt-1 opacity-70">Saved words with lightweight spaced repetition.</p>
          </div>
          <div className="text-right">
            <p style={{ color: 'var(--pixel-text)', fontSize: '9px' }}>Total: <span style={{ color: 'var(--pixel-yellow)' }}>{entries.length}</span></p>
            <p style={{ color: 'var(--pixel-text)', fontSize: '9px' }}>Due today: <span style={{ color: 'var(--pixel-yellow)' }}>{dueEntries.length}</span></p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setMode('flashcards')}
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '8px',
              padding: '8px 12px',
              background: mode === 'flashcards' ? 'var(--pixel-blue)' : 'var(--pixel-panel)',
              border: '3px solid var(--pixel-border)',
              boxShadow: '3px 3px 0 #000',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Flashcards
          </button>
          <button
            onClick={() => setMode('quiz')}
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '8px',
              padding: '8px 12px',
              background: mode === 'quiz' ? 'var(--pixel-blue)' : 'var(--pixel-panel)',
              border: '3px solid var(--pixel-border)',
              boxShadow: '3px 3px 0 #000',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Quiz
          </button>
        </div>

        {mode === 'flashcards' && (
          <div className="space-y-3">
            {entries.length === 0 && (
              <div style={{ background: 'var(--pixel-panel)', border: '3px dashed var(--pixel-border)', padding: '40px', textAlign: 'center', color: 'var(--pixel-text)', fontSize: '9px' }}>
                Your notebook is empty. Explore the game and dictionary to add words.
              </div>
            )}

            {entries.map((entry) => {
              const due = isDue(entry);
              return (
                <div key={entry.id} style={{ background: 'var(--pixel-panel)', border: '3px solid var(--pixel-border)', boxShadow: '3px 3px 0 #000', padding: 16 }} className="flex gap-3 items-center">
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <p style={{ color: 'var(--pixel-yellow)', fontFamily: "'Press Start 2P', monospace", fontSize: '16px' }}>{entry.chinese}</p>
                      <p style={{ color: 'var(--pixel-text)', fontSize: '9px', opacity: 0.6 }}>{entry.pinyin}</p>
                    </div>
                    <p style={{ color: 'var(--pixel-text)', fontSize: '9px' }}>{entry.english}</p>
                    <p style={{ color: 'var(--pixel-text)', fontSize: '8px', opacity: 0.6, marginTop: '4px' }}>
                      Source: {entry.source}{entry.aiGenerated ? ' (AI)' : ''} · Mastery: {entry.mastery} · {due ? 'Due now' : 'Scheduled'}
                    </p>
                  </div>

                  <div className="flex gap-2 items-center">
                    <button onClick={() => speak(entry.chinese)} style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px', padding: '8px', background: 'var(--pixel-blue)', border: '3px solid #000', boxShadow: '3px 3px 0 #000', color: '#fff', cursor: 'pointer' }}><Volume2 className="w-4 h-4" /></button>
                    <button onClick={() => onGrade(entry.id, 'again')} style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px', padding: '8px 12px', background: 'var(--pixel-accent)', border: '3px solid #000', boxShadow: '3px 3px 0 #000', color: '#fff', cursor: 'pointer' }}>Again</button>
                    <button onClick={() => onGrade(entry.id, 'good')} style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px', padding: '8px 12px', background: 'var(--pixel-yellow)', border: '3px solid #000', boxShadow: '3px 3px 0 #000', color: '#000', cursor: 'pointer' }}>Good</button>
                    <button onClick={() => onGrade(entry.id, 'easy')} style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px', padding: '8px 12px', background: 'var(--pixel-green)', border: '3px solid #000', boxShadow: '3px 3px 0 #000', color: '#000', cursor: 'pointer' }}>Easy</button>
                    <button onClick={() => onRemove(entry.id)} style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px', padding: '8px', background: 'var(--pixel-accent)', border: '3px solid #000', boxShadow: '3px 3px 0 #000', color: '#fff', cursor: 'pointer' }}><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {mode === 'quiz' && (
          <div style={{ background: 'var(--pixel-panel)', border: '3px solid var(--pixel-border)', boxShadow: '3px 3px 0 #000', padding: 24 }} className="space-y-4">
            {!quizTarget && <p style={{ color: 'var(--pixel-text)', fontSize: '9px' }}>Add words to start quiz mode.</p>}

            {quizTarget && (
              <>
                <p style={{ color: 'var(--pixel-text)', fontSize: '9px', opacity: 0.6 }}>What is the English meaning?</p>
                <p style={{ color: 'var(--pixel-yellow)', fontFamily: "'Press Start 2P', monospace", fontSize: '24px' }}>{quizTarget.chinese}</p>
                <p style={{ color: 'var(--pixel-text)', fontSize: '9px', opacity: 0.6 }}>{quizTarget.pinyin}</p>

                <div className="grid grid-cols-2 gap-2">
                  {quizOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        if (option === quizTarget.english) {
                          onGrade(quizTarget.id, 'good');
                          setQuizFeedback('Correct! Card moved forward.');
                        } else {
                          onGrade(quizTarget.id, 'again');
                          setQuizFeedback('Not yet. Card scheduled sooner.');
                        }
                      }}
                      style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px', padding: '12px', background: 'var(--pixel-blue)', border: '3px solid #000', boxShadow: '3px 3px 0 #000', color: '#fff', cursor: 'pointer', textAlign: 'left' }}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {quizFeedback && (
                  <div style={{ background: '#0f0f1a', border: '2px solid var(--pixel-border)', padding: '8px 12px', color: 'var(--pixel-text)', fontSize: '9px' }} className="flex items-center justify-between">
                    <span>{quizFeedback}</span>
                    <button onClick={() => setQuizFeedback(null)} style={{ background: 'none', border: 'none', color: 'var(--pixel-text)', cursor: 'pointer' }}><X className="w-4 h-4" /></button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <div style={{ background: 'var(--pixel-panel)', border: '2px solid var(--pixel-border)', padding: '12px', color: 'var(--pixel-text)', fontSize: '8px' }} className="flex gap-4">
          <span className="flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Again = 1 day</span>
          <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Good = 3 days</span>
          <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Easy = 7 days</span>
        </div>
      </div>
    </div>
  );
}

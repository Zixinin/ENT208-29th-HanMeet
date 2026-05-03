import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Check, RotateCcw, Trash2, Volume2, X } from 'lucide-react';
import { NotebookEntry } from '../../types/domain';
import { buildQuizOptions, buildReviewSession, isDue, ReviewGrade } from './reviewEngine';
import { speakMandarin } from '../game/systems/speechSystem';

type ReviewMode = 'review' | 'list' | 'quiz';

interface NotebookTabProps {
  entries: NotebookEntry[];
  onRemove: (id: string) => void;
  onGrade: (id: string, grade: ReviewGrade) => void;
  onReviewComplete?: (xp: number) => void;
}

function speak(text: string) {
  speakMandarin(text);
}

const SESSION_LIMIT = 10;

export function NotebookTab({ entries, onRemove, onGrade, onReviewComplete }: NotebookTabProps) {
  const [mode, setMode] = useState<ReviewMode>('review');
  const [dueOnly, setDueOnly] = useState(true);
  const [sessionIds, setSessionIds] = useState<string[]>([]);
  const [sessionIndex, setSessionIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [sessionRewarded, setSessionRewarded] = useState(false);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const dueEntries = useMemo(() => entries.filter((entry) => isDue(entry)), [entries]);
  const entriesById = useMemo(() => new Map(entries.map((entry) => [entry.id, entry])), [entries]);
  const reviewSession = useMemo(
    () => buildReviewSession(entries, { dueOnly, limit: SESSION_LIMIT }),
    [entries, dueOnly],
  );
  const sessionCards = useMemo(
    () => sessionIds.map((id) => entriesById.get(id)).filter((entry): entry is NotebookEntry => Boolean(entry)),
    [entriesById, sessionIds],
  );
  const quizTarget = dueEntries[0] || entries[0] || null;
  const quizOptions = useMemo(() => {
    if (!quizTarget) return [];
    return buildQuizOptions(entries, quizTarget);
  }, [entries, quizTarget]);

  const startSession = () => {
    setSessionIds(reviewSession.cards.map((entry) => entry.id));
    setSessionIndex(0);
    setRevealed(false);
    setSessionDone(false);
    setReviewedCount(0);
    setSessionRewarded(false);
  };

  useEffect(() => {
    if (mode === 'review') startSession();
    // Session should restart when the source filter changes or cards are added/removed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, dueOnly, entries.length]);

  const activeCard = sessionCards[sessionIndex] || null;

  const gradeActiveCard = (grade: ReviewGrade) => {
    if (!activeCard) return;

    onGrade(activeCard.id, grade);
    const nextReviewedCount = reviewedCount + 1;
    setReviewedCount(nextReviewedCount);

    if (sessionIndex + 1 >= sessionCards.length) {
      setSessionDone(true);
      setRevealed(false);
      if (!sessionRewarded && onReviewComplete && nextReviewedCount > 0) {
        onReviewComplete(Math.min(40, nextReviewedCount * 4));
        setSessionRewarded(true);
      }
      return;
    }

    setSessionIndex((index) => index + 1);
    setRevealed(false);
  };

  const buttonBase: React.CSSProperties = {
    fontFamily: "'Press Start 2P', monospace",
    border: '3px solid #000',
    boxShadow: '3px 3px 0 #000',
    cursor: 'pointer',
  };

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
            onClick={() => setMode('review')}
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '8px',
              padding: '8px 12px',
              background: mode === 'review' ? 'var(--pixel-blue)' : 'var(--pixel-panel)',
              border: '3px solid var(--pixel-border)',
              boxShadow: '3px 3px 0 #000',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Review
          </button>
          <button
            onClick={() => setMode('list')}
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '8px',
              padding: '8px 12px',
              background: mode === 'list' ? 'var(--pixel-blue)' : 'var(--pixel-panel)',
              border: '3px solid var(--pixel-border)',
              boxShadow: '3px 3px 0 #000',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Notebook List
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

        {mode === 'review' && (
          <div style={{ background: 'var(--pixel-panel)', border: '3px solid var(--pixel-border)', boxShadow: '4px 4px 0 #000', padding: 20 }}>
            <div className="flex flex-wrap items-center justify-between gap-3" style={{ marginBottom: 18 }}>
              <div>
                <p style={{ color: 'var(--pixel-yellow)', fontSize: 11, marginBottom: 6 }}>Review Session</p>
                <p style={{ color: 'var(--pixel-text)', fontSize: 8, opacity: 0.65 }}>
                  Due: {reviewSession.dueCount} · Session: {sessionCards.length} cards · Reviewed: {reviewedCount}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 8, color: 'var(--pixel-text)' }}>
                  <input
                    type="checkbox"
                    checked={dueOnly}
                    onChange={(event) => setDueOnly(event.target.checked)}
                  />
                  Due only
                </label>
                <button
                  onClick={startSession}
                  style={{ ...buttonBase, fontSize: 8, padding: '8px 12px', background: 'var(--pixel-blue)', color: '#fff' }}
                >
                  Restart
                </button>
              </div>
            </div>

            {entries.length === 0 && (
              <div style={{ border: '3px dashed var(--pixel-border)', padding: '44px 20px', textAlign: 'center', fontSize: 9, color: 'var(--pixel-text)' }}>
                Your notebook is empty. Explore rooms or use the dictionary to add words.
              </div>
            )}

            {entries.length > 0 && sessionCards.length === 0 && (
              <div style={{ border: '3px dashed var(--pixel-border)', padding: '44px 20px', textAlign: 'center' }}>
                <p style={{ color: 'var(--pixel-green)', fontSize: 12, marginBottom: 12 }}>No due cards right now.</p>
                <p style={{ color: 'var(--pixel-text)', fontSize: 8, opacity: 0.7, marginBottom: 18 }}>
                  Turn off due-only mode to practice ahead.
                </p>
                <button
                  onClick={() => setDueOnly(false)}
                  style={{ ...buttonBase, fontSize: 8, padding: '10px 14px', background: 'var(--pixel-green)', color: '#000' }}
                >
                  Practice All
                </button>
              </div>
            )}

            {sessionDone && (
              <div style={{ border: '4px solid var(--pixel-green)', background: '#0f0f1a', boxShadow: '4px 4px 0 #000', padding: '42px 20px', textAlign: 'center' }}>
                <p style={{ fontSize: 34, marginBottom: 14 }}>★</p>
                <p style={{ color: 'var(--pixel-green)', fontSize: 13, marginBottom: 12 }}>Session Complete</p>
                <p style={{ color: 'var(--pixel-text)', fontSize: 8, opacity: 0.75, marginBottom: 18 }}>
                  Reviewed {reviewedCount} cards{reviewedCount > 0 ? ` · +${Math.min(40, reviewedCount * 4)} XP` : ''}
                </p>
                <button
                  onClick={startSession}
                  style={{ ...buttonBase, fontSize: 8, padding: '10px 14px', background: 'var(--pixel-green)', color: '#000' }}
                >
                  Review Again
                </button>
              </div>
            )}

            {!sessionDone && activeCard && (
              <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
                <div style={{ fontSize: 8, color: 'var(--pixel-text)', opacity: 0.65, marginBottom: 12 }}>
                  Card {sessionIndex + 1} / {sessionCards.length}
                </div>
                <div style={{ border: '4px solid var(--pixel-yellow)', background: '#0f0f1a', boxShadow: '5px 5px 0 #000', padding: '34px 20px', minHeight: 270 }}>
                  <button
                    onClick={() => speak(activeCard.chinese)}
                    aria-label={`Listen to ${activeCard.chinese}`}
                    style={{ ...buttonBase, fontSize: 8, padding: '9px 11px', background: 'var(--pixel-blue)', color: '#fff', marginBottom: 20 }}
                  >
                    <Volume2 className="w-4 h-4 inline-block" />
                  </button>
                  <p style={{ color: 'var(--pixel-yellow)', fontSize: 48, lineHeight: 1.2, marginBottom: 18, wordBreak: 'break-word' }}>
                    {activeCard.chinese}
                  </p>

                  {!revealed && (
                    <>
                      <p style={{ color: 'var(--pixel-text)', fontSize: 9, opacity: 0.55, marginBottom: 24 }}>
                        What does this mean?
                      </p>
                      <button
                        onClick={() => setRevealed(true)}
                        style={{ ...buttonBase, fontSize: 9, padding: '12px 18px', background: 'var(--pixel-blue)', color: '#fff' }}
                      >
                        Reveal Answer
                      </button>
                    </>
                  )}

                  {revealed && (
                    <>
                      <p style={{ color: 'var(--pixel-blue)', fontSize: 12, marginBottom: 10 }}>{activeCard.pinyin}</p>
                      <p style={{ color: 'var(--pixel-text)', fontSize: 12, marginBottom: 22 }}>{activeCard.english}</p>
                      <p style={{ color: 'var(--pixel-text)', fontSize: 8, opacity: 0.55, marginBottom: 14 }}>
                        How well did you know it?
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        <button onClick={() => gradeActiveCard('again')} style={{ ...buttonBase, fontSize: 8, padding: '10px 12px', background: 'var(--pixel-accent)', color: '#fff' }}>
                          Again
                        </button>
                        <button onClick={() => gradeActiveCard('good')} style={{ ...buttonBase, fontSize: 8, padding: '10px 12px', background: 'var(--pixel-yellow)', color: '#000' }}>
                          Good
                        </button>
                        <button onClick={() => gradeActiveCard('easy')} style={{ ...buttonBase, fontSize: 8, padding: '10px 12px', background: 'var(--pixel-green)', color: '#000' }}>
                          Easy
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {mode === 'list' && (
          <div className="space-y-3">
            {entries.length === 0 && (
              <div style={{ background: 'var(--pixel-panel)', border: '3px dashed var(--pixel-border)', padding: '40px', textAlign: 'center', color: 'var(--pixel-text)', fontSize: '9px' }}>
                Your notebook is empty. Explore the game and dictionary to add words.
              </div>
            )}

            {entries.map((entry) => {
              const due = isDue(entry);
              return (
                <div key={entry.id} style={{ background: 'var(--pixel-panel)', border: '3px solid var(--pixel-border)', boxShadow: '3px 3px 0 #000', padding: 16 }} className="flex flex-wrap gap-3 items-center">
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
                    <button aria-label={`Listen to ${entry.chinese}`} onClick={() => speak(entry.chinese)} style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px', padding: '8px', background: 'var(--pixel-blue)', border: '3px solid #000', boxShadow: '3px 3px 0 #000', color: '#fff', cursor: 'pointer' }}><Volume2 className="w-4 h-4" /></button>
                    <button onClick={() => onGrade(entry.id, 'again')} style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px', padding: '8px 12px', background: 'var(--pixel-accent)', border: '3px solid #000', boxShadow: '3px 3px 0 #000', color: '#fff', cursor: 'pointer' }}>Again</button>
                    <button onClick={() => onGrade(entry.id, 'good')} style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px', padding: '8px 12px', background: 'var(--pixel-yellow)', border: '3px solid #000', boxShadow: '3px 3px 0 #000', color: '#000', cursor: 'pointer' }}>Good</button>
                    <button onClick={() => onGrade(entry.id, 'easy')} style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px', padding: '8px 12px', background: 'var(--pixel-green)', border: '3px solid #000', boxShadow: '3px 3px 0 #000', color: '#000', cursor: 'pointer' }}>Easy</button>
                    <button aria-label={`Remove ${entry.chinese}`} onClick={() => onRemove(entry.id)} style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px', padding: '8px', background: 'var(--pixel-accent)', border: '3px solid #000', boxShadow: '3px 3px 0 #000', color: '#fff', cursor: 'pointer' }}><Trash2 className="w-4 h-4" /></button>
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

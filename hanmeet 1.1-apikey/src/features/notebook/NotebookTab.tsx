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
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="bg-white border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] p-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="w-6 h-6" /> Notebook</h2>
          <p className="text-sm opacity-70">Saved words with lightweight spaced repetition.</p>
        </div>
        <div className="text-right text-sm">
          <p>Total: <span className="font-bold">{entries.length}</span></p>
          <p>Due today: <span className="font-bold">{dueEntries.length}</span></p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setMode('flashcards')}
          className={`px-3 py-2 border-2 ${mode === 'flashcards' ? 'bg-black text-white border-black' : 'bg-white border-black'}`}
        >
          Flashcards
        </button>
        <button
          onClick={() => setMode('quiz')}
          className={`px-3 py-2 border-2 ${mode === 'quiz' ? 'bg-black text-white border-black' : 'bg-white border-black'}`}
        >
          Quiz
        </button>
      </div>

      {mode === 'flashcards' && (
        <div className="space-y-3">
          {entries.length === 0 && (
            <div className="bg-white border-4 border-dashed border-zinc-300 p-10 text-center text-zinc-500">
              Your notebook is empty. Explore the game and dictionary to add words.
            </div>
          )}

          {entries.map((entry) => {
            const due = isDue(entry);
            return (
              <div key={entry.id} className="bg-white border-2 border-black p-4 flex gap-3 items-center">
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold">{entry.chinese}</p>
                    <p className="font-mono text-sm opacity-60">{entry.pinyin}</p>
                  </div>
                  <p className="text-sm uppercase tracking-wide">{entry.english}</p>
                  <p className="text-xs opacity-60 mt-1">
                    Source: {entry.source}{entry.aiGenerated ? ' (AI)' : ''} · Mastery: {entry.mastery} · {due ? 'Due now' : 'Scheduled'}
                  </p>
                </div>

                <div className="flex gap-2 items-center">
                  <button onClick={() => speak(entry.chinese)} className="p-2 border border-black hover:bg-zinc-100"><Volume2 className="w-4 h-4" /></button>
                  <button onClick={() => onGrade(entry.id, 'again')} className="px-2 py-1 border border-red-700 text-red-700 text-xs">Again</button>
                  <button onClick={() => onGrade(entry.id, 'good')} className="px-2 py-1 border border-amber-700 text-amber-700 text-xs">Good</button>
                  <button onClick={() => onGrade(entry.id, 'easy')} className="px-2 py-1 border border-emerald-700 text-emerald-700 text-xs">Easy</button>
                  <button onClick={() => onRemove(entry.id)} className="p-2 border border-black hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {mode === 'quiz' && (
        <div className="bg-white border-4 border-black p-6 space-y-4 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
          {!quizTarget && <p className="text-zinc-500">Add words to start quiz mode.</p>}

          {quizTarget && (
            <>
              <p className="text-sm uppercase opacity-60">What is the English meaning?</p>
              <p className="text-4xl font-bold">{quizTarget.chinese}</p>
              <p className="font-mono text-zinc-500">{quizTarget.pinyin}</p>

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
                    className="p-3 border-2 border-black hover:bg-zinc-100 text-left"
                  >
                    {option}
                  </button>
                ))}
              </div>

              {quizFeedback && (
                <div className="text-sm bg-zinc-100 border border-zinc-300 px-3 py-2 flex items-center justify-between">
                  <span>{quizFeedback}</span>
                  <button onClick={() => setQuizFeedback(null)}><X className="w-4 h-4" /></button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div className="bg-zinc-50 border border-zinc-300 p-3 text-xs text-zinc-600 flex gap-4">
        <span className="flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Again = 1 day</span>
        <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Good = 3 days</span>
        <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Easy = 7 days</span>
      </div>
    </div>
  );
}

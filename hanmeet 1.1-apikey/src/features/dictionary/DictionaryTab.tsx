import React, { useMemo, useState } from 'react';
import { Loader2, Plus, Search, Volume2 } from 'lucide-react';
import { ITEMS } from '../game/data';

interface DictionaryResult {
  chinese: string;
  pinyin: string;
  english: string;
  example?: string;
  aiGenerated: boolean;
}

interface DictionaryTabProps {
  onAddNotebook: (result: DictionaryResult) => void;
}

function getDictionaryProxyUrl(): string | null {
  const explicit = import.meta.env.VITE_DICTIONARY_PROXY_URL;
  if (explicit && typeof explicit === 'string' && explicit.trim().length > 0) {
    return explicit.trim();
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl || typeof supabaseUrl !== 'string') return null;
  return `${supabaseUrl.replace(/\/$/, '')}/functions/v1/dictionary-proxy`;
}

function speak(text: string) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  window.speechSynthesis.speak(utterance);
}

export function DictionaryTab({ onAddNotebook }: DictionaryTabProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState<DictionaryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const localResults = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];
    return ITEMS.filter((item) => item.english.toLowerCase().includes(trimmed)).slice(0, 12).map((item) => ({
      chinese: item.chinese,
      pinyin: item.pinyin,
      english: item.english,
      aiGenerated: false,
    }));
  }, [query]);

  const runAiLookup = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const proxyUrl = getDictionaryProxyUrl();

    if (!proxyUrl) {
      setError('AI proxy not configured. Set VITE_SUPABASE_URL or VITE_DICTIONARY_PROXY_URL.');
      return;
    }

    setLoading(true);
    setError(null);
    setAiResult(null);

    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 10000);
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (anonKey && typeof anonKey === 'string') {
        headers.apikey = anonKey;
        headers.Authorization = `Bearer ${anonKey}`;
      }
      let response: Response;
      try {
        response = await fetch(proxyUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({ query: trimmed }),
          signal: controller.signal,
        });
      } finally {
        window.clearTimeout(timeoutId);
      }

      const parsed = (await response.json()) as {
        error?: string;
        english?: string;
        chinese?: string;
        pinyin?: string;
        example?: string;
      };

      if (!response.ok) {
        setError(parsed.error || 'AI lookup failed. Please try another word.');
        return;
      }

      setAiResult({
        english: parsed.english || trimmed,
        chinese: parsed.chinese || '未知',
        pinyin: parsed.pinyin || '',
        example: parsed.example || '',
        aiGenerated: true,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setError('AI lookup timed out. Please try again.');
      } else {
        setError('AI lookup failed. Please try another word.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div className="bg-white border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] p-5">
        <h2 className="text-2xl font-bold">Dictionary</h2>
        <p className="text-sm opacity-70">Local vocab first, then AI fallback with example sentence.</p>

        <div className="mt-4 flex gap-2">
          <div className="flex-1 relative">
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setAiResult(null);
                setError(null);
              }}
              placeholder="Search English word..."
              className="w-full px-4 py-3 border-2 border-black focus:outline-none"
            />
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 opacity-50" />
          </div>
          <button
            onClick={runAiLookup}
            className="px-4 py-3 border-2 border-black bg-black text-white hover:bg-zinc-800"
          >
            AI Lookup
          </button>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      <div className="space-y-3">
        {localResults.length > 0 && (
          <>
            <p className="text-xs uppercase tracking-wide opacity-60">Local Results</p>
            {localResults.map((result, index) => (
              <div key={`${result.english}-${index}`} className="bg-white border-2 border-black p-4 flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{result.chinese}</p>
                  <p className="font-mono text-sm opacity-60">{result.pinyin}</p>
                  <p className="uppercase tracking-wide text-sm">{result.english}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => speak(result.chinese)} className="p-2 border border-black"><Volume2 className="w-4 h-4" /></button>
                  <button onClick={() => onAddNotebook(result)} className="p-2 border border-black"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </>
        )}

        {loading && (
          <div className="bg-white border-2 border-black p-8 text-center flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Searching AI...
          </div>
        )}

        {aiResult && (
          <div className="bg-gradient-to-br from-white to-pink-50 border-4 border-pink-600 p-4">
            <p className="text-xs uppercase tracking-wide text-pink-700">AI Result</p>
            <p className="text-3xl font-bold">{aiResult.chinese}</p>
            <p className="font-mono text-sm opacity-60">{aiResult.pinyin}</p>
            <p className="uppercase tracking-wide text-sm">{aiResult.english}</p>
            {aiResult.example && (
              <p className="text-sm mt-2 bg-white border border-pink-200 p-2">Example: {aiResult.example}</p>
            )}
            <div className="mt-3 flex gap-2">
              <button onClick={() => speak(aiResult.chinese)} className="px-3 py-2 border border-black bg-white flex items-center gap-1"><Volume2 className="w-4 h-4" /> Listen</button>
              <button onClick={() => onAddNotebook(aiResult)} className="px-3 py-2 border border-black bg-black text-white flex items-center gap-1"><Plus className="w-4 h-4" /> Add to Notebook</button>
            </div>
          </div>
        )}

        {!loading && !aiResult && localResults.length === 0 && query.trim() && (
          <div className="bg-white border-2 border-dashed border-zinc-300 p-8 text-center text-zinc-500">
            No local result. Try AI Lookup.
          </div>
        )}
      </div>
    </div>
  );
}

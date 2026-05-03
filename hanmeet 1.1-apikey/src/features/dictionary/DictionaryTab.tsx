import React, { useMemo, useState } from 'react';
import { Loader2, Plus, Search, Volume2 } from 'lucide-react';
import { ITEMS } from '../game/data';
import { speakMandarin } from '../game/systems/speechSystem';

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
  speakMandarin(text);
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
    <div style={{ minHeight: '100%', background: 'var(--pixel-bg)', color: 'var(--pixel-text)', fontFamily: "'Press Start 2P', monospace", padding: '16px' }}>
      <div className="max-w-3xl mx-auto space-y-5">
        <div style={{ background: 'var(--pixel-panel)', border: '3px solid var(--pixel-border)', boxShadow: '3px 3px 0 #000', padding: 20 }}>
          <h2 style={{ color: 'var(--pixel-yellow)', fontFamily: "'Press Start 2P', monospace", fontSize: '12px' }}>Dictionary</h2>
          <p style={{ color: 'var(--pixel-text)', fontSize: '9px' }} className="mt-1 opacity-70">Local vocab first, then AI fallback with example sentence.</p>

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
                style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px', background: '#0f0f1a', border: '2px solid var(--pixel-border)', color: 'var(--pixel-text)', padding: '8px' }}
                className="w-full focus:outline-none"
              />
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 opacity-50" />
            </div>
            <button
              onClick={runAiLookup}
              style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px', padding: '8px 12px', background: 'var(--pixel-blue)', border: '3px solid #000', boxShadow: '3px 3px 0 #000', color: '#fff', cursor: 'pointer' }}
            >
              AI Lookup
            </button>
          </div>

          {error && <p style={{ color: 'var(--pixel-accent)', fontSize: '9px' }} className="mt-3">{error}</p>}
        </div>

        <div className="space-y-3">
          {localResults.length > 0 && (
            <>
              <p style={{ color: 'var(--pixel-text)', fontSize: '8px' }} className="opacity-60">Local Results</p>
              {localResults.map((result, index) => (
                <div key={`${result.english}-${index}`} style={{ background: 'var(--pixel-panel)', border: '3px solid var(--pixel-border)', boxShadow: '3px 3px 0 #000', padding: 16 }} className="flex items-center justify-between">
                  <div>
                    <p style={{ color: 'var(--pixel-yellow)', fontFamily: "'Press Start 2P', monospace", fontSize: '16px' }}>{result.chinese}</p>
                    <p style={{ color: 'var(--pixel-text)', fontSize: '9px', opacity: 0.6 }}>{result.pinyin}</p>
                    <p style={{ color: 'var(--pixel-text)', fontSize: '9px' }}>{result.english}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => speak(result.chinese)} style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px', padding: '8px', background: 'var(--pixel-blue)', border: '3px solid #000', boxShadow: '3px 3px 0 #000', color: '#fff', cursor: 'pointer' }}><Volume2 className="w-4 h-4" /></button>
                    <button onClick={() => onAddNotebook(result)} style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px', padding: '8px', background: 'var(--pixel-green)', border: '3px solid #000', boxShadow: '3px 3px 0 #000', color: '#000', cursor: 'pointer' }}><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </>
          )}

          {loading && (
            <div style={{ background: 'var(--pixel-panel)', border: '3px solid var(--pixel-border)', boxShadow: '3px 3px 0 #000', padding: '32px', textAlign: 'center', color: 'var(--pixel-text)', fontSize: '9px' }} className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Searching AI...
            </div>
          )}

          {aiResult && (
            <div style={{ background: 'var(--pixel-panel)', border: '3px solid var(--pixel-accent)', boxShadow: '3px 3px 0 #000', padding: 16 }}>
              <p style={{ color: 'var(--pixel-accent)', fontSize: '8px' }}>AI Result</p>
              <p style={{ color: 'var(--pixel-yellow)', fontFamily: "'Press Start 2P', monospace", fontSize: '20px' }} className="mt-1">{aiResult.chinese}</p>
              <p style={{ color: 'var(--pixel-text)', fontSize: '9px', opacity: 0.6 }}>{aiResult.pinyin}</p>
              <p style={{ color: 'var(--pixel-text)', fontSize: '9px' }}>{aiResult.english}</p>
              {aiResult.example && (
                <p style={{ color: 'var(--pixel-text)', fontSize: '9px', background: '#0f0f1a', border: '2px solid var(--pixel-border)', padding: '8px', marginTop: '8px' }}>Example: {aiResult.example}</p>
              )}
              <div className="mt-3 flex gap-2">
                <button onClick={() => speak(aiResult.chinese)} style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px', padding: '8px 12px', background: 'var(--pixel-blue)', border: '3px solid #000', boxShadow: '3px 3px 0 #000', color: '#fff', cursor: 'pointer' }} className="flex items-center gap-1"><Volume2 className="w-4 h-4" /> Listen</button>
                <button onClick={() => onAddNotebook(aiResult)} style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px', padding: '8px 12px', background: 'var(--pixel-green)', border: '3px solid #000', boxShadow: '3px 3px 0 #000', color: '#000', cursor: 'pointer' }} className="flex items-center gap-1"><Plus className="w-4 h-4" /> Add to Notebook</button>
              </div>
            </div>
          )}

          {!loading && !aiResult && localResults.length === 0 && query.trim() && (
            <div style={{ background: 'var(--pixel-panel)', border: '3px dashed var(--pixel-border)', padding: '32px', textAlign: 'center', color: 'var(--pixel-text)', fontSize: '9px' }}>
              No local result. Try AI Lookup.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

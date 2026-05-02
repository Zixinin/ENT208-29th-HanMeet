// Supabase Edge Function: dictionary-proxy
// Expects POST { query: string } and returns JSON:
// { english, chinese, pinyin, example }

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProxyResponse {
  english: string;
  chinese: string;
  pinyin: string;
  example: string;
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function coerceResult(raw: unknown, fallbackEnglish: string): ProxyResponse {
  if (!raw || typeof raw !== 'object') {
    return {
      english: fallbackEnglish,
      chinese: '未知',
      pinyin: '',
      example: '',
    };
  }

  const candidate = raw as Record<string, unknown>;
  return {
    english:
      typeof candidate.english === 'string' && candidate.english.trim().length > 0
        ? candidate.english.trim()
        : fallbackEnglish,
    chinese:
      typeof candidate.chinese === 'string' && candidate.chinese.trim().length > 0
        ? candidate.chinese.trim()
        : '未知',
    pinyin: typeof candidate.pinyin === 'string' ? candidate.pinyin.trim() : '',
    example: typeof candidate.example === 'string' ? candidate.example.trim() : '',
  };
}

async function runGeminiLookup(query: string, apiKey: string): Promise<ProxyResponse> {
  const prompt = `You are a Chinese learning dictionary.
Return JSON only with shape {"english":"...","chinese":"...","pinyin":"...","example":"..."}.
Give one short beginner-safe example sentence in Chinese.
English word: ${query}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Gemini request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    };

    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
    let parsed: unknown = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {};
    }

    return coerceResult(parsed, query);
  } finally {
    clearTimeout(timeoutId);
  }
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed.' });
  }

  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    return jsonResponse(500, { error: 'Server is not configured for AI lookup.' });
  }

  try {
    const body = (await request.json()) as { query?: unknown };
    const query = typeof body?.query === 'string' ? body.query.trim() : '';

    if (!query) {
      return jsonResponse(400, { error: 'Query is required.' });
    }
    if (query.length > 80) {
      return jsonResponse(400, { error: 'Query is too long.' });
    }

    const result = await runGeminiLookup(query, apiKey);
    return jsonResponse(200, result);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return jsonResponse(504, { error: 'AI lookup timed out. Please try again.' });
    }
    return jsonResponse(502, { error: 'AI lookup failed. Please try another word.' });
  }
});


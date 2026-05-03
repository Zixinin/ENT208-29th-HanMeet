export interface ProxyResponse {
  english: string;
  chinese: string;
  pinyin: string;
  example: string;
}

function readString(candidate: Record<string, unknown>, key: keyof ProxyResponse): string {
  const value = candidate[key];
  return typeof value === 'string' ? value.trim() : '';
}

export function parseDictionaryJson(text: string, fallbackEnglish: string): ProxyResponse {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('AI lookup did not return valid JSON.');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('AI lookup did not return a dictionary object.');
  }

  const candidate = parsed as Record<string, unknown>;
  const result = {
    english: readString(candidate, 'english') || fallbackEnglish,
    chinese: readString(candidate, 'chinese'),
    pinyin: readString(candidate, 'pinyin'),
    example: readString(candidate, 'example'),
  };

  if (!result.chinese || result.chinese === '未知') {
    throw new Error('AI lookup did not return a valid Chinese translation.');
  }

  return result;
}

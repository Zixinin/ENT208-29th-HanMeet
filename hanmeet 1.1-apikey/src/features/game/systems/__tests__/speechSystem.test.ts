import assert from 'node:assert/strict';
import { getPreferredMandarinVoice } from '../speechSystem';

const voices = [
  { name: 'English US', lang: 'en-US' },
  { name: 'Chinese Taiwan', lang: 'zh-TW' },
  { name: 'Chinese Mainland', lang: 'zh-CN' },
] as SpeechSynthesisVoice[];

assert.equal(getPreferredMandarinVoice(voices)?.lang, 'zh-CN');
assert.equal(getPreferredMandarinVoice(voices.slice(0, 2))?.lang, 'zh-TW');
assert.equal(getPreferredMandarinVoice([]), null);

console.log('speechSystem tests passed');

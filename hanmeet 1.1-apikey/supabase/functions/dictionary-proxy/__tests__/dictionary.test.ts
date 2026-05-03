import assert from 'node:assert/strict';
import { parseDictionaryJson } from '../dictionary.ts';

assert.deepEqual(parseDictionaryJson('{"english":"apple","chinese":"苹果","pinyin":"píngguǒ","example":"我吃苹果。"}', 'apple'), {
  english: 'apple',
  chinese: '苹果',
  pinyin: 'píngguǒ',
  example: '我吃苹果。',
});

assert.throws(() => parseDictionaryJson('{"english":"apple","chinese":"未知","pinyin":"","example":""}', 'apple'), /valid Chinese translation/);
assert.throws(() => parseDictionaryJson('{}', 'apple'), /valid Chinese translation/);
assert.throws(() => parseDictionaryJson('not json', 'apple'), /valid JSON/);

console.log('dictionary proxy tests passed');

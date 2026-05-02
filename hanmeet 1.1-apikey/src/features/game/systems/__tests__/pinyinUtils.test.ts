import assert from 'node:assert/strict';
import { normalizePinyin } from '../pinyinUtils';

// Tone marks stripped
assert.equal(normalizePinyin('diànshì'), 'dianshi');
assert.equal(normalizePinyin('kāfēi'), 'kafei');
assert.equal(normalizePinyin('yǐzi'), 'yizi');
assert.equal(normalizePinyin('chá'), 'cha');

// Case insensitive
assert.equal(normalizePinyin('Dianshi'), 'dianshi');
assert.equal(normalizePinyin('KAFEI'), 'kafei');

// Trims whitespace
assert.equal(normalizePinyin('  dianshi  '), 'dianshi');

// Spaces preserved (multi-syllable pinyin)
assert.equal(normalizePinyin('dà zhuōzi'), 'da zhuozi');

console.log('pinyinUtils tests passed ✓');

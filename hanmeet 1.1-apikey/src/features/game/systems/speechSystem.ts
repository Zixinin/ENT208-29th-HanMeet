export function getPreferredMandarinVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  return (
    voices.find((voice) => voice.lang.toLowerCase() === 'zh-cn') ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith('zh-')) ||
    null
  );
}

export function speakMandarin(text: string): boolean {
  if (typeof window === 'undefined') return false;

  const synthesis = window.speechSynthesis;
  const Utterance = window.SpeechSynthesisUtterance;
  if (!synthesis || !Utterance) {
    console.warn('Speech synthesis is not supported in this browser.');
    return false;
  }

  const utterance = new Utterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = 0.85;

  const voice = getPreferredMandarinVoice(synthesis.getVoices());
  if (voice) utterance.voice = voice;

  utterance.onerror = (event) => {
    console.warn('Speech synthesis failed:', event.error);
  };

  synthesis.cancel();
  synthesis.speak(utterance);
  return true;
}

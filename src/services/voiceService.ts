/**
 * Web Speech API Voice Synthesizer for Senior Accessibility with Multi-Language Support
 */

const LANGUAGE_BCP_MAP: Record<string, string> = {
  en: 'en-US',
  ta: 'ta-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  es: 'es-ES',
};

export function speakText(
  text: string,
  onEnd?: () => void,
  lang: string = 'en'
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('[VoiceService] Web Speech API not supported in this browser.');
    return false;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const targetBcp = LANGUAGE_BCP_MAP[lang] || lang || 'en-US';
  const langPrefix = lang.split('-')[0].toLowerCase();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = targetBcp;
  utterance.rate = 0.88; // Slightly slower, clear cadence for elderly comprehension
  utterance.pitch = 1.05; // Gentle, friendly pitch
  utterance.volume = 1.0;

  // Try to pick a natural voice in the target language
  const voices = window.speechSynthesis.getVoices();
  const matchingVoice =
    voices.find(
      (v) =>
        v.lang.toLowerCase() === targetBcp.toLowerCase() ||
        v.lang.toLowerCase().startsWith(langPrefix)
    ) ||
    voices.find((v) => v.lang.startsWith('en'));

  if (matchingVoice) {
    utterance.voice = matchingVoice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
  }

  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

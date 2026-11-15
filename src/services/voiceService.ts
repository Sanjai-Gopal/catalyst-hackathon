/**
 * Web Speech API Voice Synthesizer for Senior Accessibility with Multi-Language Support
 * High-performance, low-latency client-side speech engine
 */

const LANGUAGE_BCP_MAP: Record<string, string> = {
  en: 'en-US',
  ta: 'ta-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  es: 'es-ES',
}

// Fast local speech cache to eliminate network waiting
const speechGuidanceCache = new Map<string, string>()

/**
 * Returns an instant, affectionate localized explanation (0ms latency)
 */
export function getInstantElderVoiceTemplate(
  medName: string,
  instructions: string,
  honorific: string = 'Amma',
  lang: string = 'en'
): string {
  const cacheKey = `${lang}:${honorific}:${medName}`
  if (speechGuidanceCache.has(cacheKey)) {
    return speechGuidanceCache.get(cacheKey)!
  }

  let text: string
  switch (lang) {
    case 'ta':
      text = `${honorific}, உங்கள் ${medName} மருந்தை குறித்த நேரத்தில் எடுத்துக் கொள்ளுங்கள். குறிப்பு: ${instructions}. உடல் நலனை கவனித்துக் கொள்ளுங்கள்!`
      break
    case 'hi':
      text = `${honorific}, कृपया अपनी ${medName} दवा समय पर ले लीजिए। निर्देश: ${instructions}। अपनी सेहत का ख्याल रखिए!`
      break
    case 'te':
      text = `${honorific}, దయచేసి మీ ${medName} మందును సమయానికి తీసుకోండి. సూచన: ${instructions}. ఆరోగ్యాన్ని జాగ్రత్తగా చూసుకోండి!`
      break
    case 'kn':
      text = `${honorific}, ದಯವಿಟ್ಟು ನಿಮ್ಮ ${medName} ಔಷಧಿಯನ್ನು ಸಮಯಕ್ಕೆ ತೆಗೆದುಕೊಳ್ಳಿ. ಸೂಚನೆ: ${instructions}. ಆರೋಗ್ಯದ ಬಗ್ಗೆ ಕಾಳಜಿ ವಹಿಸಿ!`
      break
    case 'ml':
      text = `${honorific}, ദയവായി നിങ്ങളുടെ ${medName} മരുന്ന് കൃത്യസമയത്ത് കഴിക്കൂ. നിർദ്ദേശം: ${instructions}. ആരോഗ്യം ശ്രദ്ധിക്കൂ!`
      break
    case 'es':
      text = `${honorific}, por favor tome su medicamento ${medName} a tiempo. Instrucciones: ${instructions}. ¡Cuide mucho su salud!`
      break
    default:
      text = `${honorific}, please take your ${medName} medication on time. Remember: ${instructions}. Take gentle care of your health!`
  }

  speechGuidanceCache.set(cacheKey, text)
  return text
}

/**
 * Store an enhanced Gemini response into the fast cache
 */
export function cacheVoiceExplanation(
  medName: string,
  honorific: string,
  lang: string,
  explanation: string
): void {
  const cacheKey = `${lang}:${honorific}:${medName}`
  speechGuidanceCache.set(cacheKey, explanation)
}

/**
 * High-speed speech synthesis with selectable speed and warm voice caching
 */
export function speakText(
  text: string,
  onEnd?: () => void,
  lang: string = 'en',
  rate: number = 0.95
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('[VoiceService] Web Speech API not supported in this browser.')
    return false
  }

  // Cancel any ongoing speech for instant responsiveness
  window.speechSynthesis.cancel()

  const targetBcp = LANGUAGE_BCP_MAP[lang] || lang || 'en-US'
  const langPrefix = lang.split('-')[0].toLowerCase()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = targetBcp
  utterance.rate = rate // Default 0.95: clear cadence for elderly comprehension
  utterance.pitch = 1.05 // Gentle, friendly, supportive tone
  utterance.volume = 1.0

  // Pick the most natural voice available for the target language
  const voices = window.speechSynthesis.getVoices()
  const matchingVoice =
    voices.find(
      (v) =>
        v.lang.toLowerCase() === targetBcp.toLowerCase() ||
        v.lang.toLowerCase().startsWith(langPrefix)
    ) || voices.find((v) => v.lang.startsWith('en'))

  if (matchingVoice) {
    utterance.voice = matchingVoice
  }

  if (onEnd) {
    utterance.onend = onEnd
    utterance.onerror = () => onEnd()
  }

  window.speechSynthesis.speak(utterance)
  return true
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}

export function isSpeaking(): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false
  }
  return window.speechSynthesis.speaking
}

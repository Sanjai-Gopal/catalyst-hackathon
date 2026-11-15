/**
 * Web Speech API Voice Recognition Service for Senior Voice Commands
 * Supports: English, Tamil, Hindi, Telugu, Kannada, Malayalam, Spanish
 * Zero-latency local command matching with instant audio response
 */

type VoiceIntentType =
  | 'MARK_TAKEN'
  | 'READ_SCHEDULE'
  | 'CALL_CHILD'
  | 'CALL_DOCTOR'
  | 'HELP_QUERY'
  | 'UNKNOWN'

export interface ParsedVoiceCommand {
  intent: VoiceIntentType
  transcript: string
  confidence: number
  medicationMentioned?: string
  slotMentioned?: 'morning' | 'afternoon' | 'evening' | 'night'
  /** True when the speaker said they have NOT taken their medicine (e.g. "not yet"). */
  negated?: boolean
}

const LANGUAGE_BCP_MAP: Record<string, string> = {
  en: 'en-IN',
  ta: 'ta-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  es: 'es-ES',
}

/**
 * Whole-word matcher for Latin-script words. Plain /took/ also matches "mistook",
 * /done/ matches "abandoned" and /sos/ matches "Sosa". Unicode-aware so accented
 * Spanish words ("tomé") are handled. Non-Latin scripts use plain patterns because
 * \b does not work for them.
 */
const w = (word: string): RegExp =>
  new RegExp(`(?<![\\p{L}\\p{N}])${word}(?![\\p{L}\\p{N}])`, 'iu')

// Words that turn "I took my medicine" into "I did NOT take it". Checked only
// together with a MARK_TAKEN match so a negation never logs a dose.
const NEGATION_PATTERNS: RegExp[] = [
  // English
  w('not'),
  /n't/i,
  w('never'),
  w('yet'),
  w('no'),
  w('without'),
  // Spanish
  w('nunca'),
  w('todavía'),
  w('aún'),
  // Hindi
  /नहीं/,
  /अभी\s*नहीं/,
  // Tamil
  /இல்லை/,
  /இல்ல/,
  /இன்னும்/,
  // Telugu
  /లేదు/,
  /ఇంకా/,
  // Kannada
  /ಇಲ್ಲ/,
  /ಇನ್ನೂ/,
  // Malayalam
  /ഇല്ല/,
  /ഇതുവരെ/,
]

// Distress words. A SHORT utterance containing one of these is treated as an
// emergency; in a longer sentence ("can you help me find my glasses") it is not.
const HELP_WORDS: RegExp[] = [
  w('help'),
  w('ayuda'),
  w('socorro'),
  /உதவி/,
  /सहायता/,
  /मदद/,
  /సహాయం/,
  /ಸಹಾಯ/,
  /സഹായം/,
]

const EMERGENCY_PATTERNS: RegExp[] = [
  w('emergency'),
  w('sos'),
  w('emergencia'),
  /call.{0,15}\b(child|son|daughter|family|kid)\b/i,
  // Tamil
  /அவசரம்/,
  // Stems (மகன / மகள / பிள்ள) so inflected forms like "மகனுக்கு" ("to the son") match.
  /(மகன|மகள|பிள்ள).*(போன்|கூப்பிடு|அழை)/,
  /(போன்|கூப்பிடு).*(மகன|மகள|பிள்ள)/,
  /போன்.*பண்ணு/,
  // Hindi
  /इमरजेंसी/,
  /बेटे.*कॉल/,
  /फोन.*लगाओ/,
  /कॉल.*करो/,
  // Telugu
  /(కొడుకు|కూతురు).*(ఫోన్|కాల్)/,
  /ఫోన్.*చేయి/,
  // Kannada
  /ಮಗನಿಗೆ.*ಕರೆ/,
  // Malayalam
  /മകനെ.*വിളിക്കൂ/,
  // Spanish
  /llamar.{0,15}hijo/i,
]

const DOCTOR_PATTERNS: RegExp[] = [
  w('doctor'),
  w('clinic'),
  w('hospital'),
  /\bdr\./i,
  w('médico'),
  /டாக்டர்/,
  /மருத்துவர்/,
  /ஆஸ்பத்திரி/,
  /डॉक्टर/,
  /हस्पताल/,
  /డాక్టర్/,
  /ವೈದ್ಯ/,
  /ഡോക്ടർ/,
]

const MARK_TAKEN_PATTERNS: RegExp[] = [
  w('took'),
  w('taken'),
  w('done'),
  /\bhad my\b/i,
  w('finished'),
  w('consumed'),
  /\bmark\b.*\btaken\b/i,
  // Tamil
  /சாப்பிட்டேன்/,
  /சாப்டேன்/,
  /மாத்திரை.*போட்டேன்/,
  /மருந்து.*எடுத்தேன்/,
  /எடுத்தாச்சு/,
  /முடிந்தது/,
  // Hindi (the old /हो.*गया/ matched "मुझे बुखार हो गया" — "I got a fever")
  /दवा.*ली/,
  /खा.*ली/,
  /गोली.*ली/,
  /दवा.*हो\s*गया/,
  /ले\s*लिया/,
  // Telugu
  /వేసుకున్నాను/,
  /తీసుకున్నాను/,
  /మందు.*వేశా/,
  // Kannada
  /ತೆಗೆದುಕೊಂಡೆ/,
  /ತಗೊಂಡೆ/,
  // Malayalam
  /കഴിച്ചു/,
  /എടുത്തു/,
  // Spanish
  w('tomé'),
  w('tomada'),
  w('listo'),
]

const READ_SCHEDULE_PATTERNS: RegExp[] = [
  /\bwhat\s+(medicine|pill|tablet|routine|schedule)/i,
  /\bread\s+(my\s+)?(medicine|schedule)/i,
  /\btell\s+(me\s+)?(medicine|schedule)/i,
  /\bmy pills\b/i,
  /\bwhat to take\b/i,
  /என்ன\s+(மருந்து|மாத்திரை)/,
  /பட்டியல்/,
  /இப்போ\s+என்ன/,
  /कौन\s+दवा/,
  /दवा\s+बताओ/,
  /क्या\s+खाना/,
  /ఏ\s+మందులు/,
  /ఏమి\s+వేసుకోవాలి/,
  /ಯಾವ.*ಔಷಧಿ/,
  /ഏതൊക്കെ.*മരുന്ന്/,
  /qué.*medicina/i,
  /leer.*medicamentos/i,
]

const matchesAny = (patterns: RegExp[], text: string): boolean =>
  patterns.some((p) => p.test(text))

function detectSlot(lower: string): ParsedVoiceCommand['slotMentioned'] {
  if (/morning|காலை|सुबह|ఉదయం|ಬೆಳಗ್ಗೆ|രാവിലെ|mañana/i.test(lower)) return 'morning'
  if (/afternoon|noon|மதியம்|दोपहर|మధ్యాహ్నం|ಮಧ್ಯಾಹ್ನ|ഉച്ചയ്ക്ക്|tarde/i.test(lower))
    return 'afternoon'
  if (/evening|மாலை|शाम|సాయంత్రం|ಸಂಜೆ|വൈകുന്നേരം/i.test(lower)) return 'evening'
  if (/night|இரவு|रात|రాత్రి|ರಾತ್ರಿ|രാത്രി|noche/i.test(lower)) return 'night'
  return undefined
}

/**
 * Priority order is deliberate and safety-driven:
 *   1. Emergency / short distress call  -> CALL_CHILD
 *   2. Call the doctor                   -> CALL_DOCTOR
 *   3. "I took my medicine"              -> MARK_TAKEN (unless negated)
 *   4. Read schedule, then general help
 * Previously MARK_TAKEN was checked first, so "emergency, I took too many pills"
 * logged a dose and never placed a call, and "I have not taken my medicine"
 * logged a dose as taken.
 */
export function parseVoiceTranscript(transcript: string): ParsedVoiceCommand {
  const clean = (transcript ?? '').trim()
  const lower = clean.toLowerCase()
  const slotMentioned = detectSlot(lower)
  const wordCount = clean.split(/\s+/).filter(Boolean).length
  const make = (
    intent: VoiceIntentType,
    confidence: number,
    extra: Partial<ParsedVoiceCommand> = {}
  ): ParsedVoiceCommand => ({
    intent,
    transcript: clean,
    confidence,
    slotMentioned,
    ...extra,
  })

  if (!clean) return make('UNKNOWN', 0.6)

  const isShortHelp = wordCount <= 3 && matchesAny(HELP_WORDS, lower)
  if (matchesAny(EMERGENCY_PATTERNS, lower) || isShortHelp) {
    return make('CALL_CHILD', 0.95)
  }

  if (matchesAny(DOCTOR_PATTERNS, lower)) return make('CALL_DOCTOR', 0.95)

  if (matchesAny(MARK_TAKEN_PATTERNS, lower)) {
    if (matchesAny(NEGATION_PATTERNS, lower)) {
      // "I have not taken it" / "not yet": never log a dose.
      return make('UNKNOWN', 0.6, { negated: true })
    }
    return make('MARK_TAKEN', 0.95)
  }

  if (matchesAny(READ_SCHEDULE_PATTERNS, lower))
    return make('READ_SCHEDULE', 0.95)
  if (matchesAny(HELP_WORDS, lower)) return make('HELP_QUERY', 0.9)

  return make('UNKNOWN', 0.6)
}

// Browser SpeechRecognition Type Declarations
interface SpeechRecognitionEventLike {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string
        confidence: number
      }
      isFinal: boolean
    }
    length: number
  }
}

interface SpeechRecognitionErrorEventLike {
  error: string
  message?: string
}

interface SpeechRecognitionInstance {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onstart: (() => void) | null
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null
  onend: (() => void) | null
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

let activeRecognition: SpeechRecognitionInstance | null = null

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
}

export function startListening({
  lang = 'en',
  onInterimResult,
  onFinalCommand,
  onError,
  onStart,
  onEnd,
}: {
  lang?: string
  onInterimResult?: (text: string) => void
  onFinalCommand: (cmd: ParsedVoiceCommand) => void
  onError?: (error: string) => void
  onStart?: () => void
  onEnd?: () => void
}): () => void {
  stopListening()

  if (!isSpeechRecognitionSupported()) {
    if (onError) onError('Speech recognition is not supported in this browser.')
    return () => {}
  }

  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRec) return () => {}

  try {
    const recognition = new SpeechRec()
    activeRecognition = recognition

    const bcpLang = LANGUAGE_BCP_MAP[lang] || lang || 'en-US'
    recognition.lang = bcpLang
    recognition.continuous = false
    recognition.interimResults = true

    recognition.onstart = () => {
      if (onStart) onStart()
    }

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = 0; i < event.results.length; ++i) {
        const item = event.results[i]
        if (item.isFinal) {
          finalTranscript += item[0].transcript
        } else {
          interimTranscript += item[0].transcript
        }
      }

      if (interimTranscript && onInterimResult) {
        onInterimResult(interimTranscript)
      }

      if (finalTranscript) {
        const parsed = parseVoiceTranscript(finalTranscript)
        onFinalCommand(parsed)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      if (event.error === 'no-speech') {
        // User didn't speak within timeout, clean exit
        if (onEnd) onEnd()
        return
      }
      if (onError) onError(event.error)
      if (onEnd) onEnd()
    }

    recognition.onend = () => {
      activeRecognition = null
      if (onEnd) onEnd()
    }

    recognition.start()

    return () => {
      stopListening()
    }
  } catch (err) {
    if (onError) onError(String(err))
    return () => {}
  }
}

export function stopListening(): void {
  if (activeRecognition) {
    try {
      activeRecognition.stop()
    } catch {
      // Ignore
    }
    activeRecognition = null
  }
}

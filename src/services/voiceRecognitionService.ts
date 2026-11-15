/**
 * Web Speech API Voice Recognition Service for Senior Voice Commands
 * Supports: English, Tamil, Hindi, Telugu, Kannada, Malayalam, Spanish
 * Zero-latency local command matching with instant audio response
 */

export type VoiceIntentType =
  | 'MARK_TAKEN'
  | 'READ_SCHEDULE'
  | 'CALL_CHILD'
  | 'CALL_DOCTOR'
  | 'HELP_QUERY'
  | 'UNKNOWN';

export interface ParsedVoiceCommand {
  intent: VoiceIntentType;
  transcript: string;
  confidence: number;
  medicationMentioned?: string;
  slotMentioned?: 'morning' | 'afternoon' | 'evening' | 'night';
}

const LANGUAGE_BCP_MAP: Record<string, string> = {
  en: 'en-US',
  ta: 'ta-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  es: 'es-ES',
};

// Fast local multi-lingual keyword dictionary for instant (<10ms) intent matching
const INTENT_PATTERNS: Record<VoiceIntentType, RegExp[]> = {
  MARK_TAKEN: [
    /took/i,
    /taken/i,
    /done/i,
    /had my/i,
    /finished/i,
    /consumed/i,
    /mark.*taken/i,
    // Tamil
    /சாப்பிட்டேன்/i,
    /சாப்டேன்/i,
    /மாத்திரை.*போட்டேன்/i,
    /மருந்து.*எடுத்தேன்/i,
    /எடுத்தாச்சு/i,
    /முடிந்தது/i,
    // Hindi
    /दवा.*ली/i,
    /खा.*ली/i,
    /गोली.*ली/i,
    /हो.*गया/i,
    /ले.*लिया/i,
    // Telugu
    /వేసుకున్నాను/i,
    /తీసుకున్నాను/i,
    /మందు.*వేశా/i,
    // Kannada
    /ತೆಗೆದುಕೊಂಡೆ/i,
    /ತಗೊಂಡೆ/i,
    // Malayalam
    /കഴിച്ചു/i,
    /എടുത്തു/i,
    // Spanish
    /tomé/i,
    /tomada/i,
    /listo/i,
    /medicina.*tomada/i,
  ],
  CALL_CHILD: [
    /call.*(child|son|daughter|family|sanjai|kid)/i,
    /emergency/i,
    /sos/i,
    /help.*me/i,
    /call.*phone/i,
    // Tamil
    /அவசரம்/i,
    /மகன்/i,
    /மகள்/i,
    /பிள்ளை/i,
    /போன்.*பண்ணு/i,
    /கூப்பிடு/i,
    /உதவி/i,
    // Hindi
    /बेटे.*कॉल/i,
    /फोन.*लगाओ/i,
    /मदद.*करो/i,
    /इमरजेंसी/i,
    /कॉल.*करो/i,
    // Telugu
    /కొడుకు/i,
    /కూతురు/i,
    /ఫోన్.*చేయి/i,
    /సహాయం/i,
    // Kannada
    /ಮಗನಿಗೆ.*ಕರೆ/i,
    /ಸಹಾಯ/i,
    // Malayalam
    /മകനെ.*വിളിക്കൂ/i,
    /സഹായം/i,
    // Spanish
    /llamar.*hijo/i,
    /emergencia/i,
    /socorro/i,
    /ayuda/i,
  ],
  CALL_DOCTOR: [
    /doctor/i,
    /clinic/i,
    /hospital/i,
    /dr\./i,
    // Tamil
    /டாக்டர்/i,
    /மருத்துவர்/i,
    /ஆஸ்பத்திரி/i,
    // Hindi
    /डॉक्टर/i,
    /हस्पताल/i,
    // Telugu
    /డాక్టర్/i,
    // Kannada
    /ವೈದ್ಯ/i,
    // Malayalam
    /ഡോക്ടർ/i,
    // Spanish
    /doctor/i,
    /médico/i,
  ],
  READ_SCHEDULE: [
    /what\s+(medicine|pill|tablet|routine|schedule)/i,
    /read\s+(medicine|schedule)/i,
    /tell\s+(medicine|schedule)/i,
    /my pills/i,
    /what to take/i,
    // Tamil
    /என்ன\s+(மருந்து|மாத்திரை)/i,
    /பட்டியல்/i,
    /இப்போ\s+என்ன/i,
    // Hindi
    /कौन\s+दवा/i,
    /दवा\s+बताओ/i,
    /क्या\s+खाना/i,
    // Telugu
    /ఏ\s+మందులు/i,
    /ఏమి\s+వేసుకోవాలి/i,
    // Kannada
    /ಯಾವ.*ಔಷಧಿ/i,
    // Malayalam
    /ഏതൊക്കെ.*മരുന്ന്/i,
    // Spanish
    /qué.*medicina/i,
    /leer.*medicamentos/i,
  ],
  HELP_QUERY: [/help/i, /உதவி/i, /सहायता/i, /సహాయం/i, /ayuda/i],
  UNKNOWN: [],
};

export function parseVoiceTranscript(transcript: string): ParsedVoiceCommand {
  const clean = transcript.trim();
  const lower = clean.toLowerCase();

  // Detect time slot mentioned
  let slotMentioned: 'morning' | 'afternoon' | 'evening' | 'night' | undefined;
  if (/morning|காலை|सुबह|ఉదయం|ಬೆಳಗ್ಗೆ|രാവിലെ|mañana/i.test(lower)) {
    slotMentioned = 'morning';
  } else if (/afternoon|noon|மதியம்|दोपहर|మధ్యాహ్నం|ಮಧ್ಯಾಹ್ನ|ഉച്ചയ്ക്ക്|tarde/i.test(lower)) {
    slotMentioned = 'afternoon';
  } else if (/evening|மாலை|शाम|సాయంత్రం|ಸಂಜೆ|വൈകുന്നേരം/i.test(lower)) {
    slotMentioned = 'evening';
  } else if (/night|இரவு|रात|రాత్రి|ರಾತ್ರಿ|രാത്രി|noche/i.test(lower)) {
    slotMentioned = 'night';
  }

  // Fast pattern match
  for (const [intentKey, patterns] of Object.entries(INTENT_PATTERNS) as [
    VoiceIntentType,
    RegExp[]
  ][]) {
    if (intentKey === 'UNKNOWN') continue;
    for (const pattern of patterns) {
      if (pattern.test(lower)) {
        return {
          intent: intentKey,
          transcript: clean,
          confidence: 0.95,
          slotMentioned,
        };
      }
    }
  }

  return {
    intent: 'UNKNOWN',
    transcript: clean,
    confidence: 0.6,
    slotMentioned,
  };
}

// Browser SpeechRecognition Type Declarations
interface SpeechRecognitionEventLike {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence: number;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

interface SpeechRecognitionErrorEventLike {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

let activeRecognition: SpeechRecognitionInstance | null = null;

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function startListening({
  lang = 'en',
  onInterimResult,
  onFinalCommand,
  onError,
  onStart,
  onEnd,
}: {
  lang?: string;
  onInterimResult?: (text: string) => void;
  onFinalCommand: (cmd: ParsedVoiceCommand) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}): () => void {
  stopListening();

  if (!isSpeechRecognitionSupported()) {
    if (onError) onError('Speech recognition is not supported in this browser.');
    return () => {};
  }

  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRec) return () => {};

  try {
    const recognition = new SpeechRec();
    activeRecognition = recognition;

    const bcpLang = LANGUAGE_BCP_MAP[lang] || lang || 'en-US';
    recognition.lang = bcpLang;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      if (onStart) onStart();
    };

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = 0; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript;
        } else {
          interimTranscript += item[0].transcript;
        }
      }

      if (interimTranscript && onInterimResult) {
        onInterimResult(interimTranscript);
      }

      if (finalTranscript) {
        const parsed = parseVoiceTranscript(finalTranscript);
        onFinalCommand(parsed);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      if (event.error === 'no-speech') {
        // User didn't speak within timeout, clean exit
        if (onEnd) onEnd();
        return;
      }
      if (onError) onError(event.error);
      if (onEnd) onEnd();
    };

    recognition.onend = () => {
      activeRecognition = null;
      if (onEnd) onEnd();
    };

    recognition.start();

    return () => {
      stopListening();
    };
  } catch (err) {
    if (onError) onError(String(err));
    return () => {};
  }
}

export function stopListening(): void {
  if (activeRecognition) {
    try {
      activeRecognition.stop();
    } catch {
      // Ignore
    }
    activeRecognition = null;
  }
}

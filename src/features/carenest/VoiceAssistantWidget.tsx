import { useState, useEffect, useRef } from 'react'
import {
  startListening,
  stopListening,
  isSpeechRecognitionSupported,
  type ParsedVoiceCommand,
} from '@/services/voiceRecognitionService'
import { speakText, stopSpeaking, isSpeaking } from '@/services/voiceService'
import { type Medication, type TimeSlot } from '@/types/carenest'
import {
  Mic,
  Volume2,
  VolumeX,
  PhoneCall,
  CheckCircle2,
  ListMusic,
  Sparkles,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface VoiceAssistantWidgetProps {
  patientName?: string
  honorific?: string
  language: string
  currentSlot: TimeSlot
  slotMeds: Medication[]
  childName?: string
  doctorName?: string
  onMarkSlotTaken: (slot: TimeSlot) => void
  onTriggerCallChild: () => void
  onTriggerCallDoctor: () => void
}

export function VoiceAssistantWidget({
  honorific = 'Amma',
  language = 'en',
  currentSlot,
  slotMeds,
  childName = 'Caregiver',
  doctorName = 'Dr. Radhakrishnan',
  onMarkSlotTaken,
  onTriggerCallChild,
  onTriggerCallDoctor,
}: VoiceAssistantWidgetProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [lastActionFeedback, setLastActionFeedback] = useState<string | null>(
    null
  )
  const [speechRate, setSpeechRate] = useState<number>(0.95)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const recognitionCleanup = useRef<(() => void) | null>(null)

  // Periodic check if speaking
  useEffect(() => {
    const interval = setInterval(() => {
      setAudioPlaying(isSpeaking())
    }, 300)
    return () => clearInterval(interval)
  }, [])

  const getVoicePrompts = () => {
    switch (language) {
      case 'ta':
        return {
          title: `குரல் உதவியாளர் (${honorific})`,
          listening: 'உங்களை கவனிக்கிறது... பேசுங்கள்',
          pressToSpeak: 'மைக் தட்டி பேசவும் (எ.கா: "சாப்பிட்டேன்", "மகனுக்கு போன்")',
          takenPrompt: '"காலை மாத்திரை போட்டேன்"',
          callPrompt: '"மகனுக்கு போன் பண்ணு"',
          readPrompt: '"மருந்து பட்டியல் சொல்"',
          takenFeedback: `${honorific}, உங்கள் மருந்துகள் எடுக்கப்பட்டதாக குறிக்கப்பட்டது! அருமை!`,
          callingChildFeedback: `${honorific}, உங்கள் மகனுக்கு உடனே அழைப்பு விடுக்கப்படுகிறது!`,
          callingDocFeedback: `${honorific}, மருத்துவர் ${doctorName}-க்கு அழைப்பு விடுக்கப்படுகிறது!`,
          speedLabel: 'வேகம்',
        }
      case 'hi':
        return {
          title: `आवाज़ सहायक (${honorific})`,
          listening: 'सुन रहा हूँ... बोलिए',
          pressToSpeak: 'माइक दबाकर बोलें (उदा: "दवा खा ली", "कॉल करो")',
          takenPrompt: '"दवा खा ली"',
          callPrompt: '"बेटे को कॉल करो"',
          readPrompt: '"दवा बताओ"',
          takenFeedback: `${honorific}, आपकी दवाएं ली गईं के रूप में दर्ज हो गईं! बहुत बढ़िया!`,
          callingChildFeedback: `${honorific}, बेटे को अभी कॉल मिलाया जा रहा है!`,
          callingDocFeedback: `${honorific}, डॉक्टर ${doctorName} को कॉल लगाया जा रहा है!`,
          speedLabel: 'गति',
        }
      case 'te':
        return {
          title: `వాయిస్ అసిస్టెంట్ (${honorific})`,
          listening: 'వింటున్నాను... మాట్లాడండి',
          pressToSpeak: 'మైక్ నొక్కి మాట్లాడండి ("మందు వేసుకున్నాను")',
          takenPrompt: '"మందులు వేసుకున్నాను"',
          callPrompt: '"కొడుకుకి కాల్ చేయి"',
          readPrompt: '"ఏ మందులు వేసుకోవాలి"',
          takenFeedback: `${honorific}, మీ మందులు తీసుకున్నట్లు గుర్తించబడింది!`,
          callingChildFeedback: `${honorific}, మీ కొడుకుకి వెంటనే కాల్ చేయబడుతోంది!`,
          callingDocFeedback: `${honorific}, డాక్టర్ గారికి కాల్ చేయబడుతోంది!`,
          speedLabel: 'స్పీడ్',
        }
      case 'kn':
        return {
          title: `ಧ್ವನಿ ಸಹಾಯಕ (${honorific})`,
          listening: 'ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇನೆ... ಮಾತನಾಡಿ',
          pressToSpeak: 'ಮೈಕ್ ಒತ್ತಿ ಮಾತನಾಡಿ ("ಔಷಧಿ ತೆಗೆದುಕೊಂಡೆ")',
          takenPrompt: '"ಔಷಧಿ ತಗೊಂಡೆ"',
          callPrompt: '"ಮಗನಿಗೆ ಕರೆ ಮಾಡಿ"',
          readPrompt: '"ಔಷಧಿ ತಿಳಿಸಿ"',
          takenFeedback: `${honorific}, ನಿಮ್ಮ ಔಷಧಿಯನ್ನು ತೆಗೆದುಕೊಳ್ಳಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಲಾಗಿದೆ!`,
          callingChildFeedback: `${honorific}, ಮಗನಿಗೆ ಕರೆ ಮಾಡಲಾಗುತ್ತಿದೆ!`,
          callingDocFeedback: `${honorific}, ವೈದ್ಯರಿಗೆ ಕರೆ ಮಾಡಲಾಗುತ್ತಿದೆ!`,
          speedLabel: 'ವೇಗ',
        }
      case 'ml':
        return {
          title: `വോയ്‌സ് അസിസ്റ്റന്റ് (${honorific})`,
          listening: 'കേൾക്കുന്നു... സംസാരിക്കൂ',
          pressToSpeak: 'മൈക്ക് അമർത്തി സംസാരിക്കൂ ("മരുന്ന് കഴിച്ചു")',
          takenPrompt: '"മരുന്ന് കഴിച്ചു"',
          callPrompt: '"മകനെ വിളിക്കൂ"',
          readPrompt: '"മരുന്നുകൾ പറയൂ"',
          takenFeedback: `${honorific}, മരുന്നുകൾ കഴിച്ചതായി അടയാളപ്പെടുത്തി!`,
          callingChildFeedback: `${honorific}, ഉടൻ തന്നെ മകനെ വിളിക്കുന്നു!`,
          callingDocFeedback: `${honorific}, ഡോക്ടറെ വിളിക്കുന്നു!`,
          speedLabel: 'സ്പീഡ്',
        }
      case 'es':
        return {
          title: `Asistente de Voz (${honorific})`,
          listening: 'Escuchando... hable ahora',
          pressToSpeak:
            'Toque el micrófono para hablar ("Ya tomé la medicina")',
          takenPrompt: '"Tomé mi medicina"',
          callPrompt: '"Llamar a mi hijo"',
          readPrompt: '"Leer mis medicinas"',
          takenFeedback: `¡${honorific}, sus medicamentos han sido registrados como tomados!`,
          callingChildFeedback: `¡${honorific}, llamando a su hijo ahora mismo!`,
          callingDocFeedback: `¡${honorific}, llamando al doctor ${doctorName}!`,
          speedLabel: 'Velocidad',
        }
      default:
        return {
          title: `Instant Voice Companion (${honorific})`,
          listening: 'Listening closely... please speak now',
          pressToSpeak: `Tap mic to speak (e.g. "I took my pills", "Call ${childName}")`,
          takenPrompt: '"I took my medicine"',
          callPrompt: `"Call ${childName}"`,
          readPrompt: '"Read medicines"',
          takenFeedback: `${honorific}, your ${currentSlot} medicines have been marked as taken! Wonderful!`,
          callingChildFeedback: `${honorific}, placing emergency phone call to ${childName} now!`,
          callingDocFeedback: `${honorific}, calling ${doctorName}'s clinic now!`,
          speedLabel: 'Speed',
        }
    }
  }

  const prompts = getVoicePrompts()

  // Handle parsed voice command with immediate zero-latency feedback
  const handleVoiceCommand = (cmd: ParsedVoiceCommand) => {
    setIsListening(false)
    setTranscript(cmd.transcript)

    switch (cmd.intent) {
      case 'MARK_TAKEN': {
        const targetSlot = cmd.slotMentioned || currentSlot
        onMarkSlotTaken(targetSlot)
        setLastActionFeedback(prompts.takenFeedback)
        toast.success(`🎙️ "${cmd.transcript}" -> Marked Taken`, {
          duration: 3000,
        })
        speakText(prompts.takenFeedback, undefined, language, speechRate)
        break
      }

      case 'CALL_CHILD': {
        setLastActionFeedback(prompts.callingChildFeedback)
        toast.error(`📞 "${cmd.transcript}" -> Emergency Call`, {
          duration: 4000,
        })
        // Trigger the call once, immediately. It was previously also triggered from
        // the speech-finished callback, so one command placed the call (and sent the
        // SOS emails) twice.
        speakText(prompts.callingChildFeedback, undefined, language, speechRate)
        onTriggerCallChild()
        break
      }

      case 'CALL_DOCTOR': {
        setLastActionFeedback(prompts.callingDocFeedback)
        toast.info(`🩺 "${cmd.transcript}" -> Calling Doctor`, {
          duration: 3000,
        })
        speakText(prompts.callingDocFeedback, undefined, language, speechRate)
        onTriggerCallDoctor()
        break
      }

      case 'READ_SCHEDULE': {
        handleReadScheduleAloud()
        break
      }

      default: {
        // Fallback friendly prompt
        const fallbackSpeech =
          language === 'ta'
            ? `${honorific}, உங்கள் குரல் கேட்டது. "மருந்து சாப்பிட்டேன்" அல்லது "மகனுக்கு போன்" என்று கூறலாம்.`
            : language === 'hi'
              ? `${honorific}, आपकी बात सुनी। आप "दवा खा ली" या "कॉल करो" कह सकते हैं।`
              : `${honorific}, I heard: "${cmd.transcript}". You can say "I took my pills" or "Call my son".`
        setLastActionFeedback(fallbackSpeech)
        speakText(fallbackSpeech, undefined, language, speechRate)
        break
      }
    }
  }

  const handleReadScheduleAloud = () => {
    if (slotMeds.length === 0) {
      const emptyMsg =
        language === 'ta'
          ? `${honorific}, இந்த நேரத்தில் எந்த மாத்திரையும் இல்லை.`
          : language === 'hi'
            ? `${honorific}, इस समय कोई दवा नहीं है।`
            : `${honorific}, there are no medications scheduled for this time.`
      setLastActionFeedback(emptyMsg)
      speakText(emptyMsg, undefined, language, speechRate)
      return
    }

    const medNames = slotMeds.map((m) => m.name).join(', ')
    const readScheduleMsg =
      language === 'ta'
        ? `${honorific}, இந்த ${currentSlot} நேரத்தில் நீங்கள் எடுத்துக்கொள்ள வேண்டிய மருந்துகள்: ${medNames}.`
        : language === 'hi'
          ? `${honorific}, इस ${currentSlot} समय आपको ये दवाएं लेनी हैं: ${medNames}।`
          : `${honorific}, your scheduled medicines for ${currentSlot} are: ${medNames}.`

    setLastActionFeedback(readScheduleMsg)
    toast.info(`🔊 Reading schedule: ${medNames}`)
    speakText(readScheduleMsg, undefined, language, speechRate)
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
      if (recognitionCleanup.current) {
        recognitionCleanup.current()
        recognitionCleanup.current = null
      }
      setIsListening(false)
      return
    }

    // Stop speech synthesis if speaking
    stopSpeaking()
    setTranscript('')
    setLastActionFeedback(null)

    const cleanup = startListening({
      lang: language,
      onStart: () => {
        setIsListening(true)
      },
      onInterimResult: (text) => {
        setTranscript(text)
      },
      onFinalCommand: (cmd) => {
        handleVoiceCommand(cmd)
      },
      onError: (err) => {
        setIsListening(false)
        console.warn('[VoiceAssistant] Speech error:', err)
      },
      onEnd: () => {
        setIsListening(false)
      },
    })

    recognitionCleanup.current = cleanup
  }

  const toggleSpeed = () => {
    setSpeechRate((prev) => {
      if (Math.abs(prev - 0.85) < 0.01) return 0.95
      if (Math.abs(prev - 0.95) < 0.01) return 1.15
      return 0.85
    })
  }

  const supported = isSpeechRecognitionSupported()

  return (
    <Card className='rounded-2xl border-2 border-[#E8E2D9] bg-white p-4 shadow-md dark:border-border dark:bg-card'>
      <div className='flex flex-col items-center justify-between gap-3 sm:flex-row'>
        {/* Left: Assistant Identity & Live Status */}
        <div className='flex w-full items-center gap-3 sm:w-auto'>
          <button
            type='button'
            onClick={toggleListening}
            aria-label={isListening ? 'Stop listening' : prompts.pressToSpeak}
            className={`relative flex h-14 w-14 items-center justify-center rounded-2xl shadow-md transition-all active:scale-95 ${
              isListening
                ? 'animate-pulse bg-rose-600 text-white ring-4 ring-rose-400/50'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
            title={prompts.pressToSpeak}
          >
            {isListening ? (
              <Mic className='h-7 w-7 animate-bounce' />
            ) : (
              <Mic className='h-7 w-7' />
            )}
            {isListening && (
              <span className='absolute -top-1 -right-1 flex h-4 w-4'>
                <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75'></span>
                <span className='relative inline-flex h-4 w-4 rounded-full bg-rose-600'></span>
              </span>
            )}
          </button>

          <div className='flex-1'>
            <div className='flex items-center gap-2'>
              <h3 className='flex items-center gap-1.5 text-base font-bold tracking-tight text-[#1E1B18] dark:text-foreground'>
                <Sparkles className='h-4 w-4 fill-primary/20 text-primary' />
                {prompts.title}
              </h3>
              <Badge
                variant={isListening ? 'destructive' : 'secondary'}
                className='text-[10px] font-semibold tracking-wider uppercase'
              >
                {isListening
                  ? prompts.listening
                  : supported
                    ? 'Fast Voice (0ms)'
                    : 'Voice Enabled'}
              </Badge>
            </div>
            <p className='line-clamp-1 text-xs font-medium text-[#5C554E] dark:text-muted-foreground'>
              {transcript
                ? `"${transcript}"`
                : isListening
                  ? prompts.listening
                  : prompts.pressToSpeak}
            </p>
          </div>
        </div>

        {/* Quick Voice Shortcuts & Actions for Elderly Users */}
        <div className='flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto'>
          {/* Read Schedule Button */}
          <Button
            size='sm'
            variant='outline'
            onClick={handleReadScheduleAloud}
            aria-label={prompts.readPrompt}
            className='h-11 gap-1.5 border-[#D8D0C5] bg-white text-xs font-semibold text-[#2C2825] hover:bg-[#F2ECE4] sm:h-9 dark:border-border dark:bg-background dark:text-foreground'
          >
            <ListMusic className='h-3.5 w-3.5 text-primary' />
            {prompts.readPrompt}
          </Button>

          {/* Quick Mark Taken Voice Button */}
          <Button
            size='sm'
            variant='secondary'
            onClick={() => {
              onMarkSlotTaken(currentSlot)
              setLastActionFeedback(prompts.takenFeedback)
              speakText(prompts.takenFeedback, undefined, language, speechRate)
              toast.success(prompts.takenFeedback)
            }}
            aria-label={prompts.takenPrompt}
            className='h-11 gap-1.5 border border-emerald-300 bg-emerald-50 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 sm:h-9 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
          >
            <CheckCircle2 className='h-3.5 w-3.5 text-emerald-600' />
            {prompts.takenPrompt}
          </Button>

          {/* Quick Call Child Button */}
          <Button
            size='sm'
            variant='outline'
            onClick={() => {
              setLastActionFeedback(prompts.callingChildFeedback)
              speakText(
                prompts.callingChildFeedback,
                undefined,
                language,
                speechRate
              )
              onTriggerCallChild()
            }}
            aria-label={prompts.callPrompt}
            className='h-11 gap-1.5 border border-rose-300 bg-rose-50 text-xs font-semibold text-rose-800 hover:bg-rose-100 sm:h-9 dark:border-rose-700 dark:bg-rose-950 dark:text-rose-300'
          >
            <PhoneCall className='h-3.5 w-3.5 text-rose-600' />
            {prompts.callPrompt}
          </Button>

          {/* Speech Rate Quick Toggle */}
          <Button
            size='sm'
            variant='ghost'
            onClick={toggleSpeed}
            aria-label={`Toggle speech rate, current rate is ${speechRate}x`}
            className='h-11 bg-neutral-100 px-2 font-mono text-[11px] font-bold text-[#5C554E] hover:text-foreground sm:h-9 dark:bg-neutral-800 dark:text-muted-foreground'
            title='Toggle speech rate'
          >
            <Zap className='mr-0.5 h-3 w-3 text-amber-500' />
            {speechRate}x
          </Button>

          {/* Stop Audio Button (if speaking) */}
          {audioPlaying && (
            <Button
              size='sm'
              variant='destructive'
              onClick={stopSpeaking}
              aria-label='Stop audio readout'
              className='h-11 px-2 text-xs font-semibold sm:h-9'
              title='Stop audio'
            >
              <VolumeX className='h-3.5 w-3.5' />
            </Button>
          )}
        </div>
      </div>

      {/* Live Feedback Spoken Line */}
      {lastActionFeedback && (
        <div className='mt-2.5 flex items-center gap-2 border-t border-border/50 pt-2 text-xs font-medium text-primary'>
          <Volume2 className='h-3.5 w-3.5 shrink-0 animate-pulse' />
          <span className='line-clamp-1'>{lastActionFeedback}</span>
        </div>
      )}
    </Card>
  )
}

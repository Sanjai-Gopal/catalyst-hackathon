import { useState, useEffect } from 'react'
import { speakText } from '@/services/voiceService'
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  ShieldCheck,
  Stethoscope,
  FileText,
  UserCheck,
  Volume2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

interface TelehealthConsultationModalProps {
  isOpen: boolean
  onClose: () => void
  doctorName?: string
  specialty?: string
  honorific?: string
  patientName?: string
  language?: string
}

export function TelehealthConsultationModal({
  isOpen,
  onClose,
  doctorName = 'Dr. R. Ramanathan, MD',
  specialty = 'Senior Cardiologist • Apollo Speciality Hospitals',
  honorific = 'Amma',
  patientName = 'Lakshmi Narayanan',
  language = 'en',
}: TelehealthConsultationModalProps) {
  const [isMicMuted, setIsMicMuted] = useState(false)
  const [isVideoMuted, setIsVideoMuted] = useState(false)
  const [callDuration, setCallDuration] = useState(134) // in seconds (02:14)
  const [doctorNotes, setDoctorNotes] = useState(
    'Blood pressure steady at 122/78. Continue current Amlodipine 5mg dosage. Maintain low sodium diet. Follow-up in 3 weeks.'
  )

  useEffect(() => {
    if (!isOpen) return
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [isOpen])

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleEndCall = () => {
    toast.info(
      'Teleconsultation concluded. Clinical notes saved to CareNest health vault.'
    )
    onClose()
  }

  const handleSendSummaryToElder = () => {
    const summary = `${honorific}, Dr. Ramanathan reviewed your health. Your blood pressure is normal. Please continue taking your morning medicine on time.`
    toast.success(`Voice summary dispatched to ${honorific}!`)
    speakText(summary, undefined, language)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-h-[92vh] max-w-4xl overflow-y-auto p-4 sm:p-6'>
        <DialogHeader className='border-b border-border pb-2'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <div className='flex items-center gap-2'>
              <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground'>
                <Stethoscope className='h-5 w-5' />
              </div>
              <div>
                <DialogTitle className='flex items-center gap-2 text-base font-bold'>
                  <span>TeleHealth HD Consultation</span>
                  <Badge
                    variant='outline'
                    className='border-emerald-500/20 bg-emerald-500/10 font-mono text-xs text-emerald-600'
                  >
                    Live • {formatTime(callDuration)}
                  </Badge>
                </DialogTitle>
                <DialogDescription className='text-xs'>
                  {doctorName} ({specialty}) &amp; {honorific} ({patientName})
                </DialogDescription>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <Badge
                variant='secondary'
                className='flex items-center gap-1 font-mono text-[10px]'
              >
                <ShieldCheck className='h-3 w-3 text-emerald-600' />
                256-Bit Encrypted WebRTC
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Video Stage Simulation */}
        <div className='my-2 grid grid-cols-1 gap-4 md:grid-cols-3'>
          {/* Main Video: Doctor Screen */}
          <div className='relative flex aspect-video flex-col justify-between overflow-hidden rounded-2xl bg-neutral-900 p-4 shadow-inner md:col-span-2'>
            {/* Top Overlay */}
            <div className='z-10 flex items-center justify-between'>
              <div className='flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur-md'>
                <span className='h-2 w-2 animate-ping rounded-full bg-emerald-500'></span>
                <span className='font-medium'>{doctorName}</span>
              </div>
              <Badge className='bg-primary/80 text-[10px] text-white'>
                1080p 60fps
              </Badge>
            </div>

            {/* Doctor Avatar / Visualizer Placeholder */}
            <div className='my-auto flex flex-col items-center justify-center text-center'>
              <div className='relative mb-2 flex h-24 w-24 items-center justify-center rounded-full border-2 border-primary/50 bg-primary/20 text-primary shadow-lg'>
                <UserCheck className='h-12 w-12' />
                <span className='absolute right-0 bottom-0 h-4 w-4 rounded-full border-2 border-neutral-900 bg-emerald-500'></span>
              </div>
              <p className='text-sm font-semibold text-white'>{doctorName}</p>
              <p className='text-xs text-neutral-400'>
                Cardiology Department • Connected
              </p>
            </div>

            {/* Bottom Controls Bar */}
            <div className='z-10 mx-auto flex max-w-xs items-center justify-center gap-3 rounded-2xl bg-black/60 p-2 backdrop-blur-md'>
              <Button
                size='icon'
                variant={isMicMuted ? 'destructive' : 'secondary'}
                className='h-10 w-10 rounded-xl'
                onClick={() => setIsMicMuted(!isMicMuted)}
                title={isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
              >
                {isMicMuted ? (
                  <MicOff className='h-4 w-4' />
                ) : (
                  <Mic className='h-4 w-4' />
                )}
              </Button>

              <Button
                size='icon'
                variant={isVideoMuted ? 'destructive' : 'secondary'}
                className='h-10 w-10 rounded-xl'
                onClick={() => setIsVideoMuted(!isVideoMuted)}
                title={isVideoMuted ? 'Turn on Camera' : 'Turn off Camera'}
              >
                {isVideoMuted ? (
                  <VideoOff className='h-4 w-4' />
                ) : (
                  <Video className='h-4 w-4' />
                )}
              </Button>

              <Button
                size='icon'
                variant='destructive'
                className='h-10 w-10 rounded-xl bg-rose-600 shadow-md hover:bg-rose-700'
                onClick={handleEndCall}
                title='Conclude Consultation'
              >
                <PhoneOff className='h-4 w-4' />
              </Button>
            </div>
          </div>

          {/* Right Sidebar: Self Cam & Consultation Notes */}
          <div className='flex flex-col gap-3'>
            {/* Pip: Elder / Patient Cam */}
            <div className='relative flex aspect-video flex-col justify-between overflow-hidden rounded-xl border border-border bg-neutral-800 p-3 md:aspect-[4/3]'>
              <div className='flex items-center justify-between'>
                <span className='rounded bg-black/60 px-2 py-0.5 text-[10px] text-white'>
                  {honorific} ({patientName})
                </span>
                <span className='h-2 w-2 rounded-full bg-emerald-500'></span>
              </div>
              <div className='my-auto flex flex-col items-center justify-center text-xs text-muted-foreground'>
                <div className='mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 font-bold text-amber-500'>
                  🌸
                </div>
                <span>Bedside Patient Stream</span>
              </div>
              <div className='text-center font-mono text-[10px] text-neutral-400'>
                Audio: Stereo • Latency 24ms
              </div>
            </div>

            {/* Live Consultation Note Pad */}
            <div className='flex flex-1 flex-col justify-between rounded-xl border border-border/60 bg-muted/20 p-3'>
              <div className='space-y-1.5'>
                <div className='flex items-center justify-between'>
                  <span className='flex items-center gap-1.5 text-xs font-bold text-foreground'>
                    <FileText className='h-3.5 w-3.5 text-primary' />
                    Clinical Visit Notes
                  </span>
                  <Badge variant='outline' className='text-[10px]'>
                    Live Auto-Save
                  </Badge>
                </div>
                <Textarea
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  className='h-28 resize-none font-mono text-xs'
                  placeholder='Physician assessment, prescription changes...'
                />
              </div>

              <div className='mt-2 flex flex-col gap-1.5 border-t border-border pt-2'>
                <Button
                  size='sm'
                  onClick={handleSendSummaryToElder}
                  className='w-full gap-1.5 border border-primary/20 bg-primary/10 text-xs font-semibold text-primary hover:bg-primary/20'
                  variant='outline'
                >
                  <Volume2 className='h-3.5 w-3.5' />
                  Speak Summary to {honorific}
                </Button>

                <Button
                  size='sm'
                  onClick={handleEndCall}
                  className='w-full text-xs font-semibold'
                >
                  Save &amp; End Session
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

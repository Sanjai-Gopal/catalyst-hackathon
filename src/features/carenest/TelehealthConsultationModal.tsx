import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { speakText } from '@/services/voiceService';

interface TelehealthConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorName?: string;
  specialty?: string;
  honorific?: string;
  patientName?: string;
  language?: string;
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
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(134); // in seconds (02:14)
  const [doctorNotes, setDoctorNotes] = useState(
    'Blood pressure steady at 122/78. Continue current Amlodipine 5mg dosage. Maintain low sodium diet. Follow-up in 3 weeks.'
  );

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    toast.info('Teleconsultation concluded. Clinical notes saved to CareNest health vault.');
    onClose();
  };

  const handleSendSummaryToElder = () => {
    const summary = `${honorific}, Dr. Ramanathan reviewed your health. Your blood pressure is normal. Please continue taking your morning medicine on time.`;
    toast.success(`Voice summary dispatched to ${honorific}!`);
    speakText(summary, undefined, language);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[92vh] overflow-y-auto p-4 sm:p-6'>
        <DialogHeader className='pb-2 border-b border-border'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <div className='flex items-center gap-2'>
              <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground'>
                <Stethoscope className='w-5 h-5' />
              </div>
              <div>
                <DialogTitle className='text-base font-bold flex items-center gap-2'>
                  <span>TeleHealth HD Consultation</span>
                  <Badge variant='outline' className='font-mono text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20'>
                    Live • {formatTime(callDuration)}
                  </Badge>
                </DialogTitle>
                <DialogDescription className='text-xs'>
                  {doctorName} ({specialty}) &amp; {honorific} ({patientName})
                </DialogDescription>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <Badge variant='secondary' className='text-[10px] font-mono flex items-center gap-1'>
                <ShieldCheck className='w-3 h-3 text-emerald-600' />
                256-Bit Encrypted WebRTC
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Video Stage Simulation */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 my-2'>
          {/* Main Video: Doctor Screen */}
          <div className='md:col-span-2 relative aspect-video bg-neutral-900 rounded-2xl overflow-hidden shadow-inner flex flex-col justify-between p-4'>
            {/* Top Overlay */}
            <div className='flex items-center justify-between z-10'>
              <div className='flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs'>
                <span className='h-2 w-2 rounded-full bg-emerald-500 animate-ping'></span>
                <span className='font-medium'>{doctorName}</span>
              </div>
              <Badge className='bg-primary/80 text-white text-[10px]'>1080p 60fps</Badge>
            </div>

            {/* Doctor Avatar / Visualizer Placeholder */}
            <div className='flex flex-col items-center justify-center text-center my-auto'>
              <div className='relative flex h-24 w-24 items-center justify-center rounded-full bg-primary/20 text-primary border-2 border-primary/50 shadow-lg mb-2'>
                <UserCheck className='h-12 w-12' />
                <span className='absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 border-2 border-neutral-900'></span>
              </div>
              <p className='text-sm font-semibold text-white'>{doctorName}</p>
              <p className='text-xs text-neutral-400'>Cardiology Department • Connected</p>
            </div>

            {/* Bottom Controls Bar */}
            <div className='flex items-center justify-center gap-3 z-10 bg-black/60 backdrop-blur-md p-2 rounded-2xl max-w-xs mx-auto'>
              <Button
                size='icon'
                variant={isMicMuted ? 'destructive' : 'secondary'}
                className='h-10 w-10 rounded-xl'
                onClick={() => setIsMicMuted(!isMicMuted)}
                title={isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
              >
                {isMicMuted ? <MicOff className='w-4 h-4' /> : <Mic className='w-4 h-4' />}
              </Button>

              <Button
                size='icon'
                variant={isVideoMuted ? 'destructive' : 'secondary'}
                className='h-10 w-10 rounded-xl'
                onClick={() => setIsVideoMuted(!isVideoMuted)}
                title={isVideoMuted ? 'Turn on Camera' : 'Turn off Camera'}
              >
                {isVideoMuted ? <VideoOff className='w-4 h-4' /> : <Video className='w-4 h-4' />}
              </Button>

              <Button
                size='icon'
                variant='destructive'
                className='h-10 w-10 rounded-xl bg-rose-600 hover:bg-rose-700 shadow-md'
                onClick={handleEndCall}
                title='Conclude Consultation'
              >
                <PhoneOff className='w-4 h-4' />
              </Button>
            </div>
          </div>

          {/* Right Sidebar: Self Cam & Consultation Notes */}
          <div className='flex flex-col gap-3'>
            {/* Pip: Elder / Patient Cam */}
            <div className='relative aspect-video md:aspect-[4/3] bg-neutral-800 rounded-xl overflow-hidden flex flex-col justify-between p-3 border border-border'>
              <div className='flex items-center justify-between'>
                <span className='bg-black/60 px-2 py-0.5 rounded text-[10px] text-white'>
                  {honorific} ({patientName})
                </span>
                <span className='h-2 w-2 rounded-full bg-emerald-500'></span>
              </div>
              <div className='flex flex-col items-center justify-center my-auto text-muted-foreground text-xs'>
                <div className='h-10 w-10 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold mb-1'>
                  🌸
                </div>
                <span>Bedside Patient Stream</span>
              </div>
              <div className='text-[10px] text-neutral-400 text-center font-mono'>
                Audio: Stereo • Latency 24ms
              </div>
            </div>

            {/* Live Consultation Note Pad */}
            <div className='flex-1 border border-border/60 rounded-xl p-3 bg-muted/20 flex flex-col justify-between'>
              <div className='space-y-1.5'>
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-bold flex items-center gap-1.5 text-foreground'>
                    <FileText className='w-3.5 h-3.5 text-primary' />
                    Clinical Visit Notes
                  </span>
                  <Badge variant='outline' className='text-[10px]'>Live Auto-Save</Badge>
                </div>
                <Textarea
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  className='text-xs font-mono h-28 resize-none'
                  placeholder='Physician assessment, prescription changes...'
                />
              </div>

              <div className='pt-2 mt-2 border-t border-border flex flex-col gap-1.5'>
                <Button
                  size='sm'
                  onClick={handleSendSummaryToElder}
                  className='w-full text-xs font-semibold gap-1.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
                  variant='outline'
                >
                  <Volume2 className='w-3.5 h-3.5' />
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
  );
}

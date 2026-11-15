import { useState } from 'react';
import { Medication, AdherenceRecord, TimeSlot } from '@/types/carenest';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sun,
  CloudSun,
  Sunset,
  Moon,
  CheckCircle2,
  Volume2,
  PhoneCall,
  Shield,
  Clock,
  Sparkles,
  Heart,
  VolumeX,
} from 'lucide-react';
import { speakText, stopSpeaking } from '@/services/voiceService';
import { generateElderFriendlyExplanation } from '@/services/geminiHealthcare';
import { sendEmailNotification } from '@/services/emailService';
import { toast } from 'sonner';

interface SeniorModeViewProps {
  patientName: string;
  medications: Medication[];
  adherence: AdherenceRecord[];
  onMarkTaken: (medicationId: string, slot: TimeSlot) => void;
  onOpenPasscodeModal: () => void;
}

export function SeniorModeView({
  patientName,
  medications,
  adherence,
  onMarkTaken,
  onOpenPasscodeModal,
}: SeniorModeViewProps) {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot>('morning');
  const [speakingMedId, setSpeakingMedId] = useState<string | null>(null);
  const [isEmergencyTriggered, setIsEmergencyTriggered] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter meds for current slot
  const slotMeds = medications.filter((m) => m.slot === selectedSlot);

  // Check taken status
  const isMedTaken = (medId: string) => {
    return adherence.some(
      (a) => a.medicationId === medId && a.date === todayStr && a.status === 'taken'
    );
  };

  const totalSlotMeds = slotMeds.length;
  const takenSlotMeds = slotMeds.filter((m) => isMedTaken(m.id)).length;
  const isSlotComplete = totalSlotMeds > 0 && takenSlotMeds === totalSlotMeds;

  const handleSpeak = async (med: Medication) => {
    if (speakingMedId === med.id) {
      stopSpeaking();
      setSpeakingMedId(null);
      return;
    }

    setSpeakingMedId(med.id);
    toast.info('Generating gentle voice guidance...', { duration: 2000 });

    try {
      const guidance = await generateElderFriendlyExplanation(med.name, med.instructions);
      speakText(guidance, () => {
        setSpeakingMedId(null);
      });
    } catch {
      speakText(`Amma, please take your ${med.name}. ${med.instructions}`, () => {
        setSpeakingMedId(null);
      });
    }
  };

  const handleTriggerSOS = async () => {
    setIsEmergencyTriggered(true);
    toast.error('Emergency SOS Dispatched to Family Caregiver!', {
      duration: 6000,
    });

    speakText('Emergency assistance alert has been sent to your son Sanjai. Help is on the way.');

    await sendEmailNotification({
      recipientEmail: 'sanjai23062008g@gmail.com',
      recipientName: 'Sanjai Gopal',
      elderName: patientName,
      type: 'emergency_sos',
      medicationOrDetails: 'Immediate Care Assistance Requested from Senior Mode',
      scheduledTime: new Date().toLocaleTimeString(),
    });
  };

  return (
    <div className='min-h-screen bg-[#FBF9F5] text-[#2C2825] px-4 py-6 md:px-8 max-w-5xl mx-auto'>
      {/* Top Header */}
      <div className='flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E8E2D9]'>
        <div className='space-y-1'>
          <div className='flex items-center gap-2'>
            <span className='inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#E87A5D]/15 text-[#E87A5D]'>
              <Heart className='w-5 h-5 fill-current' />
            </span>
            <span className='text-sm font-semibold tracking-wider uppercase text-[#8C827A]'>
              CareNest • Senior Safe Mode
            </span>
          </div>
          <h1 className='text-3xl md:text-4xl font-serif font-bold text-[#1E1B18]'>
            Good Day, {patientName.split(' ')[0]}! 🌸
          </h1>
          <p className='text-base text-[#6E665E]'>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <div className='flex items-center gap-3'>
          <Button
            variant='outline'
            onClick={onOpenPasscodeModal}
            className='h-12 px-5 border-[#D8D0C5] bg-white hover:bg-[#F2ECE4] text-[#4A433D] rounded-xl font-medium shadow-sm flex items-center gap-2'
          >
            <Shield className='w-4 h-4 text-[#8C827A]' />
            <span>Caregiver Portal</span>
          </Button>
        </div>
      </div>

      {/* Time Slot Switcher - Large, accessible touch targets */}
      <div className='my-6 grid grid-cols-2 sm:grid-cols-4 gap-3'>
        <button
          type='button'
          onClick={() => setSelectedSlot('morning')}
          className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
            selectedSlot === 'morning'
              ? 'bg-amber-50 border-amber-500 shadow-md scale-[1.02]'
              : 'bg-white border-[#E6E0D6] hover:bg-[#FAF7F2]'
          }`}
        >
          <Sun className='w-8 h-8 text-amber-500 mb-1' />
          <span className='text-lg font-bold text-[#2C2825]'>Morning</span>
          <span className='text-xs text-[#8C827A] font-medium'>8:00 AM - 11:00 AM</span>
        </button>

        <button
          type='button'
          onClick={() => setSelectedSlot('afternoon')}
          className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
            selectedSlot === 'afternoon'
              ? 'bg-orange-50 border-orange-500 shadow-md scale-[1.02]'
              : 'bg-white border-[#E6E0D6] hover:bg-[#FAF7F2]'
          }`}
        >
          <CloudSun className='w-8 h-8 text-orange-500 mb-1' />
          <span className='text-lg font-bold text-[#2C2825]'>Afternoon</span>
          <span className='text-xs text-[#8C827A] font-medium'>12:00 PM - 3:00 PM</span>
        </button>

        <button
          type='button'
          onClick={() => setSelectedSlot('evening')}
          className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
            selectedSlot === 'evening'
              ? 'bg-indigo-50 border-indigo-500 shadow-md scale-[1.02]'
              : 'bg-white border-[#E6E0D6] hover:bg-[#FAF7F2]'
          }`}
        >
          <Sunset className='w-8 h-8 text-indigo-500 mb-1' />
          <span className='text-lg font-bold text-[#2C2825]'>Evening</span>
          <span className='text-xs text-[#8C827A] font-medium'>5:00 PM - 7:30 PM</span>
        </button>

        <button
          type='button'
          onClick={() => setSelectedSlot('night')}
          className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
            selectedSlot === 'night'
              ? 'bg-purple-50 border-purple-500 shadow-md scale-[1.02]'
              : 'bg-white border-[#E6E0D6] hover:bg-[#FAF7F2]'
          }`}
        >
          <Moon className='w-8 h-8 text-purple-600 mb-1' />
          <span className='text-lg font-bold text-[#2C2825]'>Night</span>
          <span className='text-xs text-[#8C827A] font-medium'>9:00 PM - 10:30 PM</span>
        </button>
      </div>

      {/* Completion Banner */}
      {isSlotComplete && (
        <div className='mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 shadow-sm'>
          <Sparkles className='w-6 h-6 text-emerald-600 flex-shrink-0' />
          <div>
            <h4 className='font-bold text-base'>Wonderful job! All {selectedSlot} medicines completed.</h4>
            <p className='text-sm text-emerald-700'>
              Your caregiver and family have been notified of your good health habits.
            </p>
          </div>
        </div>
      )}

      {/* Medication Cards List */}
      <div className='space-y-4'>
        {slotMeds.length === 0 ? (
          <div className='bg-white rounded-2xl p-8 text-center border border-[#E6E0D6] shadow-sm'>
            <CheckCircle2 className='w-12 h-12 text-emerald-500 mx-auto mb-3' />
            <h3 className='text-xl font-bold text-[#2C2825]'>No medications scheduled for {selectedSlot}</h3>
            <p className='text-sm text-[#8C827A] mt-1'>
              Take a walk, rest, or enjoy a cup of warm herbal tea!
            </p>
          </div>
        ) : (
          slotMeds.map((med) => {
            const taken = isMedTaken(med.id);
            return (
              <Card
                key={med.id}
                className={`overflow-hidden rounded-2xl border-2 transition-all ${
                  taken
                    ? 'bg-[#F2F8F4] border-emerald-300 opacity-90'
                    : 'bg-white border-[#E6E0D6] shadow-sm hover:border-[#D1C7BA]'
                }`}
              >
                <CardContent className='p-5 md:p-6'>
                  <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                    {/* Left: Med Details */}
                    <div className='space-y-2 flex-1'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <span className='font-mono font-bold text-sm px-2.5 py-1 rounded-md bg-[#F4EFEA] text-[#5C544E] flex items-center gap-1.5'>
                          <Clock className='w-3.5 h-3.5' />
                          {med.time}
                        </span>
                        <Badge
                          variant='secondary'
                          className='bg-[#EFE8DD] text-[#4A423B] font-semibold text-xs'
                        >
                          {med.purpose}
                        </Badge>
                        {taken && (
                          <Badge className='bg-emerald-600 text-white font-bold text-xs'>
                            ✓ Taken Today
                          </Badge>
                        )}
                      </div>

                      <h3 className='text-2xl font-bold text-[#1E1B18]'>
                        {med.name}
                      </h3>

                      <p className='text-lg font-semibold text-[#8C5E3C]'>
                        Dose: {med.dosage}
                      </p>

                      <div className='text-base text-[#4E4741] bg-[#FAF8F5] p-3 rounded-xl border border-[#EDE7DE]'>
                        <strong>Doctor's Advice:</strong> {med.instructions}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className='flex flex-col sm:flex-row md:flex-col gap-3 min-w-[200px]'>
                      <Button
                        size='lg'
                        onClick={() => onMarkTaken(med.id, selectedSlot)}
                        disabled={taken}
                        className={`h-14 text-base font-bold rounded-xl transition-all shadow-md ${
                          taken
                            ? 'bg-emerald-100 text-emerald-800 cursor-default'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        <CheckCircle2 className='w-6 h-6 mr-2' />
                        {taken ? 'Completed' : 'I Have Taken This'}
                      </Button>

                      <Button
                        variant='outline'
                        size='lg'
                        onClick={() => handleSpeak(med)}
                        className='h-12 border-[#D8D0C5] bg-white hover:bg-[#F2ECE4] text-[#4A433D] rounded-xl font-medium'
                      >
                        {speakingMedId === med.id ? (
                          <>
                            <VolumeX className='w-5 h-5 mr-2 text-rose-500' />
                            <span>Stop Audio</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className='w-5 h-5 mr-2 text-primary' />
                            <span>Listen Guidance</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Emergency Assistance Footer */}
      <div className='mt-10 p-6 rounded-3xl bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200 shadow-sm'>
        <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
          <div className='space-y-1 text-center md:text-left'>
            <h3 className='text-xl font-bold text-rose-950 flex items-center justify-center md:justify-start gap-2'>
              <PhoneCall className='w-6 h-6 text-rose-600' />
              Emergency Assistance & 1-Tap SOS
            </h3>
            <p className='text-sm text-rose-800'>
              Feeling dizzy, unwell, or need immediate help? Tap below to alert your family immediately.
            </p>
          </div>

          <Button
            size='lg'
            onClick={handleTriggerSOS}
            className={`h-14 px-8 font-bold text-lg rounded-2xl shadow-lg transition-all ${
              isEmergencyTriggered
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-rose-600 hover:bg-rose-700 text-white active:scale-95'
            }`}
          >
            {isEmergencyTriggered ? '✓ Family Alert Dispatched' : '🚨 1-Tap Emergency SOS'}
          </Button>
        </div>
      </div>
    </div>
  );
}

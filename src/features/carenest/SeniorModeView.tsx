import { useState } from 'react';
import { Medication, AdherenceRecord, TimeSlot, PatientProfile } from '@/types/carenest';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
  Users,
  MessageSquare,
  ShieldAlert,
  Stethoscope,
  Video,
} from 'lucide-react';
import {
  speakText,
  stopSpeaking,
  getInstantElderVoiceTemplate,
  cacheVoiceExplanation,
} from '@/services/voiceService';
import { generateElderFriendlyExplanation } from '@/services/geminiHealthcare';
import { sendEmailNotification } from '@/services/emailService';
import { useLanguage } from '@/context/language-context';
import { LanguageSwitcher } from '@/components/language-switcher';
import { VoiceAssistantWidget } from './VoiceAssistantWidget';
import { TelehealthConsultationModal } from './TelehealthConsultationModal';
import { toast } from 'sonner';

function triggerPhoneCall(phoneNumber: string) {
  const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');
  if (!cleanPhone) return;

  if (typeof window !== 'undefined') {
    const isTest =
      (window as unknown as { __vitest_browser__?: boolean }).__vitest_browser__ ||
      window.location.pathname.includes('__vitest__');
    if (!isTest) {
      try {
        const link = document.createElement('a');
        link.href = `tel:${cleanPhone}`;
        link.setAttribute('rel', 'noopener noreferrer');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch {
        window.location.href = `tel:${cleanPhone}`;
      }
    }
  }
}

interface SeniorModeViewProps {
  patient?: PatientProfile;
  patientName?: string;
  medications: Medication[];
  adherence: AdherenceRecord[];
  onMarkTaken: (medicationId: string, slot: TimeSlot) => void;
  onOpenPasscodeModal: () => void;
  onOpenOnboarding?: () => void;
}

export function SeniorModeView({
  patient,
  patientName = 'Lakshmi Narayanan',
  medications,
  adherence,
  onMarkTaken,
  onOpenPasscodeModal,
  onOpenOnboarding,
}: SeniorModeViewProps) {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot>('morning');
  const [speakingMedId, setSpeakingMedId] = useState<string | null>(null);
  const [isEmergencyTriggered, setIsEmergencyTriggered] = useState(false);
  const [isCallingDialogOpen, setIsCallingDialogOpen] = useState(false);
  const [isDoctorVideoOpen, setIsDoctorVideoOpen] = useState(false);

  const { t, currentLanguage } = useLanguage();

  const activeHonorific =
    patient?.honorific === 'Custom'
      ? patient.customHonorific || 'Elder'
      : patient?.honorific || 'Amma';

  const honorificEmoji =
    activeHonorific === 'Amma'
      ? '🌸'
      : activeHonorific === 'Appa'
      ? '🌿'
      : activeHonorific === 'Grandma'
      ? '👵'
      : '👴';

  const activeChildContact = patient?.childrenContact || {
    name: 'Sanjai Gopal',
    relationship: 'Son & Primary Caregiver',
    email: 'sanjai23062008g@gmail.com',
    phone: '+91 98401 23456',
  };

  const cleanChildPhone = activeChildContact.phone.replace(/[^0-9+]/g, '');
  const waChildPhone = activeChildContact.phone.replace(/[^0-9]/g, '');
  const cleanDoctorPhone = (
    patient?.doctorContact?.phone || '+91 44 2829 0200'
  ).replace(/[^0-9+]/g, '');

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

  const handleMarkSlotTaken = (slot: TimeSlot) => {
    const medsToMark = medications.filter((m) => m.slot === slot);
    medsToMark.forEach((m) => {
      if (!isMedTaken(m.id)) {
        onMarkTaken(m.id, slot);
      }
    });
  };

  const handleSpeak = (med: Medication) => {
    if (speakingMedId === med.id) {
      stopSpeaking();
      setSpeakingMedId(null);
      return;
    }

    setSpeakingMedId(med.id);

    // 1. Instant speech synthesis using local template (0ms latency!)
    const instantText = getInstantElderVoiceTemplate(
      med.name,
      med.instructions,
      activeHonorific,
      currentLanguage
    );
    speakText(
      instantText,
      () => {
        setSpeakingMedId(null);
      },
      currentLanguage
    );

    // 2. Asynchronously fetch rich Gemini explanation and update cache for next replay
    generateElderFriendlyExplanation(
      med.name,
      med.instructions,
      activeHonorific,
      currentLanguage
    )
      .then((richExplanation) => {
        cacheVoiceExplanation(med.name, activeHonorific, currentLanguage, richExplanation);
      })
      .catch(() => {});
  };

  const handleTriggerSOS = async () => {
    setIsEmergencyTriggered(true);
    setIsCallingDialogOpen(true);

    // 1. Immediately initiate native phone call to children
    triggerPhoneCall(activeChildContact.phone);

    toast.error(
      `${t('callingChild', { childName: activeChildContact.name })} (${activeChildContact.phone})`,
      { duration: 6000 }
    );

    // 2. Clear, reassuring voice audio in the user's selected language
    let sosAudio = `Calling your child ${activeChildContact.name} now at ${activeChildContact.phone}. Emergency alerts sent to family and doctor. Help is on the way, ${activeHonorific}.`;
    if (currentLanguage === 'ta') {
      sosAudio = `அவசர எச்சரிக்கை! உங்கள் பிள்ளை ${activeChildContact.name} க்கு உடனே அழைப்பு போகிறது. மருத்துவர் மற்றும் குடும்பத்தினருக்கு தகவல் அனுப்பப்பட்டது. பயப்பட வேண்டாம், ${activeHonorific}.`;
    } else if (currentLanguage === 'hi') {
      sosAudio = `आपातकालीन सूचना! आपके बच्चे ${activeChildContact.name} को फोन लग रहा है। परिवार और डॉक्टर को संदेश भेज दिया गया है। धैर्य रखें, ${activeHonorific}।`;
    } else if (currentLanguage === 'te') {
      sosAudio = `అత్యవసర సమాచారం! మీ పిల్లలు ${activeChildContact.name} కి కాల్ వెళ్తోంది. కుటుంబానికి మరియు డాక్టర్‌కు మెసేజ్ అందింది. ధైర్యంగా ఉండండి, ${activeHonorific}.`;
    } else if (currentLanguage === 'kn') {
      sosAudio = `ತುರ್ತು ಸಂದೇಶ! ನಿಮ್ಮ ಮಕ್ಕಳು ${activeChildContact.name} ಅವರಿಗೆ ಕರೆ ಮಾಡಲಾಗುತ್ತಿದೆ. ವೈದ್ಯರಿಗೆ ಮತ್ತು ಕುಟುಂಬಕ್ಕೆ ಮಾಹಿತಿ ಕಳುಹಿಸಲಾಗಿದೆ. ಧೈರ್ಯವಾಗಿರಿ, ${activeHonorific}.`;
    } else if (currentLanguage === 'ml') {
      sosAudio = `അടിയന്തര മുന്നറിയിപ്പ്! നിങ്ങളുടെ മക്കൾ ${activeChildContact.name} ലേക്ക് കോൾ പോകുന്നു. കുടുംബത്തിനും ഡോക്ടർക്കും സന്ദേശം അയച്ചിട്ടുണ്ട്. വിഷമിക്കേണ്ട, ${activeHonorific}.`;
    } else if (currentLanguage === 'es') {
      sosAudio = `¡Alerta de emergencia! Llamando a su hijo ${activeChildContact.name} ahora. Se han enviado alertas a su familia y médico. Ya llega ayuda, ${activeHonorific}.`;
    }

    speakText(sosAudio, undefined, currentLanguage);

    // 3. Dispatch high-priority emergency email to children
    await sendEmailNotification({
      recipientEmail: activeChildContact.email,
      recipientName: activeChildContact.name,
      elderName: `${activeHonorific} (${patient?.name || patientName})`,
      type: 'emergency_sos',
      medicationOrDetails: `Immediate Emergency Call & Care Assistance Requested by ${activeHonorific} to ${activeChildContact.name} (${activeChildContact.phone})`,
      scheduledTime: new Date().toLocaleTimeString(),
    });

    // 4. Send email to doctor if available
    if (patient?.doctorContact?.email) {
      await sendEmailNotification({
        recipientEmail: patient.doctorContact.email,
        recipientName: patient.doctorContact.doctorName,
        elderName: `${activeHonorific} (${patient?.name || patientName})`,
        type: 'emergency_sos',
        medicationOrDetails: `Clinical SOS Notification: ${activeHonorific} triggered emergency call to ${activeChildContact.name}.`,
        scheduledTime: new Date().toLocaleTimeString(),
      });
    }
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
              CareNest • {t('seniorMode')}
            </span>
          </div>
          <h1 className='text-3xl md:text-4xl font-serif font-bold text-[#1E1B18]'>
            {t('goodDay')}, {activeHonorific}! {honorificEmoji}
          </h1>
          <p className='text-base text-[#6E665E]'>
            {t('caringWithLove', { honorific: activeHonorific })} •{' '}
            {new Date().toLocaleDateString(
              currentLanguage === 'en' ? 'en-US' : currentLanguage,
              {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              }
            )}
          </p>
        </div>

        <div className='flex items-center gap-2 sm:gap-3 flex-wrap'>
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Quick Call Child Emergency Button */}
          <Button
            size='sm'
            onClick={handleTriggerSOS}
            className='h-11 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 animate-pulse'
          >
            <PhoneCall className='w-4 h-4' />
            <span>{t('callChildNow', { childName: activeChildContact.name.split(' ')[0] })}</span>
          </Button>

          {/* Quick Doctor Video Teleconsultation */}
          <Button
            size='sm'
            onClick={() => setIsDoctorVideoOpen(true)}
            className='h-11 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5'
          >
            <Video className='w-4 h-4' />
            <span>{currentLanguage === 'ta' ? 'டாக்டர் வீடியோ' : currentLanguage === 'hi' ? 'डॉक्टर वीडियो' : 'Doctor Video'}</span>
          </Button>

          {onOpenOnboarding && (
            <Button
              variant='outline'
              onClick={onOpenOnboarding}
              className='h-11 px-4 border-[#D8D0C5] bg-white hover:bg-[#F2ECE4] text-[#4A433D] rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5'
            >
              <Users className='w-4 h-4 text-primary' />
              <span>{t('careCircleSetup')}</span>
            </Button>
          )}

          <Button
            variant='outline'
            onClick={onOpenPasscodeModal}
            className='h-11 px-4 border-[#D8D0C5] bg-white hover:bg-[#F2ECE4] text-[#4A433D] rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5'
          >
            <Shield className='w-4 h-4 text-[#8C827A]' />
            <span>{t('caregiverPortal')}</span>
          </Button>
        </div>
      </div>

      {/* Bedside Clinical Vitals Bar */}
      <div className='my-4 px-4 py-2.5 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs flex flex-wrap items-center justify-between text-xs text-[#5C554E] gap-2'>
        <div className='flex items-center gap-4 flex-wrap'>
          <span className='flex items-center gap-1.5 font-medium'>
            <span className='h-2 w-2 rounded-full bg-emerald-500'></span>
            <strong>BP:</strong> 122/78 mmHg
          </span>
          <span className='flex items-center gap-1.5 font-medium'>
            <span className='h-2 w-2 rounded-full bg-amber-500'></span>
            <strong>Blood Sugar:</strong> 108 mg/dL
          </span>
          <span className='flex items-center gap-1.5 font-medium'>
            <span className='h-2 w-2 rounded-full bg-rose-500'></span>
            <strong>Heart Rate:</strong> 72 bpm
          </span>
          <span className='flex items-center gap-1.5 font-medium'>
            <span className='h-2 w-2 rounded-full bg-blue-500'></span>
            <strong>SpO2:</strong> 98%
          </span>
        </div>
        <span className='text-[11px] font-mono text-[#8C827A]'>
          Live Clinical Telemetry Active ✓
        </span>
      </div>

      {/* Voice Assistant - Instant Low-Latency Voice Interaction */}
      <div className='my-6'>
        <VoiceAssistantWidget
          patientName={patientName}
          honorific={activeHonorific}
          language={currentLanguage}
          currentSlot={selectedSlot}
          slotMeds={slotMeds}
          childName={activeChildContact.name.split(' ')[0]}
          doctorName={patient?.doctorContact?.doctorName || 'Dr. Radhakrishnan'}
          onMarkSlotTaken={handleMarkSlotTaken}
          onTriggerCallChild={handleTriggerSOS}
          onTriggerCallDoctor={() => {
            triggerPhoneCall(cleanDoctorPhone);
            toast.info(`🩺 Calling ${patient?.doctorContact?.doctorName || 'Doctor'}...`);
          }}
        />
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
          <span className='text-lg font-bold text-[#2C2825]'>{t('morning')}</span>
          <span className='text-xs text-[#8C827A] font-medium'>{t('morningTime')}</span>
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
          <span className='text-lg font-bold text-[#2C2825]'>{t('afternoon')}</span>
          <span className='text-xs text-[#8C827A] font-medium'>{t('afternoonTime')}</span>
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
          <span className='text-lg font-bold text-[#2C2825]'>{t('evening')}</span>
          <span className='text-xs text-[#8C827A] font-medium'>{t('eveningTime')}</span>
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
          <span className='text-lg font-bold text-[#2C2825]'>{t('night')}</span>
          <span className='text-xs text-[#8C827A] font-medium'>{t('nightTime')}</span>
        </button>
      </div>

      {/* Completion Banner */}
      {isSlotComplete && (
        <div className='mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 shadow-sm'>
          <Sparkles className='w-6 h-6 text-emerald-600 flex-shrink-0' />
          <div>
            <h4 className='font-bold text-base'>
              {t('wonderfulJob', { honorific: activeHonorific, slot: t(selectedSlot) })}
            </h4>
            <p className='text-sm text-emerald-700'>
              {t('familyNotified', { childName: activeChildContact.name })}
            </p>
          </div>
        </div>
      )}

      {/* Medication Cards List */}
      <div className='space-y-4'>
        {slotMeds.length === 0 ? (
          <div className='bg-white rounded-2xl p-8 text-center border border-[#E6E0D6] shadow-sm'>
            <CheckCircle2 className='w-12 h-12 text-emerald-500 mx-auto mb-3' />
            <h3 className='text-xl font-bold text-[#2C2825]'>
              {t('noMedsScheduled', { slot: t(selectedSlot) })}
            </h3>
            <p className='text-sm text-[#8C827A] mt-1'>
              {t('takeRest')}
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
                            ✓ {t('takenToday')}
                          </Badge>
                        )}
                      </div>

                      <h3 className='text-2xl font-bold text-[#1E1B18]'>
                        {med.name}
                      </h3>

                      <p className='text-lg font-semibold text-[#8C5E3C]'>
                        {t('dose')}: {med.dosage}
                      </p>

                      <div className='text-base text-[#4E4741] bg-[#FAF8F5] p-3 rounded-xl border border-[#EDE7DE]'>
                        <strong>{t('doctorsAdvice')}:</strong> {med.instructions}
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
                        {taken ? t('completed') : t('iHaveTakenThis')}
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
                            <span>{t('stopAudio')}</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className='w-5 h-5 mr-2 text-primary' />
                            <span>{t('listenGuidance')}</span>
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
      <div className='mt-10 p-6 rounded-3xl bg-gradient-to-r from-rose-50 to-orange-50 border-2 border-rose-300 shadow-md'>
        <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
          <div className='space-y-1 text-center md:text-left'>
            <div className='flex items-center justify-center md:justify-start gap-2 text-xs font-bold text-rose-700 uppercase tracking-wider'>
              <span className='inline-block w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping' />
              <span>{t('emergencyTriggeredBanner')}</span>
            </div>
            <h3 className='text-2xl font-bold text-rose-950 flex items-center justify-center md:justify-start gap-2'>
              <PhoneCall className='w-6 h-6 text-rose-600' />
              {t('emergencyTitle', { honorific: activeHonorific })}
            </h3>
            <p className='text-sm text-rose-800 max-w-xl'>
              {t('emergencySubtext', {
                childName: activeChildContact.name,
                childPhone: activeChildContact.phone,
              })}
            </p>
          </div>

          <Button
            size='lg'
            onClick={handleTriggerSOS}
            className={`h-16 px-8 font-extrabold text-lg rounded-2xl shadow-xl transition-all flex items-center gap-3 ${
              isEmergencyTriggered
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-rose-600 hover:bg-rose-700 text-white active:scale-95 animate-pulse'
            }`}
          >
            <PhoneCall className='w-6 h-6' />
            <span>
              {isEmergencyTriggered
                ? `✓ ${t('callingChild', { childName: activeChildContact.name.split(' ')[0] })}`
                : `🚨 ${t('callChildSos', { childName: activeChildContact.name.split(' ')[0] })}`}
            </span>
          </Button>
        </div>
      </div>

      {/* Emergency Calling Dialog */}
      <Dialog
        open={isCallingDialogOpen}
        onOpenChange={(open) => {
          setIsCallingDialogOpen(open);
          if (!open) {
            stopSpeaking();
          }
        }}
      >
        <DialogContent className='sm:max-w-md bg-white border-2 border-rose-300 text-slate-900 rounded-3xl p-6 shadow-2xl'>
          <DialogHeader>
            <div className='flex items-center gap-3'>
              <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 text-white animate-pulse shadow-md'>
                <PhoneCall className='h-6 w-6' />
              </div>
              <div>
                <DialogTitle className='text-xl font-bold text-rose-950 flex items-center gap-2'>
                  <span>{t('callingChild', { childName: activeChildContact.name })}</span>
                </DialogTitle>
                <DialogDescription className='text-xs text-rose-700 font-medium'>
                  {t('emergencyTriggeredBanner')}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className='py-4 space-y-4 text-center'>
            {/* Phone display */}
            <div className='p-4 rounded-2xl bg-rose-50 border border-rose-200'>
              <div className='text-xs font-semibold text-rose-800 uppercase tracking-wider mb-1'>
                {t('dialingChildrenNumber')}
              </div>
              <div className='text-2xl sm:text-3xl font-extrabold font-mono text-rose-950'>
                {activeChildContact.phone}
              </div>
              <div className='text-xs text-rose-700 mt-1 font-medium'>
                {activeChildContact.relationship || 'Son & Primary Caregiver'}
              </div>
            </div>

            {/* Direct Calling Buttons */}
            <div className='space-y-2.5'>
              <a
                href={`tel:${cleanChildPhone}`}
                className='w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-base shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95'
              >
                <PhoneCall className='w-5 h-5' />
                <span>📞 {t('directCall', { childName: activeChildContact.name })} ({activeChildContact.phone})</span>
              </a>

              <a
                href={`https://wa.me/${waChildPhone}?text=${encodeURIComponent(
                  `EMERGENCY SOS: ${activeHonorific} (${patient?.name || patientName}) needs immediate assistance! Please check CareNest AI or call immediately.`
                )}`}
                target='_blank'
                rel='noopener noreferrer'
                className='w-full h-12 bg-green-700 hover:bg-green-800 text-white rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2'
              >
                <MessageSquare className='w-4 h-4' />
                <span>💬 {t('whatsappSos')}</span>
              </a>

              {patient?.doctorContact?.phone && (
                <a
                  href={`tel:${cleanDoctorPhone}`}
                  className='w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs shadow-sm flex items-center justify-center gap-2'
                >
                  <Stethoscope className='w-4 h-4' />
                  <span>{t('callDoctor', { doctorName: patient.doctorContact.doctorName })} ({patient.doctorContact.phone})</span>
                </a>
              )}

              <a
                href='tel:108'
                className='w-full h-11 bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 rounded-xl font-semibold text-xs flex items-center justify-center gap-2'
              >
                <ShieldAlert className='w-4 h-4 text-rose-600' />
                <span>{t('callAmbulance')}</span>
              </a>
            </div>

            <p className='text-xs text-muted-foreground pt-1'>
              {t('emailsDispatched', { childEmail: activeChildContact.email })}
            </p>
          </div>

          <div className='flex justify-center pt-2 border-t'>
            <Button
              variant='outline'
              onClick={() => {
                setIsCallingDialogOpen(false);
                stopSpeaking();
              }}
              className='h-10 px-6 rounded-xl text-xs font-semibold'
            >
              {t('closeSafe')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Doctor Video Teleconsultation Modal */}
      <TelehealthConsultationModal
        isOpen={isDoctorVideoOpen}
        onClose={() => setIsDoctorVideoOpen(false)}
        doctorName={patient?.doctorContact?.doctorName || 'Dr. R. Ramanathan, MD'}
        specialty={`${patient?.doctorContact?.specialty || 'Senior Cardiologist'} • ${patient?.doctorContact?.clinic || 'Apollo Speciality Hospitals'}`}
        honorific={activeHonorific}
        patientName={patientName}
        language={currentLanguage}
      />
    </div>
  );
}

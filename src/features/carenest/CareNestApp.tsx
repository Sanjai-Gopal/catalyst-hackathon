import { useState, useEffect } from 'react';
import {
  type PatientProfile,
  type Medication,
  type DoctorAppointment,
  type AdherenceRecord,
  type TimeSlot,
} from '@/types/carenest';
import {
  INITIAL_PATIENT,
  INITIAL_MEDICATIONS,
  INITIAL_APPOINTMENTS,
} from '@/data/carenestInitialData';
import { SeniorModeView } from './SeniorModeView';
import { CaretakerDashboard } from './CaretakerDashboard';
import { PasscodeModal } from './PasscodeModal';
import { CareCircleOnboardingModal } from './CareCircleOnboardingModal';
import { LanguageProvider } from '@/context/language-context';
import { getLocalDateString } from '@/lib/date';
import {
  isAdherenceArray,
  isMedicationArray,
  isPatientProfile,
  loadValidated,
} from '@/lib/storage';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

export function CareNestApp() {
  // Stored values are shape-validated, so corrupted/tampered localStorage falls
  // back to defaults instead of crashing the app on every load.
  const [patient, setPatient] = useState<PatientProfile>(() =>
    loadValidated('carenest_patient_profile', isPatientProfile, INITIAL_PATIENT)
  );

  const [medications, setMedications] = useState<Medication[]>(() =>
    loadValidated('carenest_medications', isMedicationArray, INITIAL_MEDICATIONS)
  );

  const [appointments] = useState<DoctorAppointment[]>(INITIAL_APPOINTMENTS);
  const [adherence, setAdherence] = useState<AdherenceRecord[]>(() =>
    loadValidated<AdherenceRecord[]>('carenest_adherence', isAdherenceArray, [])
  );

  const [mode, setMode] = useState<'senior' | 'caretaker'>('senior');
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('carenest_start_onboarding') === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('carenest_adherence', JSON.stringify(adherence));
    }
  }, [adherence]);

  // Persist medications (including remainingPills). Previously the pill count was
  // decremented in memory only and silently reverted on reload.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('carenest_medications', JSON.stringify(medications));
    }
  }, [medications]);

  const handleResetRoutine = () => {
    setAdherence([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('carenest_adherence');
    }
    toast.success('Live routine reset: All medications marked as Pending!');
  };

  const handleOnboardingComplete = (
    updatedProfile: PatientProfile,
    updatedMeds: Medication[]
  ) => {
    setPatient(updatedProfile);
    setMedications(updatedMeds);
    if (typeof window !== 'undefined') {
      localStorage.setItem('carenest_patient_profile', JSON.stringify(updatedProfile));
      localStorage.setItem('carenest_onboarded', 'true');
      localStorage.removeItem('carenest_start_onboarding');
    }
    setIsOnboardingOpen(false);
    toast.success(
      `Care Circle for ${updatedProfile.honorific || 'Amma'} successfully configured!`
    );
  };

  // Mark Medication Taken
  const handleMarkTaken = (medicationId: string, slot: TimeSlot) => {
    const med = medications.find((m) => m.id === medicationId);
    const medName = med ? med.name : 'Medication';
    const today = getLocalDateString();
    const honorific = patient.honorific || 'Amma';

    // Already logged today: don't log twice or use up another pill.
    const alreadyTaken = adherence.some(
      (a) => a.medicationId === medicationId && a.date === today && a.status === 'taken'
    );
    if (alreadyTaken) {
      toast.info(`${medName} is already logged as taken today.`);
      return;
    }

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'],
      });
    } catch {
      // Graceful fallback if canvas is restricted
    }

    setAdherence((prev) => [
      ...prev.filter((a) => !(a.medicationId === medicationId && a.date === today)),
      {
        id: `adh_${Date.now()}`,
        medicationId,
        medicationName: medName,
        slot,
        date: today,
        status: 'taken',
        loggedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        loggedBy: mode === 'senior' ? 'elder' : 'caretaker',
      },
    ]);

    // Decrement pill count (exactly once per medicine per day)
    setMedications((prev) =>
      prev.map((m) =>
        m.id === medicationId
          ? { ...m, remainingPills: Math.max(0, m.remainingPills - 1) }
          : m
      )
    );

    toast.success(`Logged dose for ${medName}! ${honorific} is doing wonderful. 🌸`);
  };

  // Add Medication (persisted by the medications effect above)
  const handleAddMedication = (newMed: Medication) => {
    setMedications((prev) => [newMed, ...prev]);
  };

  // Delete Medication (persisted by the medications effect above)
  const handleDeleteMedication = (id: string) => {
    setMedications((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <LanguageProvider>
      <div className='min-h-screen bg-background'>
        {mode === 'senior' ? (
          <SeniorModeView
            patient={patient}
            patientName={patient.name}
            medications={medications}
            adherence={adherence}
            onMarkTaken={handleMarkTaken}
            onOpenPasscodeModal={() => setIsPasscodeModalOpen(true)}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
            onResetRoutine={handleResetRoutine}
          />
        ) : (
          <CaretakerDashboard
            patient={patient}
            medications={medications}
            appointments={appointments}
            adherence={adherence}
            onAddMedication={handleAddMedication}
            onDeleteMedication={handleDeleteMedication}
            onMarkTaken={handleMarkTaken}
            onSwitchToSeniorMode={() => setMode('senior')}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
            onResetRoutine={handleResetRoutine}
          />
        )}

        {/* Passcode Modal for Caregiver Barrier */}
        <PasscodeModal
          isOpen={isPasscodeModalOpen}
          onClose={() => setIsPasscodeModalOpen(false)}
          onSuccess={() => {
            setIsPasscodeModalOpen(false);
            setMode('caretaker');
            toast.success('Passcode verified! Caregiver Portal unlocked.');
          }}
        />

        {/* Care Circle Onboarding Wizard */}
        <CareCircleOnboardingModal
          isOpen={isOnboardingOpen}
          onClose={() => {
            setIsOnboardingOpen(false);
            if (typeof window !== 'undefined') {
              localStorage.removeItem('carenest_start_onboarding');
            }
          }}
          onComplete={handleOnboardingComplete}
          initialProfile={patient}
          initialMeds={medications}
        />
      </div>
    </LanguageProvider>
  );
}

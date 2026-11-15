import { useState, useEffect } from 'react';
import {
  PatientProfile,
  Medication,
  DoctorAppointment,
  AdherenceRecord,
  TimeSlot,
} from '@/types/carenest';
import {
  INITIAL_PATIENT,
  INITIAL_MEDICATIONS,
  INITIAL_APPOINTMENTS,
  INITIAL_ADHERENCE,
} from '@/data/carenestInitialData';
import { SeniorModeView } from './SeniorModeView';
import { CaretakerDashboard } from './CaretakerDashboard';
import { PasscodeModal } from './PasscodeModal';
import { CareCircleOnboardingModal } from './CareCircleOnboardingModal';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

export function CareNestApp() {
  const [patient, setPatient] = useState<PatientProfile>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('carenest_patient_profile');
        if (stored) return JSON.parse(stored);
      } catch {
        // fallback
      }
    }
    return INITIAL_PATIENT;
  });

  const [medications, setMedications] = useState<Medication[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('carenest_medications');
        if (stored) return JSON.parse(stored);
      } catch {
        // fallback
      }
    }
    return INITIAL_MEDICATIONS;
  });

  const [appointments] = useState<DoctorAppointment[]>(INITIAL_APPOINTMENTS);
  const [adherence, setAdherence] = useState<AdherenceRecord[]>(INITIAL_ADHERENCE);

  const [mode, setMode] = useState<'senior' | 'caretaker'>('senior');
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const shouldOnboard = localStorage.getItem('carenest_start_onboarding');
      if (shouldOnboard === 'true') {
        setIsOnboardingOpen(true);
      }
    }
  }, []);

  const handleOnboardingComplete = (
    updatedProfile: PatientProfile,
    updatedMeds: Medication[]
  ) => {
    setPatient(updatedProfile);
    setMedications(updatedMeds);
    if (typeof window !== 'undefined') {
      localStorage.setItem('carenest_patient_profile', JSON.stringify(updatedProfile));
      localStorage.setItem('carenest_medications', JSON.stringify(updatedMeds));
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
    const today = new Date().toISOString().split('T')[0];

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

    // Decrement pill count
    setMedications((prev) =>
      prev.map((m) =>
        m.id === medicationId
          ? { ...m, remainingPills: Math.max(0, m.remainingPills - 1) }
          : m
      )
    );

    const honorific = patient.honorific || 'Amma';
    toast.success(`Logged dose for ${medName}! ${honorific} is doing wonderful. 🌸`);
  };

  // Add Medication
  const handleAddMedication = (newMed: Medication) => {
    setMedications((prev) => {
      const updated = [newMed, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('carenest_medications', JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Delete Medication
  const handleDeleteMedication = (id: string) => {
    setMedications((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('carenest_medications', JSON.stringify(updated));
      }
      return updated;
    });
  };

  return (
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
  );
}

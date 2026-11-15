export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night';

export type AdherenceStatus = 'taken' | 'skipped' | 'snoozed' | 'pending';

export type ElderHonorific = 'Amma' | 'Appa' | 'Grandma' | 'Grandpa' | 'Custom';

export type UserPersona = 'elder' | 'children' | 'doctor';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  slot: TimeSlot;
  time: string; // e.g. "08:00 AM"
  instructions: string; // e.g. "Take after breakfast with warm water"
  purpose: string; // e.g. "Blood Pressure regulation"
  criticality: 'high' | 'medium' | 'low';
  prescribedBy: string;
  remainingPills: number;
  totalPills: number;
}

export interface AdherenceRecord {
  id: string;
  medicationId: string;
  medicationName: string;
  slot: TimeSlot;
  date: string; // YYYY-MM-DD
  status: AdherenceStatus;
  loggedAt?: string;
  loggedBy: 'elder' | 'caretaker' | 'family';
}

export interface DoctorAppointment {
  id: string;
  doctorName: string;
  specialty: string;
  clinic: string;
  address: string;
  dateTime: string;
  notes: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  contactPhone: string;
}

export interface PatientProfile {
  id: string;
  name: string;
  honorific: ElderHonorific;
  customHonorific?: string;
  age: number;
  bloodGroup: string;
  passcode: string; // Family access code, e.g. "CARE-8492"
  medicalConditions: string[];
  allergies: string[];
  childrenContact: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
  };
  doctorContact: {
    doctorName: string;
    specialty: string;
    clinic: string;
    phone: string;
    email: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
  };
}

export interface DrugInteractionAlert {
  severity: 'danger' | 'warning' | 'safe';
  medicationsInvolved: string[];
  description: string;
  recommendation: string;
  dietaryNote?: string;
}

export interface EmailNotificationPayload {
  recipientEmail: string;
  recipientName: string;
  elderName: string;
  type: 'missed_medication' | 'upcoming_dose' | 'appointment_reminder' | 'emergency_sos' | 'doctor_update';
  medicationOrDetails: string;
  scheduledTime: string;
}

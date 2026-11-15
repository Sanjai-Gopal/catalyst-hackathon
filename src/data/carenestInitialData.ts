import {
  type PatientProfile,
  type Medication,
  type DoctorAppointment,
  type HealthVitalRecord,
  type LabReportRecord,
} from '../types/carenest'

export const INITIAL_PATIENT: PatientProfile = {
  id: 'pt_lakshmi_01',
  name: 'Lakshmi Narayanan',
  honorific: 'Amma',
  customHonorific: 'Amma',
  age: 74,
  bloodGroup: 'B+ Positive',
  passcode: 'CARE-8492',
  childrenContact: {
    name: 'Family Caregiver',
    relationship: 'Son & Primary Caregiver',
    phone: '+91 90000 00000',
    email: 'caregiver@example.com',
  },
  doctorContact: {
    doctorName: 'Dr. R. Ramanathan, MD',
    specialty: 'Senior Cardiologist',
    clinic: 'Apollo Speciality Hospitals',
    phone: '+91 44 2829 0200',
    email: 'doctor@example.com',
  },
  emergencyContact: {
    name: 'Family Caregiver',
    relationship: 'Son & Primary Caregiver',
    phone: '+91 90000 00000',
    email: 'caregiver@example.com',
  },
  allergies: ['Penicillin', 'Sulfa drugs'],
  medicalConditions: ['Hypertension', 'Type 2 Diabetes', 'Mild Osteoarthritis'],
}

export const INITIAL_MEDICATIONS: Medication[] = [
  {
    id: 'med_01',
    name: 'Amlodipine (Norvasc)',
    dosage: '5 mg - 1 Tablet',
    slot: 'morning',
    time: '08:00 AM',
    instructions: 'Take immediately after breakfast with warm water',
    purpose: 'Blood Pressure Control',
    criticality: 'high',
    prescribedBy: 'Dr. R. Ramanathan, MD (Cardiologist)',
    remainingPills: 22,
    totalPills: 30,
  },
  {
    id: 'med_02',
    name: 'Metformin Hydrochloride',
    dosage: '500 mg - 1 Tablet',
    slot: 'morning',
    time: '08:30 AM',
    instructions: 'Take with food to prevent gastric discomfort',
    purpose: 'Blood Sugar Regulation',
    criticality: 'high',
    prescribedBy: 'Dr. Priya Sundaram (Endocrinologist)',
    remainingPills: 18,
    totalPills: 30,
  },
  {
    id: 'med_03',
    name: 'Calcium & Vitamin D3',
    dosage: '500mg / 400IU - 1 Capsule',
    slot: 'afternoon',
    time: '01:30 PM',
    instructions:
      'Take 30 mins after lunch. Avoid taking at same time as tea or coffee',
    purpose: 'Bone Density & Joint Support',
    criticality: 'medium',
    prescribedBy: 'Dr. V. Anand (Orthopedic)',
    remainingPills: 28,
    totalPills: 30,
  },
  {
    id: 'med_04',
    name: 'Atorvastatin (Lipitor)',
    dosage: '20 mg - 1 Tablet',
    slot: 'night',
    time: '09:00 PM',
    instructions: 'Take at bedtime. Do not consume grapefruit juice',
    purpose: 'Cholesterol & Heart Protection',
    criticality: 'high',
    prescribedBy: 'Dr. R. Ramanathan, MD (Cardiologist)',
    remainingPills: 14,
    totalPills: 30,
  },
]

export const INITIAL_APPOINTMENTS: DoctorAppointment[] = [
  {
    id: 'apt_01',
    doctorName: 'Dr. R. Ramanathan, MD',
    specialty: 'Senior Cardiologist & Heart Specialist',
    clinic: 'Apollo Speciality Hospitals',
    address: 'Greams Road, Thousand Lights, Chennai',
    dateTime: 'Tomorrow, Nov 16 • 10:30 AM',
    notes:
      'Routine 3-month BP review & ECG follow-up. Bring morning BP log sheet.',
    status: 'upcoming',
    contactPhone: '+91 44 2829 0200',
  },
  {
    id: 'apt_02',
    doctorName: 'Dr. Priya Sundaram',
    specialty: 'Consultant Endocrinologist',
    clinic: "Dr. Mohan's Diabetes Specialities Centre",
    address: 'Gopalapuram, Chennai',
    dateTime: 'Friday, Nov 20 • 04:00 PM',
    notes:
      'HbA1c quarterly check. Fasting blood glucose test already completed.',
    status: 'upcoming',
    contactPhone: '+91 44 4396 8888',
  },
]

export const INITIAL_VITALS: HealthVitalRecord[] = [
  {
    id: 'vit_01',
    vitalType: 'blood_pressure',
    value: '122/78',
    unit: 'mmHg',
    status: 'normal',
    loggedAt: 'Today, 08:15 AM',
    notes: 'Resting morning measurement. Post-breakfast.',
  },
  {
    id: 'vit_02',
    vitalType: 'blood_glucose',
    value: '108',
    unit: 'mg/dL',
    status: 'normal',
    loggedAt: 'Today, 07:30 AM',
    notes: 'Fasting blood sugar. Optimal glycemic range.',
  },
  {
    id: 'vit_03',
    vitalType: 'heart_rate',
    value: '72',
    unit: 'bpm',
    status: 'normal',
    loggedAt: 'Today, 08:15 AM',
    notes: 'Regular sinus rhythm.',
  },
  {
    id: 'vit_04',
    vitalType: 'spo2',
    value: '98',
    unit: '%',
    status: 'normal',
    loggedAt: 'Today, 08:15 AM',
    notes: 'Pulse oximetry reading on room air.',
  },
]

export const INITIAL_LAB_REPORTS: LabReportRecord[] = [
  {
    id: 'lab_01',
    testName: 'Comprehensive Metabolic & Lipid Panel',
    category: 'Biochemistry',
    date: 'Nov 10, 2026',
    diagnosticCenter: 'Apollo Diagnostics Centre',
    status: 'normal',
    keyFinding:
      'Total Cholesterol 178 mg/dL (Normal <200), LDL 94 mg/dL. Statins functioning well.',
    doctorReviewed: true,
  },
  {
    id: 'lab_02',
    testName: 'HbA1c Glycated Hemoglobin',
    category: 'Diabetes Care',
    date: 'Nov 02, 2026',
    diagnosticCenter: 'Dr. Mohan’s Diabetes Centre',
    status: 'normal',
    keyFinding:
      'HbA1c 6.7% (Good control for geriatric diabetes; target <7.5%).',
    doctorReviewed: true,
  },
  {
    id: 'lab_03',
    testName: '12-Lead Electrocardiogram (ECG)',
    category: 'Cardiology',
    date: 'Oct 24, 2026',
    diagnosticCenter: 'Apollo Speciality Hospitals',
    status: 'normal',
    keyFinding:
      'Normal sinus rhythm, no acute ischemic ST-T changes. Baseline healthy.',
    doctorReviewed: true,
  },
]

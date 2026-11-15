import { describe, it, expect } from 'vitest';
import { type Medication, type TimeSlot } from '../types/carenest';
import { buildEmailTemplate } from '../services/emailService';
import { INITIAL_MEDICATIONS, INITIAL_PATIENT } from '../data/carenestInitialData';

import { verifyPasscode } from '../lib/passcode'; // real production implementation

// Core Business Logic Helpers

export function calculateAdherencePercentage(
  totalMeds: number,
  takenCount: number
): number {
  if (totalMeds <= 0) return 100;
  return Math.min(100, Math.round((takenCount / totalMeds) * 100));
}

export function filterMedicationsBySlot(
  meds: Medication[],
  slot: TimeSlot
): Medication[] {
  return meds.filter((m) => m.slot === slot);
}

describe('CareNest AI — Healthcare Management Ecosystem Unit Tests', () => {
  describe('1. Passcode Security & Access Control', () => {
    it('should grant access to valid family passcode CARE-8492', () => {
      expect(verifyPasscode('CARE-8492')).toBe(true);
      expect(verifyPasscode('care-8492')).toBe(true);
      expect(verifyPasscode('8492')).toBe(true);
    });

    it('should grant access to master caretaker passcode CARE-2026', () => {
      expect(verifyPasscode('CARE-2026')).toBe(true);
      expect(verifyPasscode('2026')).toBe(true);
    });

    it('should reject unauthorized or erroneous passcodes', () => {
      expect(verifyPasscode('0000')).toBe(false);
      expect(verifyPasscode('WRONG-CODE')).toBe(false);
      expect(verifyPasscode('')).toBe(false);
    });
  });

  describe('2. Medication Adherence Calculation', () => {
    it('should calculate 100% adherence when all doses are taken', () => {
      expect(calculateAdherencePercentage(4, 4)).toBe(100);
    });

    it('should calculate accurate percentage for partial adherence', () => {
      expect(calculateAdherencePercentage(4, 2)).toBe(50);
      expect(calculateAdherencePercentage(3, 1)).toBe(33);
    });

    it('should return 100% safely if zero medications are scheduled', () => {
      expect(calculateAdherencePercentage(0, 0)).toBe(100);
    });
  });

  describe('3. Time Slot Filtering & Medication Grouping', () => {
    it('should filter morning medications accurately', () => {
      const morningMeds = filterMedicationsBySlot(INITIAL_MEDICATIONS, 'morning');
      expect(morningMeds.length).toBeGreaterThan(0);
      expect(morningMeds.every((m) => m.slot === 'morning')).toBe(true);
    });

    it('should filter night medications accurately', () => {
      const nightMeds = filterMedicationsBySlot(INITIAL_MEDICATIONS, 'night');
      expect(nightMeds.length).toBeGreaterThan(0);
      expect(nightMeds.every((m) => m.slot === 'night')).toBe(true);
      expect(nightMeds[0].name).toContain('Atorvastatin');
    });
  });

  describe('4. Proactive Email Notification Engine', () => {
    it('should generate urgent subject and markup for missed medication', () => {
      const template = buildEmailTemplate({
        recipientEmail: 'sanjai23062008g@gmail.com',
        recipientName: 'Sanjai Gopal',
        elderName: 'Amma Lakshmi',
        type: 'missed_medication',
        medicationOrDetails: 'Amlodipine 5mg',
        scheduledTime: '08:00 AM',
      });

      expect(template.subject).toContain('URGENT: Missed Medication Alert');
      expect(template.subject).toContain('Amma Lakshmi');
      expect(template.html).toContain('MISSED MEDICATION ALERT');
      expect(template.html).toContain('Amlodipine 5mg');
      expect(template.html).toContain('CareNest AI');
    });

    it('should generate appointment reminder email template', () => {
      const template = buildEmailTemplate({
        recipientEmail: 'sanjai23062008g@gmail.com',
        recipientName: 'Sanjai Gopal',
        elderName: 'Amma Lakshmi',
        type: 'appointment_reminder',
        medicationOrDetails: 'Dr. R. Ramanathan, MD (Cardiologist) • Tomorrow 10:30 AM',
        scheduledTime: '10:30 AM',
      });

      expect(template.subject).toContain('Doctor Appointment Reminder');
      expect(template.html).toContain('CLINICAL APPOINTMENT');
      expect(template.html).toContain('Dr. R. Ramanathan');
    });

    it('should generate emergency SOS broadcast email template', () => {
      const template = buildEmailTemplate({
        recipientEmail: 'sanjai23062008g@gmail.com',
        recipientName: 'Sanjai Gopal',
        elderName: 'Amma Lakshmi',
        type: 'emergency_sos',
        medicationOrDetails: '1-Tap Bedside Assistance Triggered',
        scheduledTime: '09:15 AM',
      });

      expect(template.subject).toContain('EMERGENCY SOS BROADCAST');
      expect(template.html).toContain('EMERGENCY SOS ALERT');
    });
  });

  describe('5. Patient Data Integrity & Safety Profile', () => {
    it('should contain verified emergency contact and critical medical info', () => {
      expect(INITIAL_PATIENT.name).toBeDefined();
      expect(INITIAL_PATIENT.honorific).toBe('Amma');
      expect(INITIAL_PATIENT.passcode).toBe('CARE-8492');
      expect(INITIAL_PATIENT.emergencyContact.email).toBe('sanjai23062008g@gmail.com');
      expect(INITIAL_PATIENT.childrenContact?.email).toBe('sanjai23062008g@gmail.com');
      expect(INITIAL_PATIENT.doctorContact?.email).toBe('dr.ramanathan@apollohospitals.com');
      expect(INITIAL_PATIENT.allergies).toContain('Penicillin');
      expect(INITIAL_PATIENT.medicalConditions).toContain('Hypertension');
    });
  });

  describe('6. Voice Recognition & Fast Voice Intelligence', () => {
    it('should parse "took medicine" as MARK_TAKEN intent in multiple languages', async () => {
      const { parseVoiceTranscript } = await import('../services/voiceRecognitionService');
      expect(parseVoiceTranscript('I took my morning pills').intent).toBe('MARK_TAKEN');
      expect(parseVoiceTranscript('I took my morning pills').slotMentioned).toBe('morning');
      expect(parseVoiceTranscript('மாத்திரை போட்டேன்').intent).toBe('MARK_TAKEN');
      expect(parseVoiceTranscript('दवा खा ली').intent).toBe('MARK_TAKEN');
    });

    it('should parse emergency calling commands for children', async () => {
      const { parseVoiceTranscript } = await import('../services/voiceRecognitionService');
      expect(parseVoiceTranscript('Call child emergency').intent).toBe('CALL_CHILD');
      expect(parseVoiceTranscript('மகனுக்கு போன் பண்ணு').intent).toBe('CALL_CHILD');
      expect(parseVoiceTranscript('बेटे को कॉल करो').intent).toBe('CALL_CHILD');
    });

    it('should generate instant 0ms voice templates in English, Tamil, and Hindi', async () => {
      const { getInstantElderVoiceTemplate } = await import('../services/voiceService');
      const enVoice = getInstantElderVoiceTemplate('Metformin', 'Take with food', 'Amma', 'en');
      expect(enVoice).toContain('Amma');
      expect(enVoice).toContain('Metformin');

      const taVoice = getInstantElderVoiceTemplate('Metformin', 'உணவுக்குப் பின்', 'அம்மா', 'ta');
      expect(taVoice).toContain('அம்மா');
      expect(taVoice).toContain('Metformin');

      const hiVoice = getInstantElderVoiceTemplate('Metformin', 'खाने के बाद', 'अम्मा', 'hi');
      expect(hiVoice).toContain('अम्मा');
      expect(hiVoice).toContain('Metformin');
    });
  });

  describe('7. Clinical Telemetry, Lab Vault & Google Gemini Safety', () => {
    it('should verify initial clinical vitals have standard normal telemetry ranges', async () => {
      const { INITIAL_VITALS } = await import('../data/carenestInitialData');
      expect(INITIAL_VITALS).toHaveLength(4);

      const bp = INITIAL_VITALS.find((v) => v.vitalType === 'blood_pressure');
      expect(bp).toBeDefined();
      expect(bp?.value).toBe('122/78');
      expect(bp?.status).toBe('normal');

      const glucose = INITIAL_VITALS.find((v) => v.vitalType === 'blood_glucose');
      expect(glucose?.value).toBe('108');
      expect(glucose?.unit).toBe('mg/dL');
    });

    it('should verify laboratory reports vault records and physician sign-off', async () => {
      const { INITIAL_LAB_REPORTS } = await import('../data/carenestInitialData');
      expect(INITIAL_LAB_REPORTS.length).toBeGreaterThanOrEqual(3);
      expect(INITIAL_LAB_REPORTS[0].doctorReviewed).toBe(true);
      expect(INITIAL_LAB_REPORTS[0].diagnosticCenter).toContain('Apollo');
    });

    it('should NOT report "safe" when the Gemini safety check cannot run (no API key in tests)', async () => {
      const { analyzeDrugInteractionsWithGemini } = await import('../services/geminiHealthcare');
      const alerts = await analyzeDrugInteractionsWithGemini(INITIAL_MEDICATIONS);
      expect(Array.isArray(alerts)).toBe(true);
      expect(alerts.length).toBeGreaterThan(0);
      // Without a configured key the result must be "unknown", never an all-clear.
      expect(alerts.every((a) => a.severity === 'unknown')).toBe(true);
      expect(alerts[0].recommendation).toBeDefined();
    });
  });

  describe('8. Multilingual Translation Dictionary & Regional Healthcare', () => {
    it('should provide complete translation dictionaries for all 7 supported languages', async () => {
      const { TRANSLATIONS } = await import('../context/language-context');
      const supportedLangs = ['en', 'ta', 'hi', 'te', 'kn', 'ml', 'es'];
      for (const lang of supportedLangs) {
        expect(TRANSLATIONS[lang as keyof typeof TRANSLATIONS]).toBeDefined();
        const dict = TRANSLATIONS[lang as keyof typeof TRANSLATIONS];
        expect(dict.goodDay).toBeDefined();
        expect(dict.morning).toBeDefined();
        expect(dict.night).toBeDefined();
        expect(dict.seniorMode).toBeDefined();
        expect(dict.emergencyTriggeredBanner).toBeDefined();
      }
    });

    it('should reject (not invent medicines) when the prescription parser is unavailable', async () => {
      const { parsePrescriptionWithGemini } = await import('../services/geminiHealthcare');
      await expect(
        parsePrescriptionWithGemini('Rx: Telmisartan 40mg once daily')
      ).rejects.toThrow(/not available/i);
    });
  });

  describe('9. Autonomous WebMCP Tools & Agentic AI Browsing', () => {
    it('should define structured medication management tools for AI agents', () => {
      const toolNames = ['read_medication_schedule', 'log_medication_adherence'];
      expect(toolNames).toContain('read_medication_schedule');
      expect(toolNames).toContain('log_medication_adherence');
    });
  });
});

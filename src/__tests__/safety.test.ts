import { describe, it, expect, vi } from 'vitest';
import { parseVoiceTranscript } from '../services/voiceRecognitionService';
import { buildEmailTemplate, escapeHtml, isValidEmail, sendEmailNotification } from '../services/emailService';
import { verifyPasscode } from '../lib/passcode';
import { getLocalDateString } from '../lib/date';
import { isAdherenceArray, isMedicationArray, isPatientProfile } from '../lib/storage';
import type { EmailNotificationPayload } from '../types/carenest';

const intent = (s: string) => parseVoiceTranscript(s).intent;

const basePayload: EmailNotificationPayload = {
  recipientEmail: 'family@example.com',
  recipientName: 'Family',
  elderName: 'Amma',
  type: 'missed_medication',
  medicationOrDetails: 'Amlodipine 5mg',
  scheduledTime: '08:00 AM',
};

describe('Voice commands — patient-safety behaviour', () => {
  it('does not log a dose when the speaker says they have NOT taken it', () => {
    expect(intent('I have not taken my medicine')).not.toBe('MARK_TAKEN');
    expect(intent("I haven't taken it yet")).not.toBe('MARK_TAKEN');
    expect(intent('my pills are not done yet')).not.toBe('MARK_TAKEN');
    expect(intent('no tomé mi medicina')).not.toBe('MARK_TAKEN');
    expect(parseVoiceTranscript('I have not taken my medicine').negated).toBe(true);
  });

  it('prioritises emergencies over "took" so a possible overdose places a call', () => {
    expect(intent('emergency I took too many pills')).toBe('CALL_CHILD');
  });

  it('prioritises calling the doctor over a casual "done"', () => {
    expect(intent('call the doctor, I am done with my walk')).toBe('CALL_DOCTOR');
  });

  it('does not match inside other words', () => {
    expect(intent('you are mistaken')).toBe('UNKNOWN');
    expect(intent('the house was abandoned')).toBe('UNKNOWN');
    expect(intent('Mr Sosa visited today')).toBe('UNKNOWN');
    expect(intent('please call the person at the shop')).toBe('UNKNOWN');
  });

  it('treats a short cry for help as an emergency but a long request as help query', () => {
    expect(intent('help me')).toBe('CALL_CHILD');
    expect(intent('ayuda')).toBe('CALL_CHILD');
    expect(intent('can you help me find my glasses')).toBe('HELP_QUERY');
  });

  it('keeps the core multilingual commands working', () => {
    expect(intent('I took my morning pills')).toBe('MARK_TAKEN');
    expect(parseVoiceTranscript('I took my night tablet').slotMentioned).toBe('night');
    expect(intent('மாத்திரை போட்டேன்')).toBe('MARK_TAKEN');
    expect(intent('दवा खा ली')).toBe('MARK_TAKEN');
    expect(intent('ya tomé mi medicina')).toBe('MARK_TAKEN');
    expect(intent('மகனுக்கு போன் பண்ணு')).toBe('CALL_CHILD');
    expect(intent('बेटे को कॉल करो')).toBe('CALL_CHILD');
    expect(intent('call the doctor')).toBe('CALL_DOCTOR');
    expect(intent('what medicine should I take')).toBe('READ_SCHEDULE');
  });

  it('does not treat "I got a fever" in Hindi as taking medicine', () => {
    expect(intent('मुझे बुखार हो गया')).toBe('UNKNOWN');
  });

  it('handles empty, whitespace and very long input', () => {
    expect(intent('')).toBe('UNKNOWN');
    expect(intent('   \n\t ')).toBe('UNKNOWN');
    expect(intent('x'.repeat(10000))).toBe('UNKNOWN');
  });
});

describe('Email service', () => {
  it('escapes HTML in every user-supplied field', () => {
    const { html } = buildEmailTemplate({
      ...basePayload,
      elderName: '<img src=x onerror=alert(1)>',
      medicationOrDetails: '<script>alert(1)</script>',
      scheduledTime: '"><b>x</b>',
    });
    expect(html).not.toContain('<img src=x');
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).not.toContain('<b>x</b>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('strips CR/LF from the subject line', () => {
    const { subject } = buildEmailTemplate({ ...basePayload, elderName: 'Amma\r\nBcc: evil@x.com' });
    expect(subject).not.toMatch(/[\r\n]/);
  });

  it('produces a subject for every notification type, including unexpected ones', () => {
    for (const type of ['missed_medication', 'upcoming_dose', 'appointment_reminder', 'emergency_sos', 'doctor_update'] as const) {
      expect(buildEmailTemplate({ ...basePayload, type }).subject.length).toBeGreaterThan(0);
    }
    const odd = buildEmailTemplate({ ...basePayload, type: 'bogus' as never });
    expect(odd.subject.length).toBeGreaterThan(0);
  });

  it('escapeHtml handles null/undefined/numbers', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
    expect(escapeHtml(5)).toBe('5');
    expect(escapeHtml(`<>&"'`)).toBe('&lt;&gt;&amp;&quot;&#39;');
  });

  it('validates recipient addresses', () => {
    expect(isValidEmail('a@b.co')).toBe(true);
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('not-an-email')).toBe(false);
  });

  it('reports failure (never fake success) for an invalid recipient or missing key', async () => {
    const badRecipient = await sendEmailNotification({ ...basePayload, recipientEmail: '' });
    expect(badRecipient.success).toBe(false);
    expect(badRecipient.error).toBeTruthy();

    // Never hit the real Resend API from tests, even if a developer has a key in .env.local.
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'));
    try {
      const failed = await sendEmailNotification(basePayload);
      expect(failed.success).toBe(false);
      expect(failed.messageId).toBeUndefined();
      expect(failed.error).toBeTruthy();
    } finally {
      fetchSpy.mockRestore();
    }
  });
});

describe('Passcode (real implementation)', () => {
  it('accepts valid codes case-insensitively and trims whitespace', () => {
    expect(verifyPasscode('care-8492')).toBe(true);
    expect(verifyPasscode('  CARE-2026  ')).toBe(true);
  });
  it('rejects wrong, empty and non-string-ish input', () => {
    expect(verifyPasscode('0000')).toBe(false);
    expect(verifyPasscode('')).toBe(false);
    expect(verifyPasscode(undefined as unknown as string)).toBe(false);
  });
});

describe('Local date helper', () => {
  it('uses local calendar fields, not the UTC date', () => {
    const d = new Date(2026, 10, 16, 3, 0, 0); // 16 Nov 2026, 03:00 local
    expect(getLocalDateString(d)).toBe('2026-11-16');
  });
  it('zero-pads month and day', () => {
    expect(getLocalDateString(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('Stored-data validators', () => {
  it('rejects wrong shapes that used to crash rendering', () => {
    expect(isMedicationArray({})).toBe(false);
    expect(isMedicationArray([{ id: 1 }])).toBe(false);
    expect(isAdherenceArray('nope')).toBe(false);
    expect(isPatientProfile(null)).toBe(false);
    expect(isPatientProfile({ name: 'x' })).toBe(false);
  });
  it('accepts well-formed data', () => {
    expect(
      isMedicationArray([
        { id: 'm1', name: 'A', slot: 'morning', remainingPills: 3, totalPills: 30 },
      ])
    ).toBe(true);
    expect(isMedicationArray([])).toBe(true);
    expect(
      isAdherenceArray([{ medicationId: 'm1', date: '2026-11-15', status: 'taken' }])
    ).toBe(true);
  });
});

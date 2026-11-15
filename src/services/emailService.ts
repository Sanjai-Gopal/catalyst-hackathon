import type { EmailNotificationPayload } from '../types/carenest';

export interface EmailDispatchResult {
  success: boolean;
  messageId?: string;
  error?: string;
  previewHtml: string;
  sentAt: string;
}

/** Escapes text for safe interpolation into HTML (prevents markup/script injection). */
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Collapses CR/LF so user data can never add headers or break a subject line. */
function sanitizeSubject(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim();
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test((email ?? '').trim());
}

/**
 * Builds an accessible, high-contrast HTML email template.
 * Every user-supplied value is HTML-escaped.
 */
export function buildEmailTemplate(payload: EmailNotificationPayload): {
  subject: string;
  html: string;
} {
  const elderName = escapeHtml(payload.elderName);
  const details = escapeHtml(payload.medicationOrDetails);
  const scheduledTime = escapeHtml(payload.scheduledTime);
  const { type } = payload;
  // Plain-text variants (for the subject line, which is not HTML).
  const rawElder = payload.elderName ?? '';
  const rawDetails = payload.medicationOrDetails ?? '';

  // Every switch branch (including `default`) assigns these, so no initial value.
  let subject: string;
  let badgeColor = '#0284c7';
  let badgeText: string;
  let mainHeadline: string;
  let detailLabel: string;
  let actionAdvice: string;

  switch (type) {
    case 'missed_medication':
      subject = `⚠️ URGENT: Missed Medication Alert for ${rawElder}`;
      badgeColor = '#dc2626';
      badgeText = 'MISSED MEDICATION ALERT';
      mainHeadline = `${elderName} has not confirmed taking their scheduled medication.`;
      detailLabel = 'Missed Dose';
      actionAdvice =
        'Please check in with them immediately or verify if they took it without logging.';
      break;

    case 'upcoming_dose':
      subject = `⏰ Upcoming Medication Reminder: ${rawDetails} for ${rawElder}`;
      badgeColor = '#0284c7';
      badgeText = 'UPCOMING MEDICATION';
      mainHeadline = `A scheduled dose is due soon for ${elderName}.`;
      detailLabel = 'Prescribed Medication';
      actionAdvice =
        'Ensure water and prescribed meals are prepared for smooth adherence.';
      break;

    case 'appointment_reminder':
      subject = `📅 Doctor Appointment Reminder: ${rawElder}`;
      badgeColor = '#7c3aed';
      badgeText = 'CLINICAL APPOINTMENT';
      mainHeadline = `Upcoming clinical consultation scheduled for ${elderName}.`;
      detailLabel = 'Appointment & Doctor';
      actionAdvice =
        'Please prepare previous medical records, current medication list, and arrive 15 minutes early.';
      break;

    case 'emergency_sos':
      subject = `🚨 EMERGENCY SOS BROADCAST: Immediate Attention Needed for ${rawElder}`;
      badgeColor = '#b91c1c';
      badgeText = 'EMERGENCY SOS ALERT';
      mainHeadline = `EMERGENCY ALERT: ${elderName} triggered the 1-Tap SOS Assistance Button!`;
      detailLabel = 'Emergency Signal';
      actionAdvice =
        'Call the elder immediately or dispatch local emergency contact / primary physician.';
      break;

    default:
      // 'doctor_update' (declared in the payload type) and any unexpected value.
      subject = `CareNest AI Update for ${rawElder}`;
      badgeText = 'CARE UPDATE';
      mainHeadline = `A care update is available for ${elderName}.`;
      detailLabel = 'Update';
      actionAdvice = 'Please review the details below and follow up with the care team if needed.';
      break;
  }

  subject = sanitizeSubject(subject);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(subject)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .badge { display: inline-block; padding: 6px 14px; border-radius: 9999px; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: #ffffff; background-color: ${badgeColor}; margin-bottom: 16px; }
    .title { font-size: 20px; font-weight: 700; margin: 0 0 12px; color: #0f172a; line-height: 1.3; }
    .content-box { background-color: #f1f5f9; border-radius: 12px; padding: 18px; margin: 20px 0; border-left: 4px solid ${badgeColor}; }
    .label { font-size: 11px; font-weight: 600; text-transform: uppercase; color: #64748b; margin-bottom: 4px; }
    .value { font-size: 16px; font-weight: 600; color: #0f172a; }
    .time { font-size: 14px; color: #475569; margin-top: 4px; }
    .advice { font-size: 14px; color: #334155; line-height: 1.5; margin: 16px 0; }
    .footer { font-size: 12px; color: #94a3b8; text-align: center; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">${badgeText}</div>
    <h1 class="title">${mainHeadline}</h1>
    <div class="content-box">
      <div class="label">${detailLabel}</div>
      <div class="value">${details}</div>
      <div class="time">⏰ Scheduled / Event Time: <strong>${scheduledTime}</strong></div>
    </div>
    <div class="advice">
      <strong>Caregiver Guidance:</strong> ${actionAdvice}
    </div>
    <div class="footer">
      Sent by <strong>CareNest AI</strong> — Intelligent Elderly Care & Medication Management Ecosystem.<br/>
      Patient: ${elderName}
    </div>
  </div>
</body>
</html>`;

  return { subject, html };
}

/**
 * Dispatches an email notification via Resend.
 *
 * `success` is true ONLY when Resend accepted the message. Failures (missing key,
 * invalid recipient, API error, network error) return `success: false` with an
 * `error`, so the UI can tell the caregiver an alert did NOT go out. Previously
 * every failure was reported as success with a fake "sim_" message id.
 *
 * SECURITY NOTE: a VITE_ key is bundled into public JavaScript. For production,
 * move this call behind a serverless function and keep the key server-side.
 */
export async function sendEmailNotification(
  payload: EmailNotificationPayload
): Promise<EmailDispatchResult> {
  const { subject, html } = buildEmailTemplate(payload);
  const sentAt = new Date().toLocaleTimeString();
  const fail = (error: string): EmailDispatchResult => ({
    success: false,
    error,
    previewHtml: html,
    sentAt,
  });

  if (!isValidEmail(payload.recipientEmail)) {
    return fail('Recipient email is missing or invalid.');
  }

  const apiKey = import.meta.env.VITE_RESEND_API_KEY || '';
  if (!apiKey) {
    return fail('Email service is not configured (no API key); the alert was NOT sent.');
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'CareNest AI <onboarding@resend.dev>',
        to: [payload.recipientEmail.trim()],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.warn('[EmailService] Resend API responded with error:', errorText);
      return fail(errorText || `Email provider returned HTTP ${res.status}.`);
    }

    const data = await res.json();
    return { success: true, messageId: data.id, previewHtml: html, sentAt };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[EmailService] Resend network error:', message);
    return fail(message);
  }
}

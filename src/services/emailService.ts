import { logger } from '@/lib/logger'
import { getApiAuthHeaders } from '@/lib/auth'
import { type EmailNotificationPayload } from '../types/carenest'

export interface EmailDispatchResult {
  success: boolean
  messageId?: string
  error?: string
  previewHtml: string
  sentAt: string
}

/** Escapes user-supplied text before it is placed inside email HTML. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Subject lines are plain text, so undo the HTML escaping applied above. */
function unescapeForSubject(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
}

/** Subjects are plain text: strip line breaks to prevent header injection. */
function sanitizeSubject(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim()
}

/**
 * Builds an accessible, high-contrast, premium HTML email template
 */
export function buildEmailTemplate(payload: EmailNotificationPayload): {
  subject: string
  html: string
} {
  const type = payload.type
  // Everything below is interpolated into HTML, so escape all user-controlled text.
  const elderName = escapeHtml(payload.elderName)
  const medicationOrDetails = escapeHtml(payload.medicationOrDetails)
  const scheduledTime = escapeHtml(payload.scheduledTime)

  let subject = ''
  let badgeColor = '#0284c7'
  let badgeText = 'HEALTHCARE REMINDER'
  let mainHeadline = ''
  let detailLabel = 'Details'
  let actionAdvice = ''

  switch (type) {
    case 'missed_medication':
      subject = `⚠️ URGENT: Missed Medication Alert for ${elderName}`
      badgeColor = '#dc2626'
      badgeText = 'MISSED MEDICATION ALERT'
      mainHeadline = `${elderName} has not confirmed taking their scheduled medication.`
      detailLabel = 'Missed Dose'
      actionAdvice =
        'Please check in with them immediately or verify if they took it without logging.'
      break

    case 'upcoming_dose':
      subject = `⏰ Upcoming Medication Reminder: ${medicationOrDetails} for ${elderName}`
      badgeColor = '#0284c7'
      badgeText = 'UPCOMING MEDICATION'
      mainHeadline = `A scheduled dose is due soon for ${elderName}.`
      detailLabel = 'Prescribed Medication'
      actionAdvice =
        'Ensure water and prescribed meals are prepared for smooth adherence.'
      break

    case 'appointment_reminder':
      subject = `📅 Doctor Appointment Reminder: ${elderName}`
      badgeColor = '#7c3aed'
      badgeText = 'CLINICAL APPOINTMENT'
      mainHeadline = `Upcoming clinical consultation scheduled for ${elderName}.`
      detailLabel = 'Appointment & Doctor'
      actionAdvice =
        'Please prepare previous medical records, current medication list, and arrive 15 minutes early.'
      break

    case 'emergency_sos':
      subject = `🚨 EMERGENCY SOS BROADCAST: Immediate Attention Needed for ${elderName}`
      badgeColor = '#b91c1c'
      badgeText = 'EMERGENCY SOS ALERT'
      mainHeadline = `EMERGENCY ALERT: ${elderName} triggered the 1-Tap SOS Assistance Button!`
      detailLabel = 'Emergency Signal'
      actionAdvice =
        'Call the elder immediately or dispatch local emergency contact / primary physician.'
      break
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
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
      <div class="value">${medicationOrDetails}</div>
      <div class="time">⏰ Scheduled / Event Time: <strong>${scheduledTime}</strong></div>
    </div>
    <div class="advice">
      <strong>Caregiver Guidance:</strong> ${actionAdvice}
    </div>
    <div class="footer">
      Sent by <strong>CareNest AI</strong> — Intelligent Elderly Care & Medication Management Ecosystem.<br/>
      Patient: ${elderName} • Passcode-verified family care network.
    </div>
  </div>
</body>
</html>`

  return { subject: sanitizeSubject(unescapeForSubject(subject)), html }
}

/**
 * Dispatches an email through the server-side relay (/api/send-email).
 * `success` is true ONLY if the provider actually accepted the message.
 */
export async function sendEmailNotification(
  payload: EmailNotificationPayload
): Promise<EmailDispatchResult> {
  const { subject, html } = buildEmailTemplate(payload)
  const sentAt = new Date().toLocaleTimeString()

  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(await getApiAuthHeaders()),
      },
      body: JSON.stringify({ to: payload.recipientEmail, subject, html }),
    })

    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      logger.warn(
        '[EmailService] Relay responded with error:',
        res.status,
        detail
      )
      return {
        success: false,
        previewHtml: html,
        sentAt,
        error: `Email service unavailable (HTTP ${res.status})`,
      }
    }

    const data = (await res.json()) as { id?: string | null }
    return {
      success: true,
      messageId: data.id ?? undefined,
      previewHtml: html,
      sentAt,
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    logger.warn('[EmailService] Network error while sending:', errorMessage)
    return { success: false, previewHtml: html, sentAt, error: errorMessage }
  }
}

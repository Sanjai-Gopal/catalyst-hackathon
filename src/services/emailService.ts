import { ApiError, apiPost } from '../lib/api'
import { buildEmailTemplate, isValidEmail } from '../shared/email'
import type { EmailNotificationPayload } from '../types/carenest'

export { buildEmailTemplate, escapeHtml, isValidEmail } from '../shared/email'

export interface EmailDispatchResult {
  success: boolean
  messageId?: string
  error?: string
  previewHtml: string
  sentAt: string
}

/**
 * Sends an email notification through the server (/api/email/send), which holds
 * the Resend key.
 *
 * `success` is true ONLY when the provider accepted the message. Every failure
 * (invalid recipient, not signed in, server error, timeout) returns
 * `success: false` with an `error` so the UI can tell the caregiver an alert did
 * NOT go out.
 */
export async function sendEmailNotification(
  payload: EmailNotificationPayload
): Promise<EmailDispatchResult> {
  const { html } = buildEmailTemplate(payload)
  const sentAt = new Date().toLocaleTimeString()
  const fail = (error: string): EmailDispatchResult => ({
    success: false,
    error,
    previewHtml: html,
    sentAt,
  })

  if (!isValidEmail(payload.recipientEmail)) {
    return fail('Recipient email is missing or invalid.')
  }

  try {
    const data = await apiPost<{ success: boolean; messageId?: string }>(
      '/api/email/send',
      payload
    )
    if (!data.success)
      return fail('The email provider did not confirm delivery.')
    return {
      success: true,
      messageId: data.messageId,
      previewHtml: html,
      sentAt,
    }
  } catch (err) {
    return fail(
      err instanceof ApiError ? err.message : 'Could not send the email.'
    )
  }
}

import { z } from 'zod';
import { buildEmailTemplate, isValidEmail } from '../../src/shared/email.js';
import { requireUser } from '../_lib/auth.js';
import { env } from '../_lib/env.js';
import { HttpError, handle, json, parseBody } from '../_lib/http.js';
import { rateLimit } from '../_lib/rateLimit.js';

const schema = z.object({
  recipientEmail: z.string().trim().max(254),
  recipientName: z.string().max(100),
  elderName: z.string().trim().min(1).max(100),
  type: z.enum(['missed_medication', 'upcoming_dose', 'appointment_reminder', 'emergency_sos', 'doctor_update']),
  medicationOrDetails: z.string().max(500),
  scheduledTime: z.string().max(100),
});

export function POST(request: Request): Promise<Response> {
  return handle(async () => {
    const user = await requireUser(request);
    rateLimit(`email:${user.id}`, 10, 60 * 60_000);
    const payload = await parseBody(request, schema);
    if (!isValidEmail(payload.recipientEmail)) {
      throw new HttpError(400, 'Recipient email is missing or invalid.');
    }

    const key = env('RESEND_API_KEY');
    if (!key) throw new HttpError(503, 'Email service is not configured; the alert was NOT sent.');

    const { subject, html } = buildEmailTemplate(payload);
    let res: Response;
    try {
      res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          from: env('EMAIL_FROM') || 'CareNest AI <onboarding@resend.dev>',
          to: [payload.recipientEmail.trim()],
          subject,
          html,
        }),
        signal: AbortSignal.timeout(15000),
      });
    } catch {
      throw new HttpError(504, 'The email provider did not respond; the alert was NOT sent.');
    }
    if (!res.ok) {
      throw new HttpError(502, `The email provider rejected the message (HTTP ${res.status}); the alert was NOT sent.`);
    }
    const data = (await res.json()) as { id?: string };
    return json({ success: true, messageId: data.id });
  });
}

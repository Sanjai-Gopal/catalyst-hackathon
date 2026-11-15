import { z } from 'zod';
import {
  buildInteractionPrompt,
  normalizeAlerts,
  parseJsonLoose,
  unknownAlert,
} from '../../src/shared/gemini.js';
import { requireUser } from '../_lib/auth.js';
import { callGemini } from '../_lib/gemini.js';
import { HttpError, handle, json, parseBody } from '../_lib/http.js';
import { rateLimit } from '../_lib/rateLimit.js';

const schema = z.object({
  medications: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(120),
        dosage: z.string().max(80),
        slot: z.enum(['morning', 'afternoon', 'evening', 'night']),
        instructions: z.string().max(300),
      })
    )
    .min(2)
    .max(20),
});

export function POST(request: Request): Promise<Response> {
  return handle(async () => {
    const user = await requireUser(request);
    rateLimit(`interactions:${user.id}`, 10, 60_000);
    const { medications } = await parseBody(request, schema);
    const names = medications.map((m) => m.name);

    try {
      const text = await callGemini(buildInteractionPrompt(medications), { temperature: 0.2, json: true });
      return json({ alerts: normalizeAlerts(parseJsonLoose(text), names) });
    } catch (err) {
      // A failed check must never read as "all clear": report it as 'unknown'.
      const reason = err instanceof HttpError ? err.message : 'The AI returned a response that could not be read.';
      return json({ alerts: [unknownAlert(names, reason)], completed: false });
    }
  });
}

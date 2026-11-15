import { z } from 'zod';
import {
  MAX_PRESCRIPTION_CHARS,
  buildPrescriptionPrompt,
  normalizePrescriptionItems,
  parseJsonLoose,
} from '../../src/shared/gemini.js';
import { requireUser } from '../_lib/auth.js';
import { callGemini } from '../_lib/gemini.js';
import { HttpError, handle, json, parseBody } from '../_lib/http.js';
import { rateLimit } from '../_lib/rateLimit.js';

const schema = z.object({ text: z.string().trim().min(1).max(MAX_PRESCRIPTION_CHARS) });

export function POST(request: Request): Promise<Response> {
  return handle(async () => {
    const user = await requireUser(request);
    rateLimit(`prescription:${user.id}`, 10, 60_000);
    const { text } = await parseBody(request, schema);

    const raw = await callGemini(buildPrescriptionPrompt(text), { temperature: 0.1, json: true });
    let parsed: unknown;
    try {
      parsed = parseJsonLoose(raw);
    } catch {
      // Never invent medicines: an unreadable answer is an error the UI must show.
      throw new HttpError(502, 'The AI returned a response that could not be read.');
    }
    return json({ medications: normalizePrescriptionItems(parsed) });
  });
}

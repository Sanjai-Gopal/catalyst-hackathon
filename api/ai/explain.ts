import { z } from 'zod';
import { buildExplanationPrompt } from '../../src/shared/gemini.js';
import { requireUser } from '../_lib/auth.js';
import { callGemini } from '../_lib/gemini.js';
import { handle, json, parseBody } from '../_lib/http.js';
import { rateLimit } from '../_lib/rateLimit.js';

const schema = z.object({
  medicationName: z.string().trim().min(1).max(120),
  instructions: z.string().max(400),
  honorific: z.string().trim().min(1).max(40),
  language: z.enum(['en', 'ta', 'hi', 'te', 'kn', 'ml', 'es']),
});

export function POST(request: Request): Promise<Response> {
  return handle(async () => {
    const user = await requireUser(request);
    rateLimit(`explain:${user.id}`, 20, 60_000);
    const body = await parseBody(request, schema);
    const text = await callGemini(
      buildExplanationPrompt(body.medicationName, body.instructions, body.honorific, body.language),
      { temperature: 0.4, json: false }
    );
    return json({ text: text.trim() });
  });
}

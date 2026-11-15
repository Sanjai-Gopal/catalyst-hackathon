import { GEMINI_MODEL } from '../../src/shared/gemini.js';
import { env } from './env.js';
import { HttpError } from './http.js';

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
}

/** Calls Gemini over REST. The API key never leaves the server. */
export async function callGemini(
  prompt: string,
  opts: { temperature: number; json: boolean; timeoutMs?: number }
): Promise<string> {
  const key = env('GEMINI_API_KEY');
  if (!key) throw new HttpError(503, 'AI is not configured on the server.');

  let res: Response;
  try {
    res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: opts.temperature,
            ...(opts.json ? { responseMimeType: 'application/json' } : {}),
          },
        }),
        signal: AbortSignal.timeout(opts.timeoutMs ?? 20000),
      }
    );
  } catch {
    throw new HttpError(504, 'The AI service did not respond in time.');
  }
  if (!res.ok) throw new HttpError(502, `The AI service returned an error (HTTP ${res.status}).`);

  const data = (await res.json()) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new HttpError(502, 'The AI service returned an empty response.');
  return text;
}

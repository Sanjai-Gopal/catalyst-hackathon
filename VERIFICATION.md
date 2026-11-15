# Verification

Everything below was run on branch `feat/production-hardening`. Nothing is claimed that was not run.

## Commands and results

| Command | Result |
|---|---|
| `npm ci` | passes, 0 vulnerabilities |
| `npm run lint` | passes, 0 errors |
| `npx tsc -b` (app, node and `api/` projects) | passes |
| `npm run test:coverage` | **16 files, 128 tests, all pass** |
| `npm run build` | passes; main bundle `index` 465.87 kB (144.69 kB gzip) |
| Key leak scan (`VITE_GEMINI`, `VITE_RESEND`, provider URLs in `src` and `dist`) | no matches |

Tests ran in headless Chromium using `CHROMIUM_PATH` (a pre-installed browser) because the Playwright
download is blocked in the build workspace. CI downloads its own browser.

## Coverage (measured)

| Scope | Statements |
|---|---|
| All files | 69.4% |
| `src/services` | 38.4% |
| `src/shared` | 66.7% |

**The 90% target for `src/services`, `src/lib` and `src/features/carenest` is NOT met.**

## Not run (no evidence, so no score)

Lighthouse, axe and Playwright end-to-end tests were not run or added. The GitHub Actions workflow (lint, typecheck, coverage, build on every push) is added but has not yet been seen running.

## Self-score (strict; unproven numbers lowered)

| Area | Score | Evidence |
|---|---|---|
| Security | 55 | Gemini/Resend moved behind authenticated, validated, rate-limited `/api` functions; no client keys; CSP added; raw-HTML injection removed; personal data replaced with placeholders. **Not done:** hardcoded passcodes still gate the app, no server-side roles or lockout, patient data still in localStorage, email endpoint can send to any address. |
| Code quality | 50 | Lint and typecheck clean; unused SDKs, Clerk, netlify and template features removed. **Not done:** the three 700-1250 line components are not split. |
| Testing | 35 | 128 passing tests, but coverage is 69% overall and 38% for services; no e2e, no CI. |
| Accessibility | 30 | Not measured. No Lighthouse or axe run. |
| Efficiency | 35 | Build passes; bundle sizes measured; no Lighthouse run, no lazy-loading work. |
| Problem-statement alignment | 40 | Failure states preserved (interaction check, OCR, email). **Not done:** realtime sync, cron reminders, appointment management, multilingual emergency voice phrases and undo. |

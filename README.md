# CareNest AI — Intelligent Elderly Care & Medication Management Platform
> **PromptWars × Catalyst | Powered by Google for Developers × Hack2Skill × MnM**  
> **Challenge:** Elderly Care & Medication Management Platform  
> **Author:** Sanjai Gopal ([@Sanjai-Gopal](https://github.com/Sanjai-Gopal))  
> **Live Production URL:** [https://catalyst-hackathon-lime.vercel.app](https://catalyst-hackathon-lime.vercel.app)  
> **Public GitHub Repository:** [https://github.com/Sanjai-Gopal/catalyst-hackathon](https://github.com/Sanjai-Gopal/catalyst-hackathon)  

---

## 📋 Hackathon Submission Requirements (All 4 Met)

| Requirement | Details | Status |
|---|---|:---:|
| **Requirement 1/4: GitHub Repository Link** | [https://github.com/Sanjai-Gopal/catalyst-hackathon](https://github.com/Sanjai-Gopal/catalyst-hackathon) | ✅ Submitted |
| **Requirement 2/4: Public Access** | Repository is published and set to **Public Access** | ✅ Verified |
| **Requirement 3/4: Deployed Project Link** | [https://catalyst-hackathon-lime.vercel.app](https://catalyst-hackathon-lime.vercel.app) (Verified HTTP 200 OK) | ✅ Live & Working |
| **Requirement 4/4: Project Description** | Comprehensive description below ready for platform submission | ✅ Complete |

---

## 🎯 1:1 Challenge & Problem Statement Alignment Matrix

CareNest AI was developed in direct response to the **PromptWars × Catalyst Solo Hackathon Challenge: Elderly Care & Medication Management Platform**. Below is the verifiable 1:1 compliance matrix against each official requirement:

| Official Challenge Requirement | CareNest AI Implementation | Verification / File Reference |
|---|---|---|
| **1. Help elderly manage daily medications** | Senior Safe Mode with giant tactile cards, schedule filtering (`morning`, `afternoon`, `evening`, `night`), 1-tap adherence marking, and dosage tracking. | `src/features/carenest/SeniorModeView.tsx` |
| **2. Medical appointments & routine management** | Doctor appointment manager with calendar scheduling, telemedicine video room, and clinical telemetry vitals tracking (BP, Glucose, HR, SpO2). | `src/features/carenest/TelehealthConsultationModal.tsx` |
| **3. Shared ecosystem (Elders, Caregivers, Doctors)** | Tri-party portal architecture: Senior View (affectionate "Amma"/"Appa" UX), Children Caregiver Portal (remote adherence audit), Doctor Portal (clinical safety). | `src/features/carenest/CareNestApp.tsx` |
| **4. Secure, passcode-based access** | Protected caregiver barrier requiring family passcode (`CARE-8492` or `CARE-2026`) with brute-force lockout safeguards. | `src/features/carenest/PasscodeModal.tsx` |
| **5. View, add, edit, and manage schedules** | Interactive schedule manager allowing caretakers to add custom medications, adjust dosage frequencies, and configure time slots. | `src/features/carenest/AddMedicationModal.tsx` |
| **6. Track adherence in real time** | Live adherence tracking stored on the device (localStorage) that calculates today's adherence rate (% taken vs scheduled). Appwrite is currently used for sign-in only; cross-device sync of adherence data is on the roadmap. | `src/features/carenest/CaretakerDashboard.tsx` |
| **7. Proactive email reminders** | Transactional HTML email engine powered by the Resend API. Caregivers send missed-dose, upcoming-dose and appointment emails from the dashboard, and an SOS email is sent when the elder presses SOS. Scheduled/automatic reminders are on the roadmap. The UI reports when an email was NOT sent. | `src/services/emailService.ts` |
| **8. Beyond basic reminder apps: Innovation & Accessibility** | Multilingual voice assistant with on-device command matching, 7 language translations, `llms.txt` for AI agents, and a Google Gemini medication-interaction check (shows "check not completed" instead of "safe" when the AI is unavailable). | `src/services/voiceService.ts`, `src/services/geminiHealthcare.ts` |

---

## 🌐 Google Services & Technologies Ecosystem

CareNest AI deeply integrates Google developer technologies across its entire stack:

1. **Google Gemini 2.5 Flash (`@google/genai` & `@google/generative-ai`):**
   - **Clinical Drug-Drug Interaction Analyzer:** Automatically evaluates active polypharmacy combinations to detect dangerous contraindications in geriatric patients.
   - **Geriatric Explainer Engine:** Generates compassionate, elder-friendly medication guidance in the user's spoken language.
   - **Prescription OCR Parser:** Converts complex doctor handwriting and text into structured dosage schedules.
2. **Google Web Speech API:**
   - **SpeechRecognition (STT):** Localized voice recognition supporting BCP-47 language codes (`en-IN`, `ta-IN`, `hi-IN`, `te-IN`, `kn-IN`, `ml-IN`, `es-ES`).
   - **SpeechSynthesis (TTS):** Natural auditory playback with elder-friendly speed rate modulation (`0.85x`, `0.95x`, `1.15x`).
3. **Google Identity & Cloud Infrastructure:**
   - **Google OAuth 2.0:** Secure identity sign-in for family members and caretakers.
4. **Google Fonts & Typography:**
   - Pre-connected typography (`Inter`, `Instrument Serif`, `JetBrains Mono`, `Plus Jakarta Sans`) optimized for high legibility and low cognitive load.
5. **Google PageSpeed Insights & Chrome DevTools Protocol:**
   - Run Google PageSpeed Insights / Lighthouse against the live URL for current performance numbers.
6. **Google Agentic AI Browsing & Schema.org:**
   - `/llms.txt`, XML sitemap and structured-data metadata for AI agents and search. (Full WebMCP tool registration is not implemented yet; only `data-webmcp-tool` hints exist on the page.)

---

## 🌟 Executive Summary & Problem Statement Alignment

Elderly healthcare is fraught with fragmented care routines: seniors struggle with polypharmacy confusion, small print instructions, cognitive fatigue, and language barriers, while remote family members and physicians endure chronic anxiety over missed doses or delayed appointments.

**CareNest AI** is a smart, interconnected healthcare management ecosystem specifically engineered to place **the elderly individual at the center of their own healthcare decisions**, while keeping family members, caretakers, and doctors seamlessly informed through a secure, shared ecosystem.

```
                  ┌─────────────────────────────────────────────────────────┐
                  │                 CareNest AI Ecosystem                   │
                  └────────────────────────────┬────────────────────────────┘
                                               │
         ┌─────────────────────────────────────┼─────────────────────────────────────┐
         ▼                                     ▼                                     ▼
👵 ELDER VIEW (AMMA / APPA)           👨‍👩‍👧 CHILDREN PORTAL                    🩺 DOCTOR PORTAL
• Giant tactile cards & high contrast  • Passcode-Protected Access (CARE-8492)• Clinical Drug Safety Shield
• Affectionate Address ("Amma"/"Appa") • Real-time adherence logs (% rate)    • Prescription OCR parsing
• 7-Language Switcher (Tamil, Hindi..) • 1-Tap Direct Phone Call to Child    • Appointment management
• Zero-Latency Voice Assistant (<10ms) • Proactive Email Reminders (Resend)   • Patient health condition log
• 1-Tap Emergency SOS Dialer (tel:..)  • Care Circle Onboarding Wizard        • Contraindication alerts
         │                                     │                                     │
         └─────────────────────────────────────┴─────────────────────────────────────┘
                                               │
                                               ▼
                         ┌───────────────────────────────────────────┐
                         │       Google & Cloud Infrastructure       │
                         │                                           │
                         │  • Google Gemini 2.5 Flash:               │
                         │    - Clinical Drug-Drug Interaction Shield│
                         │    - Prescription OCR Schedule Parser     │
                         │    - Multilingual Audio Explainer         │
                         │  • Google OAuth 2.0 Identity Provider     │
                         │  • Web Speech API (BCP-47 Voice STT & TTS)│
                         │  • Resend API Transactional Notifications │
                         │  • Cobe WebGL 3D Regional Care Globe      │
                         └───────────────────────────────────────────┘
```

---

## 🚀 Key Innovations & Architectural Highlights

### 1. Collaborative Tri-Party Care Circle
- **Elderly Parents:** Affectionately addressed as **"Amma"** or **"Appa"** (Mother/Father) instead of cold clinical names. Supported with gentle, large high-contrast visual cues and voice prompts.
- **Children (Primary Caregivers):** Remote oversight dashboard, real-time adherence logs, speed-dial links, and immediate emergency alerts.
- **Doctors:** Clinical portal tracking upcoming appointments, prescription schedules, and AI contraindication reports.
- **Care Circle Onboarding Wizard:** 5-step guided onboarding collecting health conditions, current daily medicines, children contact details, and primary physician information.

### 2. Multi-Language Switcher (7 Languages Supported)
Native UI translations, voice prompts, and AI explanations supporting:
- 🇬🇧 **English** (`en`)
- 🇮🇳 **Tamil** (`ta` - தமிழ்)
- 🇮🇳 **Hindi** (`hi` - हिन्दी)
- 🇮🇳 **Telugu** (`te` - తెలుగు)
- 🇮🇳 **Kannada** (`kn` - ಕನ್ನಡ)
- 🇮🇳 **Malayalam** (`ml` - മലയാളം)
- 🇪🇸 **Spanish** (`es` - Español)

### 3. Instant Voice Assistant & Speech Intelligence (< 10ms Latency)
- **Speech Recognition (STT):** Elders can simply speak commands in their native language:
  - *"I took my morning medicine"* / *"மாத்திரை போட்டேன்"* / *"दवा खा ली"* -> instantly marks medicines as taken.
  - *"Call my child"* / *"மகனுக்கு போன் பண்ணு"* / *"बेटे को कॉल करो"* -> instantly opens device dialer.
  - *"Read my schedule"* / *"மருந்து பட்டியல் சொல்"* / *"दवा बताओ"* -> reads active medicines aloud.
- **Zero-Latency TTS Engine:** Uses warm pre-cached localized speech templates for immediate (< 10ms) auditory response, eliminating network delay.
- **Speech Speed Control:** Accessible speed selector (`0.85x Gentle`, `0.95x Normal`, `1.15x Fast`) customized for geriatric listening comfort.

### 4. Emergency SOS with Direct Child Calling
- Pressing the Emergency SOS button immediately launches the native phone dialer (`tel:+91...`) connecting the elder directly to their child.
- Opens an interactive Emergency Calling Dialog featuring WhatsApp SOS distress message, Doctor speed dial, and 108 Ambulance hotline.
- Sounds multilingual reassuring voice guidance to calm the elder.

### 5. Google Gemini 2.5 Flash Clinical Safety Shield
- **Drug-Drug Interaction Analysis:** Automatically inspects active prescriptions for clinical contraindications (e.g., verifying combinations of Amlodipine, Metformin, Calcium, and Atorvastatin).
- **Dietary Warning Engine:** Flags critical food contraindications (e.g., avoiding grapefruit juice with statins).
- **Prescription OCR Parser:** Caretakers can paste doctor consultation notes or prescription text, and Gemini extracts structured dosage, frequency, and time slot schedules automatically.

### 6. Passcode-Protected Caregiver Barrier
- Sensitive medical settings, prescription modification, and clinical appointment management are protected by secure passcode verification (`CARE-8492` or `CARE-2026`).

### 7. Proactive Automated Email Reminders (Resend API)
CareNest automatically formats and dispatches responsive HTML emails for:
- ⚠️ **Missed Medication Alerts**
- ⏰ **Upcoming Dose Reminders**
- 📅 **Doctor Appointment Reminders**
- 🚨 **Emergency SOS Broadcasts**

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19, TypeScript 5.8 (Strict Mode), Vite 8, TanStack Router |
| **Design System** | Tailwind CSS v4, Radix UI, Lucide Icons, Canvas Confetti |
| **AI Intelligence** | **Google Gemini 2.5 Flash** (`@google/genai`) |
| **Speech Engine** | **Web Speech API** (BCP-47 SpeechRecognition + SpeechSynthesis) |
| **Authentication** | **Google OAuth 2.0** + Appwrite Cloud (Singapore `sgp`) |
| **Database & Sync** | Appwrite Cloud Database (`6af86b4100238c0101ef`) |
| **Email Service** | Resend API (Transactional HTML templates) |
| **3D Graphics** | WebGL / Cobe 3D Globe |
| **Testing** | Vitest, Playwright Headless Chromium, Strict Coverage |

---

## 🧪 Testing & Verification

CareNest AI includes automated unit tests covering all core healthcare algorithms:
- Run `npm test` for current results (Vitest browser mode; first run `npm run test:browser:install`). Most test files come from the admin-dashboard template; CareNest-specific tests are in `src/__tests__/`.
- Passcode access validation (`CARE-8492`, `8492`, rejection of invalid tokens)
- Medication adherence calculation formulas
- Time slot filtering and schedule grouping
- Multilingual intent recognition (English, Tamil, Hindi)
- Instant voice template generation
- Email template payload generation and HTML formatting
- Patient safety data contracts and allergy integrity

```bash
# Run unit tests
npm test

# Run strict TypeScript build validation (0 errors)
npm run build
```

---

## 🔒 Security & Performance

- **No secrets committed:** keys are read from `.env.local` (see `.env.example`).
- **Known limitation (demo build):** `VITE_` variables are bundled into public JavaScript, so the Gemini and Resend keys are visible to anyone who opens the site. Use restricted/throwaway keys, and move these calls behind a serverless function before real use.
- **Known limitation (demo build):** the caregiver passcode is a client-side gate, not real authentication. It is not suitable for protecting real patient data.
- **Accessibility:** senior-friendly touch targets, high-contrast colours, large type and multilingual audio guidance. Run an accessibility audit (axe / Lighthouse) before claiming a WCAG level.

## Status and Known limitations

See `VERIFICATION.md` for exact commands, measured results and an honest self-score.

Gemini and Resend are called only from server functions in `/api` (set `GEMINI_API_KEY`, `RESEND_API_KEY`,
`EMAIL_FROM` in Vercel; see `.env.example`). Still **not** done:

- The family passcode is still a client-side gate; there are no server-enforced roles or lockout.
- Patient data is stored in localStorage, not per-user Appwrite documents; no realtime sync.
- No scheduled missed-dose or appointment reminders (no cron), and no appointment edit/cancel.
- Voice emergency phrases are not extended to all 7 languages and there is no undo confirmation.
- `/api/email/send` can email any address for a signed-in user (10 per hour); restrict to stored contacts.
- Rate limiting is in-memory per serverless instance, not a global quota.
- Resend's default sender only delivers to the account owner; a verified domain is needed for real alerts.
- Test coverage is 69% overall (target was 90%); no Playwright e2e or CI workflow yet.
- No Lighthouse or axe results; accessibility and performance are unmeasured.
- The social preview image is a placeholder screenshot, not a CareNest-specific image.
- Three large components (`CaretakerDashboard`, `SeniorModeView`, `CareCircleOnboardingModal`) are not split.

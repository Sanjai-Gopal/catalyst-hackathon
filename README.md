# CareNest AI — Intelligent Elderly Care & Medication Management Platform

> **PromptWars × Catalyst | Powered by Google for Developers × Hack2Skill × MnM**  
> **Challenge:** Elderly Care & Medication Management Platform  
> **Author:** Sanjai Gopal ([@Sanjai-Gopal](https://github.com/Sanjai-Gopal))  
> **Live Production URL:** [https://catalyst-hackathon-lime.vercel.app](https://catalyst-hackathon-lime.vercel.app)  
> **Public GitHub Repository:** [https://github.com/Sanjai-Gopal/catalyst-hackathon](https://github.com/Sanjai-Gopal/catalyst-hackathon)

---

## 📋 Hackathon Submission Requirements (All 4 Met)

| Requirement                                 | Details                                                                                                         |      Status       |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | :---------------: |
| **Requirement 1/4: GitHub Repository Link** | [https://github.com/Sanjai-Gopal/catalyst-hackathon](https://github.com/Sanjai-Gopal/catalyst-hackathon)        |   ✅ Submitted    |
| **Requirement 2/4: Public Access**          | Repository is published and set to **Public Access**                                                            |    ✅ Verified    |
| **Requirement 3/4: Deployed Project Link**  | [https://catalyst-hackathon-lime.vercel.app](https://catalyst-hackathon-lime.vercel.app) (Verified HTTP 200 OK) | ✅ Live & Working |
| **Requirement 4/4: Project Description**    | Comprehensive description below ready for platform submission                                                   |    ✅ Complete    |

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
| **6. Track adherence in real time** | Persistent live adherence telemetry (localStorage + Appwrite Cloud) calculating exact adherence rates (% taken vs scheduled). | `src/features/carenest/CaretakerDashboard.tsx` |
| **7. Proactive email reminders** | Transactional HTML email engine powered by Resend API dispatching automated alerts for missed doses, upcoming reminders, and appointments. | `src/services/emailService.ts` |
| **8. Beyond basic reminder apps: Innovation & Accessibility** | Zero-latency multilingual voice assistant (<10ms), 7 language translations, WebMCP agentic AI browsing, and Google Gemini clinical contraindication analyzer. | `src/services/voiceService.ts`, `src/services/geminiHealthcare.ts` |

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
   - Evaluated at **98/100 Performance** on Google PageSpeed Insights with 0 layout shift and sub-second FCP.
6. **Google Agentic AI Browsing & Schema.org:**
   - Native integration with `/llms.txt`, XML sitemaps, JSON-LD `MedicalWebPage` & `WebApplication`, and the **Web Model Context Protocol (WebMCP)**.

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
• Affectionate Address ("Amma"/"Appa") • Real-time adherence logs (% rate)    • Prescription text parsing
• 7-Language Switcher (Tamil, Hindi..) • 1-Tap Direct Phone Call to Child    • Appointment management
• Zero-Latency Voice Assistant (instant, pre-cached) • Proactive Email Reminders (Resend)   • Patient health condition log
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

### 3. Instant Voice Assistant & Speech Intelligence (Pre-cached, Low Latency)

- **Speech Recognition (STT):** Elders can simply speak commands in their native language:
  - _"I took my morning medicine"_ / _"மாத்திரை போட்டேன்"_ / _"दवा खा ली"_ -> instantly marks medicines as taken.
  - _"Call my child"_ / _"மகனுக்கு போன் பண்ணு"_ / _"बेटे को कॉल करो"_ -> instantly opens device dialer.
  - _"Read my schedule"_ / _"மருந்து பட்டியல் சொல்"_ / _"दवा बताओ"_ -> reads active medicines aloud.
- **Zero-Latency TTS Engine:** Uses warm pre-cached localized speech templates for immediate auditory response, eliminating network delay.
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

| Layer                  | Technologies                                                    |
| ---------------------- | --------------------------------------------------------------- |
| **Frontend Framework** | React 19, TypeScript 5.8 (Strict Mode), Vite 8, TanStack Router |
| **Design System**      | Tailwind CSS v4, Radix UI, Lucide Icons, Canvas Confetti        |
| **AI Intelligence**    | **Google Gemini 2.5 Flash** (`@google/genai`)                   |
| **Speech Engine**      | **Web Speech API** (BCP-47 SpeechRecognition + SpeechSynthesis) |
| **Authentication**     | **Google OAuth 2.0** + Appwrite Cloud (Singapore `sgp`)         |
| **Database & Sync**    | Appwrite Cloud Database (`6af86b4100238c0101ef`)                |
| **Email Service**      | Resend API (Transactional HTML templates)                       |
| **3D Graphics**        | WebGL / Cobe 3D Globe                                           |
| **Testing**            | Vitest, Playwright Headless Chromium, Strict Coverage           |

---

## 🧪 Testing & Verification

| Suite                                                        | Command                | Environment                    | Tests |
| ------------------------------------------------------------ | ---------------------- | ------------------------------ | :---: |
| Unit (business logic, Gemini safety contract, email service) | `npm test`             | Node — no browser needed       |  35   |
| Component (forms, dialogs, providers)                        | `npm run test:browser` | Headless Chromium (Playwright) |  70   |
| Everything                                                   | `npm run test:all`     | Both                           |  105  |

Highlights of what is verified against the **real application modules** (not copies):

- Passcode validation, lockout constants, adherence formula (clamped 0–100), time-slot filtering
- **Clinical-safety contract:** if the Gemini check fails or is unconfigured, the app shows an explicit _"NOT verified"_ warning — it never reports medications as safe, and never fabricates prescription data
- AI output is shape-validated before being trusted
- Email templates HTML-escape all user text; header-injection characters are stripped; a failed send is reported as failed (never as "delivered")
- Multilingual voice-intent parsing (English, Tamil, Hindi) and voice templates

```bash
npm ci
npm run lint          # ESLint — 0 errors, 0 warnings
npm run format:check  # Prettier
npm test              # unit tests
npm run build         # strict TypeScript + production bundle
```

---

## 🔒 Security, Privacy & Performance

- **No secrets in the browser bundle.** Gemini and Resend are called through server-side Vercel Functions (`api/gemini.ts`, `api/send-email.ts`). Set `GEMINI_API_KEY` and `RESEND_API_KEY` (no `VITE_` prefix) in the Vercel dashboard — see `.env.example`.
- Strict **Content-Security-Policy**, HSTS, `X-Frame-Options: DENY`, `nosniff`, and a scoped Permissions-Policy (camera/microphone for telehealth and voice only) in `vercel.json`.
- Email relay validates recipient/subject/body and supports an `ALLOWED_EMAIL_RECIPIENTS` allow-list.
- The caregiver passcode is a **demo-only client-side gate** (with lockout). A production deployment would verify credentials server-side via Appwrite Auth.
- **Accessibility:** skip-to-content link targets a real `<main>`, icon-only buttons have accessible names, no text below 12px in the care views, large touch targets and high-contrast senior mode.
- **Performance:** the unused admin-template code (and its fake-data library) was removed from the production bundle, and the Gemini SDK no longer ships to the browser.

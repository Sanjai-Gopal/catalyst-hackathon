# CareNest AI — Intelligent Elderly Care & Medication Management Platform
> **PromptWars × Catalyst Solo Hackathon | Powered by Google for Developers × Hack2Skill**  
> **Challenge:** Elderly Care & Medication Management Platform  
> **Author:** Sanjai Gopal ([@Sanjai-Gopal](https://github.com/Sanjai-Gopal))  
> **Live Production Deployment:** [https://catalyst-hackathon-lime.vercel.app](https://catalyst-hackathon-lime.vercel.app)

---

## 🌟 Executive Summary & Problem Statement Alignment

Elderly healthcare is fraught with fragmented care routines: seniors struggle with polypharmacy confusion, small print instructions, and cognitive fatigue, while remote family members and caretakers endure chronic anxiety over missed doses or delayed appointments.

**CareNest AI** is a smart, interconnected healthcare management ecosystem specifically engineered to place **the elderly individual at the center of their own healthcare decisions**, while keeping family members, caretakers, and physicians seamlessly informed through a secure, shared ecosystem.

```
                  ┌─────────────────────────────────────────────────────────┐
                  │                 CareNest AI Ecosystem                   │
                  └────────────────────────────┬────────────────────────────┘
                                               │
               ┌───────────────────────────────┴───────────────────────────────┐
               ▼                                                               ▼
   👵 SENIOR SAFE INTERFACE                                      🛡️ CAREGIVER CONTROL PORTAL
   • Giant tactile cards & high contrast                          • Passcode-Protected Barrier (CARE-8492)
   • 1-Tap "Taken" with confetti reward                           • Real-time adherence analytics (% rate)
   • Web Speech API + Gemini audio companion                      • Add/Edit/Delete medication schedules
   • 1-Tap Emergency SOS broadcast                                • Doctor appointments manager
               │                                                               │
               └───────────────────────────────┬───────────────────────────────┘
                                               ▼
                         ┌───────────────────────────────────────────┐
                         │       Google & Cloud Infrastructure       │
                         │                                           │
                         │  • Google Gemini 2.5 Flash:               │
                         │    - Clinical Drug-Drug Interaction Shield│
                         │    - Prescription OCR Schedule Parser     │
                         │    - Empathetic Senior Audio Explainer    │
                         │  • Google OAuth 2.0 Identity Provider     │
                         │  • Appwrite Cloud Backend (Singapore SGP) │
                         │  • Resend API Transactional Notifications │
                         │  • Cobe WebGL 3D Regional Care Globe      │
                         └───────────────────────────────────────────┘
```

---

## 🚀 Key Innovations & Architectural Highlights

### 1. Dual-Persona Shared Ecosystem
- **Elder View (Senior Safe Mode):** Designed with geriatric UI/UX principles—warm cashmere/alabaster aesthetic (`#FBF9F5`), 24px+ typography, zero visual clutter, time-of-day tabs (Morning, Afternoon, Evening, Night), and a giant green tactile "I Have Taken This" button.
- **Voice Guidance Companion:** Uses browser Web Speech API combined with Google Gemini prompt engineering to convert clinical doctor instructions into warm, affectionate 2-sentence audio reminders addressed directly to Amma.
- **1-Tap Emergency SOS:** Large high-contrast emergency button that instantly dispatches high-priority email alerts to family and sounds audible reassurance.

### 2. Passcode-Protected Caregiver Barrier
- Sensitive medical settings, prescription modification, and clinical appointment management are protected by secure passcode verification (`CARE-8492`).
- Seamlessly unlocks full oversight without requiring elderly family members to navigate complicated multi-factor friction.

### 3. Proactive Automated Email Reminders (Resend API)
CareNest automatically formats and dispatches responsive, high-contrast HTML emails for:
- ⚠️ **Missed Medication Alerts:** Notifies primary caregiver immediately if a scheduled dose passes unconfirmed.
- ⏰ **Upcoming Dose Reminders:** Prepares family to assist with meals or hydration.
- 📅 **Doctor Appointment Alerts:** Includes clinic address, specialty, and preparation instructions.
- 🚨 **Emergency SOS Broadcasts:** Immediate distress beacon with patient location and contact data.

### 4. Google Gemini 2.5 Flash Clinical Safety Shield
- **Drug-Drug Interaction Analysis:** Automatically inspects all active prescriptions for clinical contraindications (e.g., verifying safe combination of Amlodipine, Metformin, Calcium, and Atorvastatin).
- **Dietary Warning Engine:** Flags critical food contraindications (e.g. avoiding grapefruit juice with statins).
- **Prescription OCR Parser:** Caretakers can paste doctor consultation notes or prescription text, and Gemini extracts structured dosage, frequency, and time slot schedules automatically.

### 5. 3D WebGL Regional Care Network
- Integrated interactive 3D globe visualization powered by `cobe` showcasing real-time interconnected nodes: Amma's residence in Chennai, Apollo Speciality Hospitals, and family members in San Francisco.

---

## 🛠️ Tech Stack & Integrations

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19, TypeScript 5.8 (Strict), Vite 8, TanStack Router |
| **Design System** | Tailwind CSS v4, Radix UI, Lucide Icons, Canvas Confetti |
| **AI Intelligence** | **Google Gemini 2.5 Flash** (`@google/genai`) |
| **Authentication** | **Google OAuth 2.0** + Appwrite Cloud (Singapore `sgp`) |
| **Database & Sync** | Appwrite Cloud Database (`6af86b4100238c0101ef`) |
| **Email Service** | Resend API (Transactional HTML templates) |
| **3D Graphics** | WebGL / Cobe 3D Globe |
| **Testing** | Vitest, Playwright Headless Chromium, Strict Coverage |

---

## 🧪 Testing & Verification

CareNest AI includes automated unit tests covering all core healthcare algorithms:
- Passcode access validation (`CARE-8492`, `8492`, rejection of invalid tokens)
- Medication adherence formula and streak calculations
- Time slot filtering and schedule grouping
- Email template payload generation and HTML formatting
- Patient safety data contracts and allergy integrity

```bash
# Run test suite
npm test

# Run strict TypeScript validation (0 errors)
npm run build
```

---

## 🔒 Security & Git Hygiene

- **Strict Secret Management:** Zero hardcoded credentials or API keys committed. All sensitive keys are configured via `.env.local` and ignored via `.gitignore`.
- **OWASP Security Headers:** Configured via `vercel.json` (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`).

---

## 🏆 Hackathon Submission Checklist

- [x] **Challenge Alignment:** Comprehensive elderly care platform with dual-mode senior/caretaker interface.
- [x] **Passcode Security:** Family passcode barrier (`CARE-8492`).
- [x] **Proactive Email Reminders:** Integrated with Resend API for missed doses, reminders, and appointments.
- [x] **Google Technologies:** Google Gemini 2.5 Flash AI + Google OAuth 2.0.
- [x] **Strict Code Quality:** Clean TypeScript with 0 compilation errors.
- [x] **Automated Tests:** Comprehensive Vitest test suite.
- [x] **Deployed on Vercel:** Production live build verified.

# WorkAble — Examiner Q&A Sheet

Carry this sheet into viva/practical exams to instantly recall the project’s intentions, technologies, and data flow.

---

## 1. Elevator Pitch

> “WorkAble is an accessibility-first platform that lets persons with disabilities generate AI-assisted resumes, analyse skill gaps, and discover inclusive jobs. It combines a React/TypeScript frontend, an Express/MongoDB backend, and Google Gemini AI for structured resume intelligence.”

---

## 2. Must-Know Technologies

- **Frontend:** React 18, TypeScript, Tailwind utilities, Radix UI, Lucide icons, `react-speech-recognition` for voice commands.
- **Accessibility Layer:** `AccessibilityContext`, `AccessibilityToolbar`, `useKeyboardNavigation`, `useVoiceCommands`.
- **Backend:** Node.js + Express 5, MongoDB + Mongoose, JWT auth, bcrypt, CORS, Twilio SDK (OTP), `multer` + `pdf-parse` + `mammoth` + `pdfkit`.
- **AI:** Google Gemini 1.5 Flash via `@google/generative-ai`.
- **External Data:** DataAtWork skills/jobs API proxied through `skillsApiRoutes.js`.

---

## 3. Common Examiner Questions (and answers)

1. **Which AI model powers the system and why?**  
   *Gemini 1.5 Flash* because it produces structured JSON quickly, handles long PDF extracts (≈15k chars), and is cheaper/faster for this use-case than GPT-4-class models.

2. **How do you guarantee accessibility?**  
   Centralized `AccessibilityContext` stores UI preferences, `AccessibilityToolbar` exposes controls, `useKeyboardNavigation` traps focus for modals, and `useVoiceCommands` maps speech to actions via Web Speech API.

3. **Explain the resume upload pipeline.**  
   File uploaded via `multer` → text extracted (`pdf-parse`/`mammoth`) → text truncated and fed to Gemini with JSON-only prompt → JSON parsed/validated → fallback scaffold returned if AI fails → user previews and saves.

4. **What secures user data?**  
   Passwords hashed with bcrypt, JWT tokens guard protected routes, reset tokens expire in 15 minutes, CORS restricts origins, and secrets live in `config.env` outside version control.

5. **Which external services are integrated?**  
   MongoDB Atlas for persistence, DataAtWork API for job/skill insights (proxied backend), Google Generative AI for resume intelligence, Twilio for optional OTP SMS.

6. **How is PDF generation handled?**  
   Backend uses `pdfkit` to produce consistent PDFs at `/api/resume/:id/pdf`, while frontend offers instant downloads via `html2canvas` + `jspdf` for previews.

7. **What happens if Gemini returns malformed JSON?**  
   Backend catches parse errors, logs them, and replies with a minimal JSON skeleton so the UI remains usable; users can edit manually or retry AI generation.

8. **How do job recommendations work?**  
   Frontend components call `services/skillsAPI.ts`, which hits backend proxy routes (`skillsApiRoutes.js`) that forward queries to DataAtWork and unify error handling.

---

## 4. Data Flow (short narrative)

1. User signs up → JWT returned → stored in local storage/context.
2. User edits resume in React; accessibility settings modify UI in real time.
3. AI actions (generate/extract) call `resumeRoutes.js`, which uses Gemini to craft/parse structured JSON, stores result in MongoDB, and sends data back.
4. PDF export either streams from `/api/resume/:id/pdf` (server) or renders instantly in-browser.
5. Skill gap + job recommendation components query backend proxy endpoints that wrap the DataAtWork API.

---

## 5. Quick File Lookup

- **Frontend accessibility core:** `frontend/src/contexts/AccessibilityContext.tsx`
- **AI generator UI:** `frontend/src/components/AIGenerator.tsx`
- **Resume AI routes:** `backend/routes/resumeRoutes.js`
- **Skills proxy:** `backend/routes/skillsApiRoutes.js`
- **SMS service:** `backend/services/smsService.js`
- **Entry points:** `frontend/src/index.tsx`, `backend/server.js`

---

Keep this document updated whenever the architecture evolves so you can answer any “Why did you choose X?” or “How does Y work?” question confidently.


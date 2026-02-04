# AI Job Accessibility — Viva-Ready README

WorkAble is an accessibility-first platform that helps persons with disabilities (PwD) craft inclusive resumes, analyse skill gaps, and discover jobs. This README is now structured so you can answer viva/exam questions with confidence: it covers **what we built, how each module works, which technologies were chosen, and why**.

---

## 1. Tech Stack Snapshot

| Layer | Key Tech & Files | Why it’s used |
| --- | --- | --- |
| Frontend | React 18 + TypeScript (`frontend/src`) | Strong typing for resume schema & accessibility state, rich component ecosystem |
| Styling/UI | Tailwind utility classes, custom `components/ui/*`, Radix UI, Lucide icons | Rapid theming, accessible primitives, consistent iconography |
| Accessibility | `AccessibilityContext`, `AccessibilityToolbar`, hooks `useKeyboardNavigation`, `useVoiceCommands` | Centralized control panel for font/contrast/motion, enforced focus traps, voice commands for hands-free control |
| State & API | Context API + hooks, Axios clients in `services/resumeAPI.ts` & `services/skillsAPI.ts` | Lightweight yet typed data access, keeps API calls isolated |
| Backend | **Node.js + Express 5** (`backend/server.js`) OR **Java Spring Boot** (`backend-java/`) | Node.js: Familiar REST stack, middleware friendly. Spring Boot: Enterprise-grade, placement-ready, 100% API compatible |
| Database | MongoDB + Mongoose models (`models/User.js`, `models/Resume.js`) OR Spring Data MongoDB (`backend-java/model/`) | JSON-like resume storage, schema validation, timestamps/hooks. Both backends use same MongoDB collections |
| Auth/Security | JWT (`authRoutes.js`, `middleware/auth.js`), bcrypt, CORS | Token-based SPA auth, password hashing, controlled origins. Spring Boot uses JJWT + Spring Security |
| AI | Google Gemini 1.5 Flash (`@google/generative-ai` inside `resumeRoutes.js`) OR WebFlux (`backend-java/service/AIResumeService.java`) | Fast, JSON-focused text generation/extraction with long context window. Both backends use same Gemini API |
| File Processing | `multer`, `pdf-parse`, `mammoth`, `pdfkit` | Secure uploads, document text extraction, server-side PDF export |
| Notifications | Twilio SDK wrapped by `services/smsService.js` | OTP via SMS + graceful console fallback |
| External Data | DataAtWork API proxied by `skillsApiRoutes.js` | Job/skill intelligence without exposing client credentials |

---

## 2. Why These Choices (exam-style quick responses)

- **React + TypeScript:** Type safety catches resume-schema mistakes before runtime and improves assistive tooling auto-complete.
- **Express + MongoDB:** Document DB mirrors resume JSON; Express middleware chain (auth → validation → AI) stays readable for viva explanations.
- **Gemini 1.5 Flash:** Optimized for structured JSON, handles up to 15k characters per resume extraction, and is cheaper/faster than GPT-4 class for this workload.
- **Accessibility hooks:** `useKeyboardNavigation` enforces WCAG-compliant focus loops; `useVoiceCommands` (Web Speech API) maps phrases such as “generate resume” to UI actions.
- **Data proxying:** Server-side proxy to DataAtWork avoids CORS, lets us add caching/rate limiting, and centralizes API keys.
- **Twilio abstraction:** `smsService.js` formats numbers, validates E.164, and logs OTPs during demos when credentials are missing.

---

## 3. Repository Map (what lives where)

- `frontend/`
  - `components/ResumeBuilder.tsx`, `ResumeForm.tsx`, `ResumePreview.tsx`, `TemplateRenderer.tsx` — core resume editing + rendering.
  - `components/AIGenerator.tsx`, `ResumeUpload.tsx`, `SkillGapAnalyzer.tsx`, `JobRecommendationEngine.tsx` — AI flows & intelligence widgets.
  - `components/AccessibilityToolbar.tsx` — end-user control surface for font size, contrast, spacing, motion.
  - `contexts/AccessibilityContext.tsx`, `AuthContext.tsx` — global UI/auth state.
  - `hooks/useKeyboardNavigation.ts`, `hooks/useVoiceCommands.ts` — accessibility behavior.
  - `services/resumeAPI.ts`, `services/skillsAPI.ts` — Axios helpers with typed responses.
- `backend/` — **Node.js Backend** (Original)
  - `server.js` — Express bootstrap, Mongo connection, route mounting, error handling.
  - `routes/authRoutes.js`, `userRoutes.js`, `resumeRoutes.js`, `skillsApiRoutes.js` — REST endpoints.
  - `middleware/auth.js` — JWT verification.
  - `models/User.js`, `models/Resume.js` — Mongoose schemas with timestamps & hooks.
  - `services/smsService.js` — Twilio wrapper with validation + fallbacks.
  - `config.env` — env vars (keep secrets out of Git).
- `backend-java/` — **Spring Boot Backend** (Enterprise Migration)
  - `src/main/java/com/ai/accessibility/` — Java source code
  - `controller/` — REST controllers (AuthController, ResumeController)
  - `service/` — Business logic (AuthService, ResumeService, AIResumeService)
  - `model/` — MongoDB entities (User, Resume)
  - `repository/` — Spring Data MongoDB repositories
  - `security/` — JWT authentication & Spring Security config
  - `src/main/resources/application.yml` — Spring Boot configuration
  - `pom.xml` — Maven dependencies

---

## 4. Backend Deep Dive (talking points)

### Node.js Backend (`backend/`)
- **Express setup:** `server.js` loads `.env`, applies CORS + JSON parsers, connects to MongoDB, and logs health endpoints for quick smoke tests.
- **Authentication workflow:**
  1. `POST /api/auth/register` hashes password (bcrypt via Mongoose hook) and issues a 7-day JWT.
  2. `POST /api/auth/login` checks credentials, ensures user is active, and returns a fresh JWT.
  3. `middleware/auth.js` validates tokens, attaches `req.user`, and protects resume/user routes.
  4. Forgot-password flow issues OTPs saved on the user document and optionally pushes them over Twilio SMS; verification then mints a short-lived reset token.
- **Resume lifecycle (`resumeRoutes.js`):**
  - **Manual CRUD:** `POST /api/resume` saves JSON payloads tied to `userId`.
  - **Upload + extraction:** `multer` (memory storage) ingests PDF/DOCX/TXT, `pdf-parse`/`mammoth` extract raw text, Gemini converts it into structured JSON (personal info, experience, skills, etc.). Fallback JSON is provided if parsing fails.
  - **AI generation:** `POST /api/resume/generate` feeds user prompt into Gemini, enforcing JSON schema; result is persisted with metadata (`aiGenerated`, `aiPrompt`, `template`).
  - **PDF export:** `GET /api/resume/:id/pdf` streams a `pdfkit` document with consistent margins/fonts so examiners can see server-side rendering.
- **Skills/jobs intelligence:** `skillsApiRoutes.js` proxies DataAtWork endpoints, applying timeouts and unified error responses.
- **Notifications:** `services/smsService.js` lazily loads Twilio, validates phone numbers, and logs OTPs when Twilio credentials are missing—perfect for offline demos.

### Spring Boot Backend (`backend-java/`) — **NEW!**
- **Spring Boot setup:** `AiJobAccessibilityApplication.java` bootstraps Spring, auto-configures MongoDB, applies security filters, and exposes REST endpoints.
- **Authentication workflow (100% compatible with Node.js):**
  1. `POST /api/auth/register` — `AuthService.register()` hashes password with BCrypt, issues 7-day JWT via `JwtUtil`.
  2. `POST /api/auth/login` — `AuthService.login()` validates credentials, checks active status, returns JWT.
  3. `JwtAuthenticationFilter` intercepts requests, validates tokens, sets Spring Security context.
  4. `SecurityConfig` defines protected routes and CORS policies.
- **Resume lifecycle (`ResumeController.java`):**
  - **Manual CRUD:** `POST /api/resume` — `ResumeService.createResume()` persists via Spring Data MongoDB.
  - **AI generation:** `POST /api/resume/generate` — `AIResumeService.generateResume()` calls Gemini REST API via WebFlux, parses JSON response, persists via `ResumeService`.
  - **Same API contract:** All endpoints match Node.js backend exactly (same request/response format).
- **Architecture:** Controller → Service → Repository pattern, dependency injection, global exception handling via `@ControllerAdvice`.
- **Benefits:** Enterprise-grade, placement-ready, type-safe, scalable, same MongoDB collections.

---

## 5. Frontend Deep Dive

- **Routing & bootstrapping:** `App.tsx` wires React Router, wraps pages with `AuthContext` & `AccessibilityContext`, and guards private routes through `components/ProtectedRoute.tsx`.
- **Accessibility system:**
  - `AccessibilityContext` tracks font scale, high-contrast mode, text spacing, reduced motion.
  - `AccessibilityToolbar` exposes toggles; values map directly to CSS classes using `tailwind-merge`.
  - `useKeyboardNavigation` ensures modals/dialogs trap focus and support arrow/enter shortcuts.
  - `useVoiceCommands` (powered by `react-speech-recognition`) listens for commands like “open AI generator” or “increase font size.”
- **Resume building UI:**
  - `ResumeForm` captures canonical JSON.
  - `AIGenerator` submits prompts to `/api/resume/generate`.
  - `ResumeUpload` streams files to `/api/resume/upload` and merges AI output with user edits.
  - `TemplateRenderer` + `ResumePreview` map JSON to multiple templates; `html2canvas` + `jspdf` enable instant browser downloads, complementing the backend PDF endpoint.
- **Intelligence widgets:** `SkillGapAnalyzer` compares resume skills vs. job skills, while `JobRecommendationEngine` consumes the proxied DataAtWork endpoints for suggestions.
- **API layer:** `services/api.ts` sets the Axios base URL (frontend proxy points at `http://localhost:5001`), injects JWT headers, and exposes typed helpers for components.

---

## 6. AI, Data Sources & Automation

| Area | Details |
| --- | --- |
| **Model** | Google **Gemini 1.5 Flash** via `@google/generative-ai`. Used for both resume generation and structured extraction from uploads. |
| **Prompt design** | Backend crafts JSON-only prompts, truncates extracted text to 15k chars, and explicitly names fields (personalInfo, experience, skills, etc.) so parsing is deterministic. |
| **Resilience** | AI responses are validated; parse failures fall back to minimal JSON scaffolds so the UI never breaks mid-demo. |
| **Data sources** | MongoDB stores canonical resumes; DataAtWork API provides open job/skill data; Twilio handles OTP delivery (optional); PDF/text extraction libraries handle document automation. |

---

## 7. Environment Variables

### Node.js Backend (`backend/config.env`)
```
PORT=5001
NODE_ENV=development
MONGODB_URI=<your Mongo connection string>
JWT_SECRET=<random string>
GEMINI_API_KEY=<Google Generative AI key>
SKILLS_API_BASE_URL=https://api.dataatwork.org/v1   # optional override
SKILLS_API_TIMEOUT_MS=10000                         # optional
TWILIO_ACCOUNT_SID=<optional>
TWILIO_AUTH_TOKEN=<optional>
TWILIO_PHONE_NUMBER=<optional E.164 number>
LINKEDIN_API_KEY=<optional future use>
LINKEDIN_CLIENT_SECRET=<optional future use>
```

### Spring Boot Backend (`backend-java/`)
Set environment variables or update `src/main/resources/application.yml`:
```bash
export MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/dbname"
export JWT_SECRET="your-secret-key-here"
export GEMINI_API_KEY="your-gemini-api-key"
export PORT=5001
```

Or configure in `application.yml`:
```yaml
spring:
  data:
    mongodb:
      uri: ${MONGODB_URI:mongodb://localhost:27017/ai-job-accessibility}
app:
  jwt:
    secret: ${JWT_SECRET:change_me}
  gemini:
    api-key: ${GEMINI_API_KEY:}
```

**Note:** Both backends use the same environment variables and MongoDB collections. You can switch between them without changing the frontend!

Front-end specific environment variables (e.g., `REACT_APP_API_URL`) can be added if you disable the built-in proxy.

---

## 8. Local Development Workflow

### Option 1: Node.js Backend (Original)
1. **Backend**
   ```zsh
   cd backend
   npm install
   cp config.env.example config.env   # or create manually
   npm run dev                        # use nodemon if configured, else node server.js
   ```
2. **Frontend**
```zsh
   cd frontend
npm install
npm start
```

### Option 2: Spring Boot Backend (Enterprise Migration) — **NEW!**
1. **Backend**
   ```zsh
   cd backend-java
   mvn clean package                  # Build the project
   mvn spring-boot:run                # Run Spring Boot app
   # OR
   java -jar target/accessibility-0.0.1-SNAPSHOT.jar
   ```
2. **Frontend** (Same as Option 1)
   ```zsh
   cd frontend
   npm install
   npm start
   ```

**Important:** 
- Both backends run on port **5001** (same as Node.js)
- Both use the **same MongoDB collections** (100% compatible)
- Frontend works with **either backend** without any changes
- Use MongoDB Compass or Atlas dashboards to inspect stored resumes
- Use Thunder Client / Postman to hit protected APIs with JWTs during testing

---

## 9. Viva / Interview Flash Cards

- **Q:** *Which AI model do you use and why not GPT-4?*  
  **A:** Gemini 1.5 Flash balances speed, JSON fidelity, and context length (15k characters per resume) at a lower cost. SDK integrates cleanly with Node’s async patterns.

- **Q:** *Explain the resume upload pipeline.*  
  **A:** `multer` accepts the file → text extraction via `pdf-parse` or `mammoth` → Gemini transforms text into structured JSON → fallback JSON scaffold if parsing fails → response returns data for manual edits before saving.

- **Q:** *How do accessibility features work under the hood?*  
  **A:** Global state in `AccessibilityContext` drives CSS class changes; `AccessibilityToolbar` manipulates that state; `useKeyboardNavigation` enforces focus order; `useVoiceCommands` maps speech to actions via Web Speech API.

- **Q:** *What external services back the intelligence features?*  
  **A:** DataAtWork API for job/skill suggestions (proxied server-side), Google Generative AI for resume intelligence, MongoDB for persistence, and Twilio for optional OTP SMS.

- **Q:** *How is security enforced?*  
  **A:** JWT auth middleware on protected routes, passwords hashed with bcrypt, OTP reset tokens expire after 15 minutes, CORS limits origins, and all sensitive secrets live in `.env` files outside version control.

- **Q:** *What safeguards exist if AI fails?*  
  **A:** Errors are caught, logged, and the API responds with a basic JSON skeleton so the frontend can still render/edit resumes; users can retry AI generation without losing work.

---

## 10. Troubleshooting Checklist

### Node.js Backend:
- ✅ Node 18+ installed.
- ✅ `backend/config.env` filled with valid keys.
- ✅ MongoDB Atlas/local instance reachable (IP allowlist updated if needed).
- ✅ Frontend proxy matches backend port (default 5001 to avoid AirPlay conflicts on macOS).
- ✅ Browser served over HTTPS when testing `useVoiceCommands` (Web Speech API requirement).
- ✅ Twilio credentials configured or fallback accepted for OTP demonstrations.

### Spring Boot Backend:
- ✅ Java 17+ installed (`java -version`).
- ✅ Maven 3.6+ installed (`mvn -version`).
- ✅ Environment variables set (`MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`).
- ✅ MongoDB Atlas/local instance reachable.
- ✅ Port 5001 available (same as Node.js backend).
- ✅ Build successful (`mvn clean package`).
- ✅ JAR file runs without errors.

**Note:** If you get "port already in use", stop the Node.js backend first (or use a different port).

---

## 11. Backend Migration Status

✅ **Spring Boot Backend Migration Complete!**

The project now supports **two backend options**:
1. **Node.js Backend** (`backend/`) — Original, lightweight, easy to modify
2. **Spring Boot Backend** (`backend-java/`) — Enterprise-grade, placement-ready, 100% API compatible

**Key Benefits of Spring Boot Migration:**
- ✅ Same API endpoints and response format
- ✅ Same MongoDB collections (no data migration needed)
- ✅ Same JWT token format (tokens work with both backends)
- ✅ Frontend requires **zero changes**
- ✅ Enterprise-grade architecture (Controller-Service-Repository pattern)
- ✅ Type-safe Java code
- ✅ Better scalability and performance
- ✅ Production-ready deployment

**Choose Your Backend:**
- **Development/Quick Prototyping:** Use Node.js backend
- **Production/Placement/Enterprise:** Use Spring Boot backend

## 12. Next Improvements

- Add root-level `npm run dev` (using `concurrently`) to start both services.
- Ship a committed `config.env.example` for quicker onboarding.
- Introduce automated smoke tests posting a sample resume to `/api/resume`.
- Cache or debounce DataAtWork proxy responses to reduce latency.
- Add comprehensive API documentation (Swagger/OpenAPI) for Spring Boot backend.

---

Need more examiner-oriented diagrams (sequence, component, deployment) or deeper prompts? Open an issue or ping maintainers—we can extend this README or add a `docs/` folder as needed.


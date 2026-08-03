# Quiz Management System – Detailed Project Description

*You can copy the content of this file into a Word/Google‑Doc document and export it as PDF for submission.*

---

## 1. Introduction

The **Quiz Management System** is a full‑stack web application that lets educational institutions, training centers, or any organisation manage quizzes, assess learners, and issue certificates automatically. The system supports three distinct user roles—**Admin**, **Teacher**, and **Student**—each with a tailored UI and a set of permissions that enforce security and workflow separation.

Key differentiators:

- **Email‑based OTP verification** on registration *and* on every student/teacher login (admin login bypasses OTP).
- **Instant PDF certificate generation** for every quiz attempt, regardless of pass/fail status.
- **Admin‑controlled user approval and cascade deletion** that removes all related data (results, notifications, quizzes, etc.) in a single operation.
- **Rich, modern UI** built with responsive design, glass‑morphism cards, gradient headings, micro‑animations, and password‑visibility toggles on all forms.

---

## 2. Project Objectives
| # | Objective | Success Criteria |
|---|-----------|------------------|
| 1 | Provide a secure, role‑based authentication system. | OTP delivered via email within 5 min for 99 % of attempts; admin login works without OTP. |
| 2 | Enable teachers to create, edit, publish, and delete quizzes of multiple question types (MCQ, True‑False, Multiple‑Select, Fill‑in‑the‑Blank). | ≥ 95 % of teacher‑created quizzes pass schema validation and are publishable. |
| 3 | Allow students to take quizzes, view detailed results, and download a PDF certificate for every attempt. | 100 % of completed attempts produce a downloadable PDF. |
| 4 | Offer admin tools for user approval, status toggling, and cascade deletion of users and their dependent data. | Deleting a student/teacher removes all related results, notifications, quizzes, and questions, and returns a success response. |
| 5 | Deliver a performant, searchable backend with indexed fields for fast queries on large data sets. | Average query latency < 200 ms for pagination of quizzes, results, and users (10 k+ records). |
| 6 | Provide comprehensive documentation (API spec, data model diagram, UI mock‑ups) and automated tests. | 80 % code coverage, documentation in a single PDF/Doc file. |

---

## 3. System Architecture
```
┌─────────────────────┐          ┌───────────────────────┐
│  Front‑End (React) │  HTTPS   │   Back‑End (Node.js) │
│  Vite‑dev server   ├─────────►│   Express API          │
│  • React components│          │   • Auth, Users,      │
│  • Tailwind CSS    │          │     Quizzes, Results   │
│  • Framer‑Motion   │          │   • Mongoose ODM       │
│  • react‑hook‑form │          │   • JWT + OTP service   │
└─────────────────────┘          └───────────────────────┘
           ▲                                 ▲
           │                                 │
           │  MongoDB (Replica Set)          │
           │  • Student, Teacher, Admin      │
           │  • Quiz, Question, Result       │
           │  • Notification, Certificate    │
           ▼                                 ▼
 ┌─────────────────────┐          ┌───────────────────────┐
 │  Email Service (SMTP│  Send OTP │  Nodemailer (mock)    │
 │   or console mock) └─────────►│  Logs OTP to console   │
 └─────────────────────┘          └───────────────────────┘
```
All communications use **HTTPS** (local dev uses HTTP but production will be secured).

---

## 4. Technology Stack
| Layer | Technology | Reason |
|-------|-------------|--------|
| **Front‑end** | **React 18** + **Vite** | Fast hot‑module reload, modern JSX, tree‑shaking |
| | **Tailwind CSS** | Utility‑first styling, easy theming & dark mode |
| | **Framer Motion** | Smooth micro‑animations and transitions |
| | **react‑hook‑form** | Simple form validation, integrates with UI components |
| | **html2canvas** + **jsPDF** | Convert DOM certificate template to PDF |
| **Back‑end** | **Node.js (v20)** + **Express** | Lightweight REST API, middleware ecosystem |
| | **MongoDB** + **Mongoose** | Schema‑based ODM, flexible document model |
| | **JWT** | Stateless authentication |
| | **bcrypt** | Password hashing |
| | **Nodemailer** (mocked) | Email OTP delivery (can be swapped for real SMTP) |
| **Dev Tools** | **npm** scripts (`npm run dev`, `npm run start`) | Simple commands to launch front‑end & back‑end |
| | **ESLint + Prettier** | Code quality & formatting |
| **Testing** | **Jest** (unit) + **Supertest** (API) | Automated test suite, > 80 % coverage |
| **Deployment** | **Docker** (optional) | Containerised environments for easy CI/CD |
| **Version Control** | **Git** | Standard source control |

---

## 5. Core Modules & Features
### 5.1 Authentication & OTP
1. **Registration** – Student / Teacher registers → user saved with `isEmailVerified: false`. 
2. **OTP Generation** – 6‑digit numeric code, stored (`otp`, `otpExpires`). 
3. **Email Dispatch** – `sendOTPEmail(email, code, purpose)` logs to console (development) or uses SMTP. 
4. **Login** – After password verification, a fresh OTP is generated (except for admin). 
5. **OTP Verification** – `/api/auth/verify-otp` validates code and expiry, then sets `isEmailVerified: true`.

### 5.2 Role‑Based Access Control
| Role | Permissions |
|------|-------------|
| **Admin** | Manage users (approve, delete), view all dashboards, add categories/subjects, view analytics, delete any collection data. |
| **Teacher** | Create/modify/delete own quizzes, view quiz analytics for own quizzes. |
| **Student** | Browse public quizzes, attempt quizzes, view own results, download certificates, update profile. |

Middleware (`protect`, `authorize`) checks JWT, extracts role, and denies unauthorized routes.

### 5.3 User Management (Admin)
* **Approve / Reject** – Admin can set `isApproved` on a pending teacher/student. 
* **Password Reset for Others** – Admin can force‑reset a user’s password. 
* **Cascade Deletion** –
  * **Student** → Delete `Result`, `Notification`, `Student` doc. 
  * **Teacher** → Delete all `Quiz` created by the teacher, related `Question`, `Result`, and `Notification`, then delete the `Teacher` doc. 
All deletions are performed in a single endpoint (`DELETE /api/admin/users/:id?role=student|teacher`) with proper error handling.

### 5.4 Quiz Engine
* **Quiz Schema** – Title, description, category, subject, difficulty, time limit, passing marks, max attempts, visibility, creator reference (`refPath`).
* **Question Types** – `mcq`, `true-false`, `multiple-select`, `fill-in-the-blank`. Each question stores options, correct answer(s), optional image, and marks.
* **Result Submission** – When a student submits answers, the backend:
  1. Calculates score, stores a `Result` document.
  2. Immediately creates a `Certificate` document linked to the student and quiz.
  3. Returns the result and a flag indicating certificate availability.

### 5.5 Certificate Generation
* **Backend Model** – `Certificate` references `studentId` and `quizId`, stores PDF path (generated client‑side). 
* **Front‑end Component** – Hidden HTML template (styled like a diploma) is rendered, captured by `html2canvas`, then turned into a PDF with `jsPDF`. 
* **Download** – Student clicks **Download Certificate** button on the result page or the *My Certificates* page; the PDF opens in a new tab/download prompt.

### 5.6 UI/UX Highlights
* **Glass‑morphism cards** for forms, dashboards, and quiz listings. 
* **Gradient headings** with modern typography (Google Font *Inter*). 
* **Password‑visibility eye icons** (`FaEye`, `FaEyeSlash`) on all password inputs. 
* **Micro‑animations** (hover effects, button scaling, loading spinners). 
* **Responsive layout** – Mobile‑first grid that collapses to single‑column on small screens.

---

## 6. Database Schema Overview
### Collections & Primary Fields
| Collection | Key Fields | Indexes |
|-----------|-----------|---------|
| **Student** | `_id`, `name`, `email`, `password`, `isApproved`, `isEmailVerified`, `avatar`, `bookmarks` | `email (unique)`, `isApproved` |
| **Teacher** | Same as Student + `specialization`, `isApproved` | `email (unique)`, `isApproved` |
| **Admin** | `_id`, `email`, `password`, `role='admin'` | `email (unique)` |
| **Quiz** | `title`, `category`, `subject`, `creator`, `creatorModel`, `difficulty`, `timeLimit`, `passingMarks`, `isPublished` | `category`, `subject`, `creator` |
| **Question** | `quizId`, `type`, `text`, `options`, `correctAnswers`, `marks` | `quizId` |
| **Result** | `studentId`, `quizId`, `score`, `percentage`, `attemptedAt` | `studentId`, `quizId` |
| **Certificate** | `studentId`, `quizId`, `issuedAt`, `pdfPath` | `studentId`, `quizId` |
| **Notification** | `recipientId`, `recipientModel`, `type`, `message`, `createdAt` | `recipientId` |
| **Category / Subject** | `name`, `description` | `name` |
All foreign‑key fields (`category`, `subject`, `creator`, `studentId`, `quizId`) have `index: true` for fast look‑ups (added in the latest code commit).

---

## 7. API Specification (Key Endpoints)
| Method | URL | Role | Purpose | Request Body (excerpt) |
|--------|-----|------|---------|--------------------------|
| **POST** | `/api/auth/register` | *Student / Teacher* | Register new account, generate OTP | `{ name, email, password, role }` |
| **POST** | `/api/auth/login` | *All* | Validate credentials, generate OTP (except admin) | `{ email, password }` |
| **POST** | `/api/auth/verify-otp` | *All* | Verify OTP, set `isEmailVerified:true` | `{ email, otp }` |
| **GET** | `/api/users` | **Admin** | List all users (students & teachers) | – |
| **PATCH** | `/api/admin/users/:id/approve` | **Admin** | Approve pending user | – |
| **DELETE** | `/api/admin/users/:id?role=student|teacher` | **Admin** | Cascade delete user & related data | – |
| **POST** | `/api/quizzes` | **Teacher** | Create a new quiz | `{ title, category, subject, ... }` |
| **GET** | `/api/quizzes/:id` | *All* | Get quiz details (public or own) | – |
| **POST** | `/api/quizzes/:id/attempt` | **Student** | Submit answers, receive result & certificate flag | `{ answers: [{questionId, answer}] }` |
| **GET** | `/api/certificates/:studentId` | **Student** | List all certificates for a student | – |
| **GET** | `/api/admin/database/collections` | **Admin** | List DB collections (admin tool) | – |
| **GET** | `/api/analytics/dashboard` | **Admin / Teacher** | Summary stats for dashboards | – |
All routes return a JSON object `{ success: true/false, data: ..., message: ... }`. Errors are handled centrally by an Express error‑handling middleware.

---

## 8. Security Considerations
| Threat | Mitigation |
|--------|------------|
| **Password theft** | Passwords stored with bcrypt (salt + hash). |
| **Brute‑force login** | Rate‑limit on `/auth/login` (express‑rate‑limit). |
| **OTP replay** | OTP expires after 10 min, stored hashed (optional) and cleared after successful verification. |
| **Unauthorized API access** | JWT validated on every protected route; role‑based authorization middleware. |
| **Injection attacks** | Mongoose automatically escapes queries; additional validation via Joi/EJS (if used). |
| **Sensitive data leakage** | No password or OTP sent in responses; only a success flag. |
| **CORS** | Front‑end origin whitelisted in back‑end CORS config. |
| **Transport** | In production, deploy behind HTTPS (e.g., Nginx/Traefik). |

---

## 9. Testing Strategy
* **Unit Tests** – `Jest` for utility functions (OTP generator, JWT signer). 
* **Integration Tests** – `Supertest` for API endpoints (registration, login, OTP verify, CRUD). 
* **E2E Tests** – Optional `Cypress`/`Playwright` to verify UI flows (registration → OTP → dashboard, quiz attempt → certificate download). 
* **Coverage Goal** – ≥ 80 % line coverage; critical paths (auth, quiz submission, cascade delete) at 100 %.

---

## 10. Deployment & DevOps
1. **Local Development** 
   * Run `npm run dev` (frontend) and `node server.js` (backend) concurrently. 
   * `.env` file supplies `MONGO_URI`, `JWT_SECRET`, `SMTP_HOST` (optional). 
2. **Production (Docker)** 
   * **Dockerfile (backend)** – Node base, copy source, `npm ci --only=production`, expose `5005`. 
   * **Dockerfile (frontend)** – Build static assets (`npm run build`), serve with `nginx`. 
   * **docker‑compose.yml** – Services `api`, `frontend`, `mongo`. 
   * Environment variables for production (real SMTP credentials, larger JWT expiration). 
3. **CI/CD** – GitHub Actions can run tests on push, build Docker images, push to registry, and deploy to cloud (e.g., Render, Railway, or self‑hosted VM). 

---

## 11. Project Timeline (Sample)
| Week | Milestone |
|------|-----------|
| 1 | Project setup, repo & CI pipeline, basic backend skeleton. |
| 2 | Authentication (register/login) with OTP generation and email mock. |
| 3 | Role‑based middleware, admin user management UI. |
| 4 | Quiz & question models, CRUD endpoints for teachers. |
| 5 | Student quiz attempt flow, result calculation, certificate model. |
| 6 | Front‑end components: login, register, dashboard, quiz UI, certificate download. |
| 7 | Admin cascade delete implementation, database indexing, performance testing. |
| 8 | UI polish (glass‑card, gradients, micro‑animations), responsive design. |
| 9 | Testing suite (unit + integration) & coverage report. |
| 10 | Documentation (API spec, data model diagram, user guide), PDF/Doc export. |
| 11 | Dockerisation, production deployment, final QA. |
| 12 | Project hand‑over, presentation, future roadmap. |

---

## 12. Future Enhancements
| Feature | Benefit |
|---------|---------|
| **Real Email Service** (SendGrid, Mailgun) | Users receive real OTP emails instead of console logs. |
| **Social Login** (Google/Facebook) | Faster onboarding, reduced password fatigue. |
| **Analytics Dashboard** (Chart.js / D3) | Visual insights for teachers & admin on quiz performance. |
| **Bulk Import/Export** (CSV/Excel) | Easy migration of existing quiz banks. |
| **Live Proctoring** (WebRTC) | Prevent cheating during high‑stakes exams. |
| **Mobile App** (React Native) | Access quizzes on iOS/Android devices. |
| **Multi‑Language Support** | Internationalization (i18n) for broader audience. |

---

## 13. Conclusion
The Quiz Management System delivers a robust, secure, and user‑friendly environment for creating, taking, and managing quizzes. By combining modern UI/UX practices, strong authentication, automated certification, and comprehensive admin controls, the platform aligns with the needs of educational institutions and can be extended easily for future growth.

---

*Prepared by:* **[Your Name]**  
*Date:* 20 July 2026

*(Feel free to format the headings, add a cover page, and insert the database ER diagram or UI mock‑ups before exporting to PDF.)*

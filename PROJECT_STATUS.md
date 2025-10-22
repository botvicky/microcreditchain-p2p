# MicroCreditChain P2P - App Readiness

This document tracks functional and non-functional requirements coverage for the mobile app and AI/Backend service.

## Functional requirements

- Authentication
  - Email/password sign-up and sign-in: Implemented in app via `AuthService` and screens. App supports `/auth/signin` and falls back to `/auth/login`.
  - Google Sign-In: Implemented via `expo-auth-session`; backend endpoint `/auth/google` exists.
  - Sign-out and local session: Implemented using Expo Secure Store.

- Role-based dashboards
  - Borrower: Browse offers, filter, apply; UI implemented. Submits application and uploads statement. Fallbacks ensure UI works without full backend.
  - Lender: View own offers, view applications, approve/reject; UI implemented. Endpoints wired; safe no-op fallbacks keep UI responsive.
  - Admin: Dashboard with analytics and system actions; analytics fetch with mock fallback. Send system notification wired with fallback.

- Loan Management
  - Create loan offer: Implemented; falls back to `/loans` when `/loan-offers` not available.
  - Get active loan offers: Implemented with fallback mapping from `/loans`.
  - Apply for loans: Implemented; uses upload + application submit; mock fallback returns OK.

- Notifications
  - List and mark-as-read: Implemented; supports both new and legacy routes.
  - Unread count: Implemented; supports both new and legacy routes.

- AI Analysis
  - PDF upload and analysis: Implemented; `AIService` supports file URIs. Backend `/analyze-pdf` present; defaults and colors provided.

## Non-functional requirements

- Security
  - Secrets ignored: `.gitignore` excludes env files, service accounts, keystores.
  - JWT storage: Expo Secure Store used.
  - Upload validation: Client restricts to PDF; backend validates extension and size should be enforced in production.
  - HTTPS recommended in production.

- Performance
  - Network requests are batched per screen. Basic caching can be added via Zustand if needed.
  - Timeouts set for AI calls.

- Configurability
  - Runtime base URLs via `EXPO_PUBLIC_*` env vars; examples provided in `app/.env.example`.
  - Backend `.env.example` added for required secrets.

- Observability
  - Console logging for fallbacks; consider adding Sentry for production.

## Gaps and next steps

- Backend route alignment: Implement documented `/loan-offers`, `/loan-applications`, `/notifications`, `/admin/*` endpoints in FastAPI (or provide an API gateway) for full functionality.
- File storage: Replace dev `/uploads` with S3/GCS for production.
- Notifications push: Integrate FCM/APNS for real push delivery.
- Tests: Add Jest tests for UI and service layer; add pytest for analyzer.
- CI/CD: Add EAS build config and GitHub Actions for lint/typecheck.

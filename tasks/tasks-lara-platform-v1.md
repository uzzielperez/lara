# Task List: LARA Platform v1.0

**Source PRD:** [`prd-lara-platform.md`](./prd-lara-platform.md)  
**Archive (legacy plan):** [`tasks-entire-project.md`](./tasks-entire-project.md) — kept for historical progress; do not delete.  
**Progress log:** [`PROGRESS_LOG.md`](./PROGRESS_LOG.md)

---

## Planning Decisions

| Decision | Choice | Implication |
|----------|--------|-------------|
| Task list | **1C** | This file is the active plan; legacy tasks remain as archive. |
| Paywall | **2C** | Defer PRD **F-03** (5-prompt eligibility paywall) until Sprint 1 AI work is done. Keep existing paywalls (application download, CV, visa) until then. |
| Housing | **3C** | Build PRD Sprint 4 features (F-11–F-13) **and** retain third-party API integration (Spot-a-Home, Booking.com, Badi) from the legacy plan. |

---

## Relevant Files

- `prisma/schema.prisma` — Profile fields: CEFR, tuition budget, `aiPromptStep`.
- `src/lib/user-profile.ts` — Completeness checks, AI context formatting, step metadata.
- `src/lib/guided-chat.ts` — Structured JSON response parsing (F-02).
- `src/lib/local-profile.ts` — Guest profile localStorage helpers.
- `src/app/api/profile/route.ts` — Profile CRUD + completeness flag.
- `src/app/api/chat/route.ts` — Guided AI with profile injection.
- `src/app/(routes)/intake/page.tsx` — F-01 intake.
- `src/app/(routes)/profile/page.tsx` — F-04 profile settings.
- `src/app/(routes)/chat/page.tsx` — F-02 / F-03 LARA Guide UI.

### Notes

- Run `npx prisma db push` after pulling Sprint 1 schema changes (new columns).
- Unit tests should live alongside the code they cover when added.

---

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, change `- [ ]` to `- [x]` in this file.

---

## Tasks

- [ ] 0.0 Create feature branch
  - [ ] 0.1 Create and checkout branch (e.g. `feature/sprint-1-ai-core`)

- [x] 1.0 Foundation & Platform *(legacy Phase 1)*

- [ ] 2.0 Sprint 1 — Personalization & AI Core *(8-step user flow — ~95% complete)*
  - [x] 2.1 **Step 1** Homepage value proposition + Sprint 1 flow + smart CTAs
  - [x] 2.2 **Step 2** Require sign-in before profile / AI (`/intake`, `/chat` protected)
  - [x] 2.3 **Step 3 / F-01** Intake: CEFR, tuition budget, max 3 countries, DB persistence
  - [x] 2.4 **Step 3 / F-04** Profile gate on `/chat`; editable profile re-injects context
  - [x] 2.5 **Step 3 / F-04** Profile settings: CEFR + tuition budget + country limit
  - [x] 2.6 **Steps 4–8 / F-02** Guided chat API: structured JSON (direction, suggestions, nextStep)
  - [x] 2.7 **Steps 4–8 / F-02** Chat UI renders structured responses
  - [x] 2.8 **Steps 4–8 / F-03** 5-prompt progression + `aiPromptStep` persistence
  - [x] 2.9 **F-03** Prompt labels aligned to PRD (General study → Eligibility)
  - [x] 2.10 **Step 8 / F-03** Eligibility paywall (prompts 1–4 free, report gated)
  - [x] 2.11 Run `npx prisma db push` on Neon
  - [x] 2.12 Minimalist redesign: landing (≤3 CTAs), nav/footer, intake, chat, sign-in
  - [x] 2.13 Knowledge-base retrieval + optional web fallback (`lib/knowledge.ts`)
  - [x] 2.14 Paywall: `/pricing`, plan activation, premium `/report` (printable PDF)

- [ ] 3.0 Sprint 2 — Program Discovery & Application Tracker *(F-05, F-06, F-07, F-07b)*
- [ ] 4.0 Sprint 3 — Visa Process, Spain Phase A *(F-08, F-09, F-10)*
- [ ] 5.0 Sprint 4 — Accommodation & Relocation *(F-11, F-12, F-13 + APIs)*
- [ ] 6.0 Sprint 5 — Arrival & Student Setup, Barcelona *(F-14, F-15, F-16)*

---

**Last Updated:** June 13, 2026  
**Status:** Sprint 1 automated flow live; paywall at step 8 remains deferred

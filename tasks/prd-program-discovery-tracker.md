# PRD — Program Discovery & Tracker (+ Sprint 1 Polish)

**Product:** LARA (Learning & Relocation Assistant)  
**Version:** 1.1  
**Last Updated:** July 11, 2026  
**Parent PRD:** [`prd-lara-platform.md`](./prd-lara-platform.md)  
**Scope:** Sprint 1 remaining polish + Sprint 2 (Program Discovery & Application Tracker)

---

## 1. Introduction / Overview

Students who complete LARA’s intake and guided AI flow need a concrete next step: discover real programs, understand schools, curate a shortlist, and track applications through submission and decision.

Today, LARA has a working Sprint 1 flow (intake → profile → 5-prompt guided AI) and partial Sprint 2 scaffolding (`/swipe`, `/applications`, admin application views). Program data is still hardcoded in `/api/programs`, there are no dedicated school or browse pages, and the application tracker lacks document checklists, uploads, and the full status pipeline described in the platform PRD.

This PRD defines the work to **finish Sprint 1 polish** and **ship Sprint 2** as a cohesive discovery-to-tracking experience: AI-suggested shortlists, user-curated lists via search/browse, minimal school profiles, real database-backed APIs, a separate admin surface for content and operations, and a full application tracker for students and the LARA team.

**Goal:** Move users from “I know my study-abroad direction” to “I have a shortlist, I’m tracking applications, and LARA can support me end-to-end.”

---

## 2. Goals

1. **Connect AI guidance to program discovery** — After Sprint 1, users land in discovery with profile-aware defaults and AI-generated starter matches.
2. **Ship browsable, searchable program catalog** — Users can find programs via text search and filters, with intake profile pre-applied as defaults.
3. **Enable user-curated shortlists** — Users can add/remove programs from a persistent shortlist (AI suggestions + manual saves).
4. **Publish minimal school profiles** — Each school has a dedicated page with basics and linked programs; rich content deferred.
5. **Replace mock data with real backend** — Schools and programs served from Neon/Prisma; admin can manage catalog data.
6. **Deliver full application tracker** — Per-program checklist, document uploads, status pipeline, deadline countdown, and admin oversight.
7. **Close Sprint 1 gaps** — Navigation, CTAs, and flow handoffs from chat/eligibility into discovery feel seamless.

---

## 3. User Stories

### Student (authenticated)

- As a student who finished intake, I want LARA to suggest 3–5 programs matched to my budget, countries, and degree level so I have a starting shortlist without browsing everything.
- As a student, I want to search and filter programs by country, degree, budget, deadline, and language so I can explore beyond AI suggestions.
- As a student, I want browse filters to default from my profile so results feel relevant immediately, with the option to change them.
- As a student, I want to save programs to my shortlist and remove ones I don’t want so the list reflects my choices.
- As a student, I want to open a school profile to see basics (location, website, description) and all programs at that school so I can compare options in one place.
- As a student, I want to see eligibility badges (green / amber / red) on program cards so I know how well I match before applying.
- As a student, I want a per-application checklist with upload slots so I know what documents I need and can track progress.
- As a student, I want to move each application through clear statuses (Not Started → In Progress → Submitted → Decision → Accepted) and see deadline countdowns so I stay on track.
- As a student who completed guided AI prompt 3 (programs), I want a clear “Next step” CTA into Program Discovery so the journey continues without dead ends.

### LARA Admin (internal)

- As an admin, I want to create, edit, and delete schools and programs so the catalog stays current without code deploys.
- As an admin, I want to view all student applications across users so I can support applicants.
- As an admin, I want to access uploaded application documents and update application status so operations mirror the student journey.
- As an admin, I want a dedicated admin frontend (separate from the student app) so internal tools don’t clutter the student experience.

### Guest / unauthenticated

- As a visitor, I may browse programs in read-only mode (optional v1 — see Open Questions); saving, shortlist, and tracker require sign-in.

---

## 4. Functional Requirements

### 4.1 Sprint 1 Polish (remaining gaps)

| ID | Requirement |
|----|-------------|
| **S1-P01** | Guided AI prompt 3 (“Program recommendations”) must include a structured **Next Step** CTA linking to Program Discovery / shortlist (e.g. `/programs` or `/shortlist`). |
| **S1-P02** | Homepage and nav must expose Program Discovery entry points for users with a complete profile (not only `/swipe`). |
| **S1-P03** | Onboarding state (`resolveOnboardingState`) should route post–prompt-5 users toward discovery/shortlist when appropriate, not only back to `/chat`. |
| **S1-P04** | Deprecate or redirect `/swipe` to the new browse/shortlist experience unless swipe UX is explicitly retained as a secondary entry (default: redirect to browse). |
| **S1-P05** | Ensure profile edits (budget, countries, CEFR) invalidate or refresh AI shortlist suggestions on next load (no stale matches). |

### 4.2 Program Shortlist (F-05 — hybrid AI + user curated)

| ID | Requirement |
|----|-------------|
| **F-05a** | On first visit after profile completion, generate **3–5 AI-matched programs** from DB using profile: `targetCountries`, `universityBudgetMax`, `degreeLevels`, `cefrLevel`. |
| **F-05b** | Display shortlist as cards: program title, school name, city/country, tuition, duration, application deadline, eligibility badge (F-06). |
| **F-05c** | User can **add** programs from browse/search and **remove** programs from shortlist; persisted per user in DB. |
| **F-05d** | Shortlist is distinct from full application tracker but **“Apply / Track”** action creates or opens an `Application` record for that program. |
| **F-05e** | Empty state: if no DB matches, show message + suggest loosening filters or browsing catalog. |
| **F-05f** | Maximum shortlist size: **20 programs** (soft cap with UX message). |

### 4.3 Program Browsing & Search (F-05b extension — new pages)

| ID | Requirement |
|----|-------------|
| **F-05g** | New student route: **`/programs`** (browse catalog) with paginated or infinite-scroll results. |
| **F-05h** | **Text search** across program title, school name, city, and description (case-insensitive). |
| **F-05i** | **Filters:** country (multi), degree level, max tuition (€/year), language, application deadline window (e.g. next 3 / 6 / 12 months). |
| **F-05j** | **Profile-aware defaults:** on load, pre-fill filters from user profile (`targetCountries`, `universityBudgetMax`, `degreeLevels`); user can override any filter; show “Based on your profile” chip/banner when defaults active. |
| **F-05k** | Each result card: same fields as shortlist + actions **Save to shortlist** / **Remove** / **View school** / **Track application**. |
| **F-05l** | Sort options (v1): deadline (soonest), tuition (low–high), title (A–Z). |

### 4.4 School Profiles (minimal v1 — new page)

| ID | Requirement |
|----|-------------|
| **F-05m** | New student route: **`/schools/[id]`** showing: name, city, country, website (external link), description, list of programs at that school (linked to program detail or browse with school filter). |
| **F-05n** | Data sourced from `School` + related `Program` records in DB; no rankings, photos, or CMS rich content in v1. |
| **F-05o** | Optional index route **`/schools`** listing all schools (search by name/city/country) — recommended for discoverability. |
| **F-05p** | School fields editable only via admin (see F-07d); student-facing pages are read-only. |

### 4.5 Eligibility Badge System (F-06)

| ID | Requirement |
|----|-------------|
| **F-06a** | Each program card shows badge: **Green** (eligible), **Amber** (minor gap), **Red** (major gap). |
| **F-06b** | Eligibility computed server-side from profile vs program: budget, country preference, degree level, language/CEFR (rule-based v1; AI explanation optional). |
| **F-06c** | Tooltip or expand on badge explains the gap (e.g. “Tuition €18k exceeds your €15k budget”). |
| **F-06d** | Clicking badge opens inline panel or links to chat with pre-filled prompt: **“What should I improve to be eligible for [program]?”** |

### 4.6 Application Tracker — Student (F-07 full)

| ID | Requirement |
|----|-------------|
| **F-07a** | Extend `Application` model with pipeline status: **NOT_STARTED → IN_PROGRESS → SUBMITTED → DECISION → ACCEPTED** (plus **REJECTED**, **WITHDRAWN** as terminal). Map existing `SAVED`/`APPLIED` to new enum or migrate. |
| **F-07b** | New **`ApplicationDocument`** model: `applicationId`, `documentType` (enum: TRANSCRIPT, CV, MOTIVATION_LETTER, LANGUAGE_CERT, PASSPORT, OTHER), `fileName`, `storageUrl` or blob ref, `uploadedAt`, `status` (MISSING / UPLOADED / VERIFIED / REJECTED). |
| **F-07c** | Per-application **checklist UI** on `/applications/[id]` or expanded row: required doc types (default set per degree level; overridable by admin later), upload slot per type, progress indicator. |
| **F-07d** | File upload API: authenticated user, max file size (e.g. 10 MB), allowed types (PDF, DOCX, JPG, PNG); store in configured object storage or DB blob (implementation choice — see Technical Considerations). |
| **F-07e** | **Deadline countdown** on each application card from `program.applicationDeadline`. |
| **F-07f** | Status transitions: user can advance own status up to SUBMITTED; DECISION/ACCEPTED/REJECTED set by user or admin with audit `updatedAt`. |
| **F-07g** | List view at **`/applications`**: filter by status, sort by deadline; retain notes and existing download/paywall behavior where applicable. |

### 4.7 Admin Layer — Dual Frontend (F-07b + catalog management)

| ID | Requirement |
|----|-------------|
| **F-07h** | **Separate admin frontend** under **`/admin`** layout (existing) — not mixed into student nav; role-gated (`UserProfile.role === ADMIN` or dedicated admin auth). |
| **F-07i** | **Admin — Applications:** list all applications (existing `/admin` enhanced); detail view with document download, status update, notes. |
| **F-07j** | **Admin — Schools CRUD:** list, create, edit, delete schools (`name`, `countryCode`, `city`, `website`, `description`). |
| **F-07k** | **Admin — Programs CRUD:** list, create, edit, delete programs linked to school; fields match `Program` schema including deadline, tuition, degree level. |
| **F-07l** | **Admin — CSV import:** retain/improve existing import scripts (`scripts/import-csv.ts`, `import-schools-custom.ts`) as bulk onboarding path for catalog data. |
| **F-07m** | **Public read APIs** (student app): `GET /api/programs` (search/filter/pagination), `GET /api/programs/[id]`, `GET /api/schools`, `GET /api/schools/[id]`, `GET /api/shortlist`, `POST/DELETE /api/shortlist`. |
| **F-07n** | **Admin write APIs:** `POST/PATCH/DELETE /api/admin/schools`, `POST/PATCH/DELETE /api/admin/programs` with admin middleware. |

### 4.8 Data & Backend (dual frontend/backend)

| ID | Requirement |
|----|-------------|
| **F-08a** | Remove hardcoded program array from `/api/programs`; all student-facing program data from Prisma + Neon. |
| **F-08b** | Seed or import production catalog from `sample-schools.csv` / `sample-programs.csv` (or client CSVs) before launch. |
| **F-08c** | New **`Shortlist`** or **`SavedProgram`** join model: `userId`, `programId`, `source` (AI_SUGGESTED \| USER_SAVED), `createdAt`; unique per user+program. |
| **F-08d** | AI shortlist generation: server endpoint `POST /api/shortlist/generate` (or inline on first visit) queries programs with profile filters, ranks top 3–5, upserts with `source: AI_SUGGESTED`. |

---

## 5. Non-Goals (Out of Scope)

- Rich school profiles (rankings, galleries, campus maps, admissions statistics) — deferred to CMS phase.
- Automated document verification / OCR — manual admin review only in v1.
- Real-time WebSocket updates for admin — polling or refresh acceptable for v1.
- Multi-currency tuition normalization beyond stored `currency` field display.
- Replacing eligibility rules with full LLM scoring (rule-based badges only in v1).
- Visa module changes (Sprint 3).
- Housing / accommodation integration (Sprint 4).
- Native mobile apps — responsive web only.
- Public anonymous shortlist or tracker (sign-in required for save/track).

---

## 6. Design Considerations

### Student-facing UX

- **Information hierarchy:** Shortlist = “my picks”; Browse = “explore catalog”; Applications = “track progress.”
- **Profile chip:** When browse filters match profile, show subtle “Based on your profile” with one-click reset to clear overrides.
- **Cards:** Reuse minimalist LARA design system (teal accents, cream backgrounds) consistent with intake/chat.
- **Empty states:** No matches → suggest widening budget or adding countries; empty shortlist → CTA to browse or regenerate AI suggestions.
- **Mobile:** Filter drawer on small screens; cards stack vertically.

### Admin UX

- Table-first layouts for schools, programs, applications (align with existing `/admin` dark theme).
- Confirm dialogs on delete; prevent deleting schools with active programs without cascade warning.
- CSV import wizard: upload → preview → confirm (stretch; script-based import acceptable for v1).

### Key routes (target)

| Route | Purpose |
|-------|---------|
| `/shortlist` or `/programs/shortlist` | User shortlist (AI + saved) |
| `/programs` | Browse + search + filters |
| `/schools` | School index |
| `/schools/[id]` | School profile |
| `/applications` | Tracker list |
| `/applications/[id]` | Checklist + uploads + status |
| `/admin` | Admin home |
| `/admin/schools` | Schools CRUD |
| `/admin/programs` | Programs CRUD |
| `/admin/applications` | All applications (existing, enhanced) |

---

## 7. Technical Considerations

### Existing codebase to extend

- `prisma/schema.prisma` — `School`, `Program`, `Application` exist; add `Shortlist`, `ApplicationDocument`, extend `ApplicationStatus`.
- `src/app/api/programs/route.ts` — replace hardcoded JSON with Prisma queries + query params.
- `src/app/(routes)/swipe/page.tsx` — redirect or merge into `/programs`.
- `src/app/(routes)/applications/page.tsx` — extend for new statuses and link to detail/checklist.
- `src/app/(routes)/admin/` — add schools/programs management pages.
- `src/lib/sprint1-flow.ts` — update prompt 3 addon + next routes for discovery handoff.
- `scripts/import-csv.ts`, `sample-*.csv` — catalog seeding.

### Suggested schema additions (high level)

```prisma
enum ApplicationStatus {
  NOT_STARTED
  IN_PROGRESS
  SUBMITTED
  DECISION
  ACCEPTED
  REJECTED
  WITHDRAWN
  // migrate SAVED -> NOT_STARTED, APPLIED -> SUBMITTED
}

enum ShortlistSource {
  AI_SUGGESTED
  USER_SAVED
}

model ShortlistItem {
  id        String          @id @default(cuid())
  userId    String
  programId String
  source    ShortlistSource
  createdAt DateTime        @default(now())
  @@unique([userId, programId])
}

model ApplicationDocument {
  id            String   @id @default(cuid())
  applicationId String
  documentType  DocumentType
  fileName      String?
  storageKey    String?
  status        DocumentStatus @default(MISSING)
  uploadedAt    DateTime?
}
```

### File storage

- **Preferred:** S3-compatible (e.g. Cloudflare R2, Netlify Blobs) with signed upload URLs.
- **Fallback v1:** Local/dev storage + Netlify function upload; document URLs stored in DB.
- Admin and student must use same storage keys; admin detail view downloads via authenticated proxy route.

### Auth & authorization

- Student routes: NextAuth session required for shortlist, applications, uploads.
- Admin routes: middleware checks `ADMIN` role on `UserProfile`.
- API routes: separate admin namespace with role guard.

### Eligibility rules (v1)

| Check | Green | Amber | Red |
|-------|-------|-------|-----|
| Budget | tuition ≤ max budget | tuition ≤ max × 1.15 | tuition > max × 1.15 |
| Country | in targetCountries | — | not in list |
| Degree | in degreeLevels | — | not in list |
| Language | CEFR ≥ program min (if defined) | one level below | two+ levels below |

Overall badge = worst individual check (Red > Amber > Green).

### Performance

- Paginate `/api/programs` (default 20 per page).
- Index: `Program.countryCode`, `Program.degreeLevel`, `Program.applicationDeadline`, `School.countryCode`.

---

## 8. Success Metrics

| Metric | Target (90 days post-launch) |
|--------|------------------------------|
| Profile → shortlist view rate | ≥ 60% of users with complete profile |
| AI suggestion → user save rate | ≥ 40% keep at least 1 AI suggestion |
| Browse → shortlist add rate | ≥ 25% of browsers add ≥ 1 program |
| Shortlist → application created | ≥ 30% create ≥ 1 tracked application |
| Application checklist usage | ≥ 50% of tracked apps have ≥ 1 upload |
| Admin catalog coverage | ≥ 50 schools, ≥ 200 programs imported |
| Sprint 1 → Discovery CTA click-through | ≥ 35% from prompt 3 next-step |

---

## 9. Open Questions

1. **Anonymous browse:** Should `/programs` and `/schools/[id]` be public read-only, or require sign-in? *(Recommend: public browse, gated shortlist/track.)*
2. **Swipe UX:** Fully remove `/swipe` or keep as optional “quick pick” mode alongside browse?
3. **Document storage provider:** Netlify Blobs vs R2 vs other — depends on deployment budget and client preference.
4. **Application status migration:** One-time script to map `SAVED` → `NOT_STARTED`, `APPLIED` → `SUBMITTED` for existing rows?
5. **AI shortlist refresh:** Regenerate automatically on profile save, or only on explicit “Refresh suggestions” button? *(Recommend: explicit button + first visit to avoid churn.)*
6. **Program detail page:** Dedicated `/programs/[id]` or modal from browse only? *(Recommend: dedicated page for shareable URLs.)*
7. **Eligibility report integration:** Should premium `/report` include shortlist programs with badges? *(Nice-to-have; not blocking.)*

---

## 10. Implementation Phases (Suggested)

| Phase | Deliverable | Est. effort |
|-------|-------------|-------------|
| **A** | DB-backed programs API + import seed data + `/programs` browse (search, filters, profile defaults) | 8 |
| **B** | Shortlist model + AI generate + `/shortlist` UI + school pages (`/schools`, `/schools/[id]`) | 6 |
| **C** | Eligibility badges (F-06) on cards | 3 |
| **D** | Application schema migration + checklist + uploads + detail page | 8 |
| **E** | Admin schools/programs CRUD + enhanced application admin | 5 |
| **F** | Sprint 1 polish (CTAs, nav, `/swipe` redirect, flow routing) | 2 |
| | **Total** | **~32** |

*(Aligns with roadmap effort ~26 for S2 + buffer for S1 polish and full tracker scope.)*

---

## 11. Acceptance Criteria (Definition of Done)

- [ ] No hardcoded programs in production API paths.
- [ ] User sees 3–5 AI suggestions on first shortlist visit; can add/remove via browse.
- [ ] Browse supports text search + filters with profile-aware defaults.
- [ ] School profile page renders from DB with linked programs.
- [ ] Eligibility badges visible on shortlist and browse cards with tooltips.
- [ ] Application tracker supports full status pipeline, per-doc checklist, and file upload.
- [ ] Admin can CRUD schools/programs and manage all applications/documents in `/admin`.
- [ ] Sprint 1 chat prompt 3 routes users into discovery with clear next step.
- [ ] Existing authenticated users can migrate without data loss (applications preserved).

---

**Document owner:** LARA product/engineering  
**Next artifact:** [`tasks-program-discovery-tracker.md`](./tasks-program-discovery-tracker.md) *(generate on "Go")*

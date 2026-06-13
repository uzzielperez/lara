# PRD — LARA Platform

**Product Name:** LARA (Learning & Relocation Assistant)  
**Version:** 1.0  
**Last Updated:** May 6, 2026  
**Source:** LARA_Platform_Updated.pdf

---

## 1. Overview

### 1.1 Problem Statement

Students who want to study abroad face a fragmented, stressful, and opaque journey:

- Lack of personalized guidance
- Difficulty finding suitable programs
- Complex visa processes
- Housing and relocation uncertainty
- Fragmented post-admission setup

### 1.2 Vision

Transform the journey:

> **“From curious to admitted — and fully relocated — in one unified guided system.”**

LARA provides an AI-powered, end-to-end study abroad operating system.

---

## 2. Product Scope

LARA covers the full student lifecycle:

1. Personalization & AI Guidance
2. Program Discovery & Application Tracking
3. Visa Processing
4. Accommodation & Relocation
5. Arrival & Student Setup

---

## 3. Key User Journey

### Master Flow

`Discover LARA → Create Profile → AI Guidance → Program Selection → Visa Process → Housing → Arrival Setup → Completion`

### Lifecycle Outcome

User transitions from:

- **Start:** “I want to study abroad”
- **End:** “I am admitted and fully relocated in my destination country”

---

## 4. Core Product Modules

### 4.1 Sprint 1 — Personalization & AI Core

**Goal:** Create a deeply personalized AI experience from the first interaction.

#### Sprint 1 User Flow *(authoritative sequence)*

> **UPDATED:** Profile creation is now a core Sprint 1 deliverable — it must complete **before** any AI interaction.

| Step | Stage | Description |
|------|-------|-------------|
| 1 | **User lands on LARA** | Sees value proposition on homepage |
| 2 | **Signs up / Logs in** | Account created (required before profile + AI) |
| 3 | **Profile creation** | Budget, academic level, countries (1–3), CEFR — stored and injected into AI context |
| 4 | **Prompt 1 — General study** | First AI interaction: personalized study-abroad overview |
| 5 | **Prompt 2 — Country suggestions** | AI compares and prioritizes target countries |
| 6 | **Prompt 3 — Program recommendations** | AI suggests program types and search strategy |
| 7 | **Prompt 4 — Admission requirements** | AI outlines documents, deadlines, language tests |
| 8 | **Prompt 5 + Paywall — Eligibility** | Eligibility assessment; monetization trigger |

```
Land → Sign in → Profile → P1 General → P2 Countries → P3 Programs → P4 Requirements → P5 Eligibility (+ Paywall)
```

| ID | Feature | Maps to step(s) |
|----|---------|-----------------|
| **F-01** | Intake Form | Step 3 — budget, academic level, preferred countries (1–3), CEFR. Stored securely and injected into AI context. |
| **F-04** | Profile Creation *(Critical Update)* | Step 3 — mandatory before AI. Editable in settings. Cross-device sync. Re-injected into AI context after edits. |
| **F-02** | Guided AI Engine | Steps 4–8 — every response includes: personalized direction, 2–3 suggested paths, 1 clear “Next Step” CTA. No long-form responses. |
| **F-03** | 5-Prompt Progression + Paywall | Steps 4–8 — General study → Country suggestions → Program recommendations → Admission requirements → Eligibility → **Paywall trigger**. |

**Output:** Fully personalized onboarding + AI system with monetization trigger embedded.

---

### 4.2 Sprint 2 — Program Discovery & Tracker

**Goal:** Help users identify and track suitable programs.

| ID | Feature | Description |
|----|---------|-------------|
| **F-05** | Program Shortlist | 3–5 matched programs. Filtered by degree level, budget, country. Card: university, tuition, duration, deadline. |
| **F-06** | Eligibility Badge System | Green: eligible. Amber: minor gap. Red: major gap. Tooltip explains gap. Click triggers “What to improve” AI. |
| **F-07** | Application Tracker (Client) | Document checklist per university, upload slots. Status: Not Started → In Progress → Submitted → Decision → Accepted. Deadline countdown. |
| **F-07b** | Admin Dashboard *(NEW)* | Internal LARA team view: all applications, document access, status management, real-time updates. |

**Output:** End-to-end application tracking + internal admin operations layer.

---

### 4.3 Sprint 3 — Visa Process (Spain First)

**Goal:** Guide students through visa application.

**Scope:** Phase A — Spain only. Origin countries: Philippines + UAE.

| ID | Feature | Description |
|----|---------|-------------|
| **F-08** | Visa Checklist | Origin-aware requirements, document upload slots, official embassy links. |
| **F-09** | Appointment Scheduling | Embassy booking links, wait time estimates, 7-day and 30-day reminders. |
| **F-10** | Visa Status Tracker | 6-stage flow: Not Started → Documents Ready → Appointment Booked → Submitted → Approved/Rejected. Progress bar. |

**Backend requirement:** Admin access to all uploaded documents.

**Output:** Full visa workflow automation for Spain (Phase A).

---

### 4.4 Sprint 4 — Accommodation & Relocation (Frontend Only)

**Goal:** Support relocation planning.

| ID | Feature | Description |
|----|---------|-------------|
| **F-11** | Housing Search | Filters: city, budget, room type. Listing cards: price, distance, availability. |
| **F-12** | Budget Planner | Pre-filled cost-of-living, editable values, over-budget indicator (red), PDF export. |
| **F-13** | Pre-Departure Checklist | 5 categories, progress tracking, shareable link, roadmap integration. |

**Constraints:**

- No backend required
- Fully frontend + local data

---

### 4.5 Sprint 5 — Arrival & Student Setup (Barcelona First)

**Goal:** Complete post-arrival integration.

| ID | Feature | Description |
|----|---------|-------------|
| **F-14** | Student ID Guide | University-specific steps, required documents, office details. |
| **F-15** | Bank Account Guide | Top Spanish student banks (BBVA, CaixaBank, Sabadell), required documents, application links. |
| **F-16** | Local Registration (Empadronamiento) | Barcelona-specific steps, must register within 30 days, deadline calculator, official municipal links. |

**Outcome:** Final “Journey Complete” screen and full roadmap completion.

---

## 5. System Architecture Requirements

### 5.1 AI System

- Context-aware responses using user profile
- Structured output: Direction, Suggestions, CTA
- Prompt progression system (5 steps)

### 5.2 Data Model

- User Profile
- Applications
- Documents
- Visa status
- Saved programs
- Housing selections

### 5.3 Admin Layer

- Application monitoring
- Document review
- Status updates
- Cross-user visibility

---

## 6. Key Product Principles

1. AI must always be structured and guided
2. No overwhelming text dumps
3. Every interaction ends in a Next Step
4. System is stateful and progressive
5. Admin layer mirrors client journey
6. Spain-first, globally extensible

---

## 7. Edge Cases

| Scenario | Behavior |
|----------|----------|
| No program matches | Adjust filters |
| Document rejection | Re-upload flow |
| Visa rejection | Resubmission guidance |
| Budget exceeded | Visual alert |
| Missing profile | Block AI until completion |

---

## 8. Success Metrics

- Profile completion rate
- Program save rate
- Application creation rate
- Visa completion rate
- Conversion from free → paid (prompt 5)
- End-to-end journey completion

---

## 9. Future Expansion

- EU-wide visa flows (Germany, Netherlands, France)
- Multi-country housing integration
- Automated document verification
- Agent-based AI relocation assistant

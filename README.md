# Tredence HR Workflow Designer

A production-grade, AI-powered recruitment automation platform built for Tredence. The application provides a visual drag-and-drop workflow canvas where HR teams can design end-to-end hiring pipelines, execute them against real candidate data, review AI-generated evaluations, and dispatch personalised emails — all from a single interface.

---

## Table of Contents

- [Overview](#overview)
- [Screenshots](#screenshots)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [CSV Input Format](#csv-input-format)
- [Workflow Execution Pipeline](#workflow-execution-pipeline)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)

---

## Overview

The platform replaces manual screening processes with an intelligent pipeline that:

- Parses candidate resumes directly from Google Drive PDF links
- Evaluates each candidate against real Tredence job descriptions using the Gemini 2.0 Flash API
- Surfaces AI fit scores (0–100), recommendation tiers (APPROVE / REVIEW / REJECT), and detailed strengths and weaknesses to HR
- Requires an explicit HR decision before any email is dispatched — no automated outbound communication
- Persists all evaluation results to a Neon PostgreSQL database via Prisma

---

## Screenshots

### Landing Page

![Landing Page](public/images/home.png)

### Workflow Canvas (Dark Mode)

![Workflow Canvas](public/images/canvas.png)

### Workflow Canvas (Light Mode)

![Workflow Canvas Light](public/images/light.png)

### Workflow Builder

![Workflow](public/images/workflow.png)

### HR Review Panel — Evaluation Results

![Evaluation Results](public/images/result.png)

### Candidate Email Preview

![Email Preview](public/images/email.png)

### Database Records

![Database](public/images/database.png)

---

## Architecture

### System Architecture Diagram

```mermaid
graph TD
    A[HR User] -->|Designs workflow on canvas| B[Workflow Canvas<br/>React Flow / XYFlow]
    B -->|Triggers execution| C[POST /api/execute<br/>Next.js Route Handler]

    C --> D[CSV Parser<br/>csv-parse]
    D -->|Per candidate row| E{Candidate Processing Loop}

    E --> F[PDF Resume Fetch<br/>axios + Google Drive]
    F --> G[PDF Text Extraction<br/>pdf-parse v1]
    G --> H[Gemini 2.0 Flash<br/>AI Evaluation]
    H -->|fitScore, recommendation,<br/>strengths, weaknesses| I[DB Upsert<br/>Prisma + Neon PostgreSQL]
    I --> J[Stream Result to UI<br/>ReadableStream / JSON-lines]

    J --> K[HR Review Panel<br/>ExecutionDataDrawer]
    K -->|HR sets APPROVE / REVIEW / REJECT| L{HR Decision}
    L -->|APPROVE selected| M[POST /api/send-emails]
    M --> N[Nodemailer SMTP<br/>Personalised Email Dispatch]

    subgraph Backend Services
        F
        G
        H
        I
    end

    subgraph Frontend
        B
        K
    end

    subgraph Database
        O[(Neon PostgreSQL)]
        I --> O
    end
```

### Execution Flow Diagram

```mermaid
sequenceDiagram
    participant HR as HR User
    participant UI as Workflow Canvas
    participant API as /api/execute
    participant GDrive as Google Drive
    participant Gemini as Gemini 2.0 Flash
    participant DB as Neon PostgreSQL
    participant Email as /api/send-emails

    HR->>UI: Uploads CSV, clicks Run Workflow
    UI->>API: POST /api/execute (workflow + CSV)
    Note over API: Streaming response begins

    loop For each candidate in CSV
        API->>GDrive: Download PDF resume
        GDrive-->>API: Raw PDF bytes
        API->>API: Extract text via pdf-parse
        API->>Gemini: Evaluate resume vs. job description
        Note over Gemini: Returns fitScore, recommendation,<br/>strengths, weaknesses, summary
        Gemini-->>API: JSON evaluation result
        API->>DB: Upsert candidate record
        API-->>UI: Stream candidate_done event
        UI->>UI: Update HR Review Panel in real-time
    end

    API-->>UI: Stream complete event
    HR->>UI: Reviews each candidate, overrides AI decisions
    HR->>UI: Clicks "Send Emails to N Approved"
    UI->>Email: POST /api/send-emails (approved candidates)
    Email->>DB: Update candidate status to HR decision
    Email-->>HR: Personalised emails dispatched
```

### Node Type Reference

```mermaid
graph LR
    S([Start Trigger]) --> CSV[CSV Data Source]
    CSV --> PDF[PDF Resume Parser]
    PDF --> AI[Gemini Eval Node]
    AI --> DB[(Database Node)]
    DB --> COND{Condition Node}
    COND -->|Score >= 70| AP[Approval Node]
    COND -->|Score < 70| EM[Email Node]
    AP --> EM
    EM --> END([End])
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| UI Components | shadcn/ui, Radix UI, Lucide React, HugeIcons |
| Canvas / Flow | XYFlow (React Flow) v12 with Dagre auto-layout |
| State Management | Zustand |
| Styling | Tailwind CSS v4 |
| AI Evaluation | Google Generative AI — Gemini 2.0 Flash |
| PDF Parsing | pdf-parse v1.1.1 (polyfilled for Node.js) |
| Database ORM | Prisma 7 with Neon adapter |
| Database | Neon Serverless PostgreSQL |
| Email | Nodemailer (SMTP) |
| HTTP Client | Axios |
| CSV Parsing | csv-parse |

---

## Project Structure

```
tredence/
├── app/
│   ├── api/
│   │   ├── execute/          # Streaming candidate evaluation pipeline
│   │   ├── send-emails/      # HR-triggered email dispatch
│   │   ├── simulate/         # Lightweight UI simulation endpoint
│   │   ├── workflows/        # Workflow CRUD
│   │   └── jobs/             # Job role seeding and retrieval
│   ├── designer/             # Workflow canvas page
│   └── page.tsx              # Landing page
├── components/
│   ├── canvas/
│   │   ├── CanvasToolbar.tsx       # Run/Save controls, execution streaming
│   │   ├── ExecutionDataDrawer.tsx # HR Review Panel modal
│   │   └── WorkflowCanvas.tsx      # XYFlow canvas wrapper
│   ├── nodes/                      # Individual node type components
│   └── sidebar/
│       └── NodePalette.tsx         # Drag-and-drop node library
├── hooks/
│   └── useWorkflowStore.ts         # Zustand global state
├── lib/
│   ├── db.ts                       # Prisma client singleton
│   ├── types.ts                    # Shared TypeScript types
│   └── services/
│       ├── gemini.ts               # Gemini API + retry logic
│       ├── pdf.ts                  # PDF download and text extraction
│       └── email.ts                # Nodemailer SMTP wrapper
├── prisma/
│   └── schema.prisma               # Database schema
├── scripts/
│   ├── scraped-jobs.json           # 40+ live Tredence job descriptions
│   ├── seed-jobs.ts                # Job seeding script
│   └── check-drive-links.js        # Drive link accessibility checker
└── public/
    ├── images/                     # Application screenshots
    └── dummy_candidates.csv        # Sample CSV for testing
```

---

## Environment Variables

Create a `.env` file at the project root with the following keys:

```env
# Neon PostgreSQL connection string
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Google Gemini API key
GEMINI_API_KEY=your_gemini_api_key

# SMTP configuration for email dispatch
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=your@gmail.com
```

> For Gmail, generate an App Password from your Google Account security settings. Standard account passwords will not work if 2-factor authentication is enabled.

---

## Getting Started

### Prerequisites

- Node.js 20 or higher
- A Neon PostgreSQL database
- A Google Gemini API key (free tier at [aistudio.google.com](https://aistudio.google.com))
- A Gmail account with SMTP App Password enabled

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/tredence.git
cd tredence

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed Tredence job roles (40+ live job descriptions)
npx ts-node scripts/seed-jobs.ts
```

### Development Server

```bash
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000).

---

## CSV Input Format

The execution engine accepts CSV files with the following columns. Column names are case-insensitive and several aliases are supported.

| Column | Accepted aliases | Required | Description |
|---|---|---|---|
| `name` | `candidateName`, `fullName`, `candidate` | Yes | Candidate full name |
| `email` | `emailAddress`, `mail` | Yes | Candidate email address |
| `resumeLink` | `resume`, `resumeUrl`, `cv`, `cvLink` | Recommended | Google Drive file ID or share URL |
| `roleId` | `roleName`, `role`, `jobTitle`, `position`, `title` | Recommended | Target role name matching a Tredence job |


### Supported Resume Link Formats

All of the following formats are automatically converted to a direct download URL at runtime:

```
# Full share link
https://drive.google.com/file/d/FILE_ID/view?usp=sharing

# Direct download link
https://drive.google.com/uc?export=download&id=FILE_ID

# Bare file ID (no URL prefix required)
1ZH_THHgmtDgY2_u6Lw6BDdfzwGvHHbFi
```

> Files must be shared with "Anyone with the link" access. Private files will result in an HTML response instead of PDF content.

---

## Workflow Execution Pipeline

The execution pipeline is implemented as a streaming `POST /api/execute` route that emits JSON-line events over a `ReadableStream`, allowing the HR Review Panel to update in real-time as each candidate is processed.

### Processing Steps (per candidate)

1. **Column Mapping** — Extract name, email, resumeLink, and roleName from CSV row using flexible alias resolution.
2. **Job Role Matching** — Fuzzy-match the roleName against the 40+ Tredence job descriptions stored in the database. Falls back to a generic Tredence description when no match is found.
3. **PDF Resume Retrieval** — Download the PDF via Axios with redirect following. The file ID is resolved to a direct download URL automatically.
4. **Text Extraction** — Extract raw text from the PDF buffer using pdf-parse (with Node.js DOM polyfills applied before library load).
5. **Gemini Evaluation** — Submit the resume text and job description to Gemini 2.0 Flash with a structured JSON prompt. Includes exponential back-off retry (3 attempts: 10s, 20s, 40s) to handle free-tier rate limits. A 3-second inter-candidate delay prevents hitting the 15 RPM ceiling.
6. **Database Persistence** — Upsert the candidate record into Neon PostgreSQL with the AI score, evaluation JSON, and matched role FK.
7. **Stream Event** — Emit a `candidate_done` event containing the full evaluation result, email body, and pre-filled HR decision.

### HR Review (Manual Gate)

After all candidates are processed:

- The HR Review Panel displays each candidate's AI score, recommendation, strengths, and weaknesses.
- HR may override any AI decision using the Approve / Review / Reject controls per row.
- The "Send Emails" button is only enabled when at least one candidate is marked Approved.
- Clicking it triggers `POST /api/send-emails` with only the approved subset.

---

## API Reference

### `POST /api/execute`

Streams the full candidate evaluation pipeline.

**Request body (JSON):**

```json
{
  "nodes": [...],
  "edges": [...],
  "csvContent": "name,email,roleId,resumeLink\n...",
  "csvFileName": "candidates.csv"
}
```

**Response:** `text/event-stream` — newline-delimited JSON events.

| Event type | Description |
|---|---|
| `start` | Pipeline started, total candidate count |
| `node_status` | Node status update (running / success / failed / skipped) |
| `candidate_start` | Candidate processing begun |
| `candidate_done` | Candidate fully evaluated, includes all result fields |
| `candidate_error` | Candidate failed to process |
| `complete` | All candidates processed |

---

### `POST /api/send-emails`

Dispatches personalised emails to HR-approved candidates and updates their database status.

**Request body (JSON):**

```json
{
  "candidates": [
    {
      "name": "Mohit Verma",
      "email": "mohit.verma27104@gmail.com",
      "fitScore": 82,
      "recommendation": "APPROVE",
      "hrDecision": "APPROVE",
      "emailSubject": "Your Application Status — Tredence",
      "emailBody": "Dear Mohit Verma, ..."
    }
  ]
}
```

**Response:**

```json
{ "sent": 1, "failed": 0, "results": [...] }
```

---

## Database Schema

```prisma
model Workflow {
  id          String   @id @default(uuid())
  name        String
  description String?
  nodes       Json
  edges       Json
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model JobRole {
  id          String      @id @default(uuid())
  rippleId    String      @unique
  title       String
  location    String?
  experience  String?
  description String
  openings    Int         @default(1)
  candidates  Candidate[]
}

model Candidate {
  id           String   @id @default(uuid())
  name         String
  email        String
  roleId       String
  role         JobRole  @relation(fields: [roleId], references: [id])
  resumeLink   String?
  status       String   @default("REVIEW")
  aiScore      Int?
  aiEvaluation Json?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

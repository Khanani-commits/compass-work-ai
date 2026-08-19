# WorkPilot AI

An AI-powered workplace productivity assistant that turns raw meeting notes into structured action items, prioritized tasks, scheduled work blocks, and professional emails — all in one integrated workflow.

## Project Overview

WorkPilot AI is a modern SaaS-style application designed for busy professionals who need to convert unstructured workplace information into clear, actionable output. The assistant follows a logical productivity pipeline:

**Meeting Notes → Action Items → Prioritized Tasks → Schedule → Professional Email**

Whether you are preparing for a meeting, wrapping one up, or following up with stakeholders, WorkPilot AI helps you stay organized, save time, and communicate clearly.

The app is built as a full-stack React application with server-side AI processing, a responsive dashboard, and client-side history management so users can revisit and reuse every generated result.

## Features

### 1. AI Meeting Notes Summarizer
- Paste raw or messy meeting notes and get a structured summary.
- Output includes:
  - Executive summary
  - Key discussion points
  - Decisions made
  - Action items with owners, deadlines, and priority
  - Follow-ups and unresolved questions
- Copy results to the clipboard with one click.
- Continue the workflow by sending action items directly to the Task Planner.

### 2. AI Task Planner & Scheduler
- Enter a list of tasks, deadlines, and priorities to receive a realistic, time-boxed plan.
- Supports daily and weekly planning horizons.
- Considers working hours and preferred working days.
- Generates:
  - Prioritized task list with effort estimates
  - Non-overlapping schedule blocks
  - Conflict warnings
  - Practical scheduling advice
- Start the next step by drafting a professional update email from the plan.

### 3. Smart Email Generator
- Generate polished, professional emails from a purpose and key points.
- Choose tone presets such as Professional, Friendly, Formal, Diplomatic, or Concise.
- Adjust length and formality with one-click refinement controls.
- Produces:
  - Subject line
  - Structured body with greeting, introduction, body, call to action, and closing
  - Notes on placeholders or missing details

### 4. Unified Dashboard
- Time-of-day greeting and productivity overview.
- Quick stats for tasks, deadlines, and upcoming actions.
- One-click navigation to every AI tool.

### 5. Activity History
- Automatically saves every AI-generated summary, plan, and email to local storage.
- Review, edit, copy, or delete previous results.
- Resume work from any prior output without re-running the AI.

### 6. Responsive Design
- Optimized for desktop, tablet, and mobile.
- Collapsible sidebar and mobile navigation menu.
- Consistent professional styling across all screen sizes.

### 7. Responsible AI
- Built-in disclaimers remind users to review AI output before sharing.
- Clear guidance on avoiding sensitive or confidential data.
- Settings page for data management and preference controls.

## Tools Used

| Category | Technology |
|----------|------------|
| Framework | [TanStack Start](https://tanstack.com/start/) — full-stack React framework with file-based routing and server functions |
| Language | TypeScript |
| UI Library | React 19 |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui components |
| AI Model | `google/gemini-2.5-flash` via the Lovable AI Gateway |
| State Management | TanStack Query for server state |
| Persistence | Browser `localStorage` for activity history |
| Icons | Lucide React |
| Font | Plus Jakarta Sans |

## Setup Instructions

### Prerequisites
- Node.js 18 or later
- npm, pnpm, or bun
- A Lovable AI Gateway API key (for AI features)

### 1. Clone the repository
```sh
git clone <repository-url>
cd <repository-name>
```

### 2. Install dependencies
```sh
npm install
```

### 3. Configure environment variables
Create a `.env` file in the project root and add the following:

```env
LOVABLE_API_KEY=your_lovable_api_key_here
```

This key is required for the AI summarizer, planner, and email generator to work.

### 4. Start the development server
```sh
npm run dev
```

The app will be available at `http://localhost:8080` by default.

### 5. Build for production
```sh
npm run build
```

### 6. Run the production server
```sh
npm run start
```

## Project Structure

```
src/
├── components/workpilot/    # Shared UI components and layout
├── lib/                     # AI client, server functions, types, and utilities
├── routes/                  # TanStack Start file-based routes
├── styles.css               # Tailwind CSS v4 theme and design tokens
└── server.ts                # SSR server entry wrapper
```

## Deployment

This project is built on the Lovable platform and can be published directly from the Lovable editor. It can also be self-hosted by connecting the repository to GitHub and deploying to any platform that supports Node.js or edge runtimes.

## Responsible AI Notice

WorkPilot AI generates content using an AI model. Outputs are intended as drafts and should be reviewed for accuracy, tone, and confidentiality before being shared or acted upon. Do not paste sensitive personal, financial, or legally privileged information into the application unless you trust the deployment environment.

---

Built with [Lovable](https://lovable.dev).

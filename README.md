# SY0-701 MCQ x PBQ Simulator

A CompTIA Security+ (SY0-701) practice platform I built while studying for my own exam — scenario-based multiple-choice and performance-based questions, a Pearson VUE-style review screen, and domain-level analytics, instead of another flashcard app.

## Why

Most free Security+ question banks are recall-only ("what does X stand for") and don't match how the real exam asks questions — scenario-driven, with PBQs mixed in. I rewrote the question set as scenarios and built the review flow to match the actual exam format, so my practice sessions would actually predict my readiness.

## What it does

- Scenario-based MCQs and PBQs across all five SY0-701 domains
- Study Mode and Exam Mode (timed, scaled scoring)
- Full answer-review screen after each attempt, with expand/collapse per question
- Domain-level analytics (Recharts) to show weak areas over multiple attempts

## Tech stack

React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Supabase (client). Tests with Vitest and Playwright.

## Running it locally

```bash
git clone https://github.com/cyr6x/MCQ-X-PBQ-SIM-vercel.git
cd MCQ-X-PBQ-SIM-vercel
npm install
npm run dev
```

Uses Supabase — check for a `.env.example` in the repo for any required environment variables before running.

## Status

Actively used for my own Security+ prep — question bank and review UI still getting refined.

`[SCREENSHOT: exam mode question view]`
`[SCREENSHOT: review/results screen with domain breakdown]`

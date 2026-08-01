---
title: "SiliconForge"
tagline: "Requirements in, software out"
url: https://anp.pub
cover: /covers/siliconforge.webp
tech: [Cloudflare, Machine-readable PRD, Parallel AI squads, Executor verification]
year: 2026
featured: true
status: beta
order: 8
persona: business requesters
---

## What it is

A production line that turns UI-level pain points into shipped software. The homepage *is* the console, not a brochure — both submitting a request and looking one up hit real data.

- **Submit** — answer 9 questions (mostly multiple choice, two or three minutes) to turn "the thing that hurts every day" into a machine-readable PRD, and get a ticket number
- **Run the line** — once an FDE reviews and approves it, Cloudflare schedules parallel AI squads to build, verify and deliver under engineering discipline
- **Track** — use the ticket number to see where it is: pending review → approved → in development → delivered
- **Two delivery grades** — output ships first at "model-reviewed" grade, then an executor actually runs the generated tests and returns evidence, promoting it to "verified" or "execution failed"

Already have a PRD? Use *PRD direct submit* — upload the PRD JSON plus reference material (API docs, field mappings) and skip the nine questions straight into the same review queue.

## Why build it

Most "AI writes your code" products assume the user is a developer — you have to describe a technical solution to get anything back. But the people actually suffering through bad interfaces every day are business users: they can describe the pain precisely and the solution not at all.

So this line lowers the entry to "answer nine multiple-choice questions" and hands the translation into engineering language to the machine-readable PRD plus FDE review. It also separates "the AI says it's done" from "the tests actually ran" into two distinct states — only the second one is safe to use.

## How to use it

Open [anp.pub](https://anp.pub), spend two or three minutes filing a request, and track it by ticket number (mobile-friendly).

Want to see the whole line first? There's a *pipeline demo* (animated simulation, writes no data). To find out which machine generates the code and who actually runs the tests, see the *system architecture* page. There are also usage docs, an agent guide and progress weeklies.

Good for: business teams blocked for months by one internal screen that never makes the IT backlog; and anyone testing how short the path from requirement to software can get.

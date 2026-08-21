---
name: GSD Hackathon Workflow
description: Get Shit Done - spec-driven development workflow for the Odoo hackathon. Enforces structured planning, atomic tasks, checkpoint verification, and fresh-context execution to prevent context rot.
---

# GSD (Get Shit Done) — Hackathon Workflow

This skill implements the GSD methodology for spec-driven development during the hackathon.

## Core Principles

1. **Spec Before Code** — Never write code without a clear specification
2. **Atomic Tasks** — Break work into small, verifiable units
3. **Checkpoint Verification** — Verify each task before moving on
4. **Fresh Context** — Keep each task focused to avoid context drift
5. **Git Discipline** — Atomic commits with meaningful messages

## Workflow Steps

### Phase 1: Problem Analysis
When the user shares a problem statement:
1. Read and analyze the full problem statement
2. Identify core requirements vs nice-to-haves
3. Map requirements to the existing starter pack (Django REST + React + Vite + Tailwind + JWT)
4. Create `specs/PROBLEM_SPEC.md` with structured analysis

### Phase 2: Architecture Design
1. Design the data model (Django models)
2. Define API endpoints (DRF serializers + views)
3. Plan frontend pages and components
4. Create `specs/ARCHITECTURE.md` with the full design
5. Get user approval before proceeding

### Phase 3: Implementation (Atomic Tasks)
For each feature:
1. Create/update `specs/TASKS.md` with checkboxes
2. Implement ONE task at a time
3. After each task:
   - Verify it works (run server, check for errors)
   - Mark task as complete
   - Commit with a descriptive message
4. Never skip verification

### Phase 4: Polish & Submit
1. Test all flows end-to-end
2. Fix edge cases
3. Prepare demo video talking points
4. Final commit and push

## Task Format

Each task in TASKS.md should follow this format:
```markdown
- [ ] **[COMPONENT] Task Description**
  - Files: `path/to/file1.py`, `path/to/file2.jsx`
  - Depends on: [previous task if any]
  - Verify: [how to verify this works]
```

## Git Commit Convention

```
[component] brief description

- Detail 1
- Detail 2
```

Components: `backend`, `frontend`, `auth`, `models`, `api`, `ui`, `config`, `docs`

## Rules

- NEVER write more than one feature without verifying the previous one
- ALWAYS update TASKS.md progress after completing a task
- If a task is taking too long, break it into smaller sub-tasks
- If stuck for more than 5 minutes, flag it and move to the next task
- Keep the user informed of progress at every checkpoint

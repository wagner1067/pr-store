# Project Plan - PR Store Ecosystem Setup

## Overview
Initial setup of the PR Store Web ecosystem, database schema configuration, project structure, and git repository initialization.

## Project Type
**WEB** (Next.js 15, React, Prisma, Tailwind, Supabase)

## Success Criteria
- Prisma schema is successfully written and validated.
- Supabase database is synchronized via Prisma with no schema errors.
- Clean architecture folders are created inside `src/` adhering to SOLID principles.
- Git repository is initialized with a `.gitignore` (excluding `.env`) and the initial commit is made on the main branch.
- No security credentials or `.env` files are tracked in git.

## Tech Stack
- **Core Framework**: Next.js 15 (App Router, TypeScript)
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma ORM
- **Styling**: Tailwind CSS
- **Version Control**: Git + GitHub MCP
- **Environment Management**: Dotenv (`.env`)

## File Structure
```plaintext
site pr store/
├── .agents/
├── .git/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   ├── lib/
│   │   └── db.ts
│   └── middleware.ts
├── .env
├── .gitignore
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Task Breakdown

### Task 1: Environment Configuration
- **Agent**: `database-architect`
- **Skills**: `clean-code`, `database-design`
- **Priority**: P0
- **Dependencies**: None
- **INPUT**: Database connection string from `mcp_config.json`.
- **OUTPUT**: `.env` file configured with `DATABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- **VERIFY**: Check that the `.env` file contains correct variables.

### Task 2: Prisma Schema Setup
- **Agent**: `database-architect`
- **Skills**: `clean-code`, `database-design`
- **Priority**: P0
- **Dependencies**: Task 1
- **INPUT**: prisma/schema.prisma schema snippet from the prompt.
- **OUTPUT**: File `prisma/schema.prisma` written using filesystem MCP.
- **VERIFY**: Run `npx prisma validate` and verify it succeeds.

### Task 3: Next.js 15 Scaffolding
- **Agent**: `frontend-specialist`
- **Skills**: `app-builder`, `clean-code`
- **Priority**: P1
- **Dependencies**: None
- **INPUT**: Empty directory.
- **OUTPUT**: Initialized Next.js 15 template and dependencies.
- **VERIFY**: Run `npm run build` or inspect package.json.

### Task 4: Database Synchronization
- **Agent**: `database-architect`
- **Skills**: `database-design`
- **Priority**: P0
- **Dependencies**: Task 2, Task 3
- **INPUT**: schema.prisma and configured `.env`.
- **OUTPUT**: Synced database tables in Supabase.
- **VERIFY**: Run `npx prisma db push` or verify tables exist in PostgreSQL database using `postgres` MCP or terminal.

### Task 5: SOLID Directory Structure Creation
- **Agent**: `frontend-specialist`
- **Skills**: `clean-code`
- **Priority**: P1
- **Dependencies**: Task 3
- **INPUT**: Clean nextjs scaffold.
- **OUTPUT**: Directory structure under `src/` separating public and admin routes.
- **VERIFY**: Run `list_dir` on `src/app` to verify directories.

### Task 6: Git Initialization & Initial Commit
- **Agent**: `devops-engineer`
- **Skills**: `deployment-procedures`
- **Priority**: P1
- **Dependencies**: Task 1, Task 2, Task 3, Task 4, Task 5
- **INPUT**: Working folder with schema, config, and directories.
- **OUTPUT**: Git repository initialized with `.gitignore` and initial commit on main.
- **VERIFY**: Run `git status` and check that `.env` is ignored and code is committed.

## Phase X: Final Verification
- [ ] No purple/violet hex codes in styling
- [ ] No standard template layouts
- [ ] Socratic Gate was respected
- [ ] Next.js Build: `npm run build` succeeds
- [ ] Security Scan: `python .agents/skills/vulnerability-scanner/scripts/security_scan.py .` passes
- [ ] Lint: `npm run lint` or `npx tsc --noEmit` passes

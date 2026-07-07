# Project Plan - PR Store Features Development

## Overview
Implementation plan for the complete features of the PR Store: storefront, admin ERP, route handlers, and security components.

## Project Type
**WEB** (Next.js 15, React, Prisma, Tailwind, Supabase)

## Success Criteria
- Home page displays category filters, countdown timers for promotions, lead capturing dialog, and shopping cart.
- Admin ERP displays metrics charts (DIA/MÊS/ANO), employee/owner RBAC, PDV interface, and Promissória debt board.
- Caching layer mock for products list using Next.js streaming API.
- All forms are secure and verified using Zod schemas.

## Tech Stack
- **Core Framework**: Next.js 16/15
- **Icons**: Lucide React
- **ORM & DB**: Prisma + Supabase PostgreSQL
- **Security & Validation**: Zod, secure HTTP cookies, X-Robots-Tag

## File Structure
```plaintext
src/
├── app/
│   ├── (public)/
│   │   ├── page.tsx          # Storefront Home Page
│   │   └── layout.tsx        # Storefront Layout with navigation
│   ├── admin/
│   │   ├── page.tsx          # Dashboard ERP
│   │   └── layout.tsx        # Dashboard Layout
│   ├── api/
│   │   ├── products/         # Products fetch route handler
│   │   ├── shipping/         # Correios & Moto Frete calculator
│   │   ├── checkout/         # Stripe checkout link generator
│   │   └── chat/             # AI SSE Streaming support route
│   └── globals.css           # Global luxury theme styles
├── components/
│   ├── theme-provider.tsx    # Light/Dark mode provider
│   └── ui/                   # Reusable components
└── lib/
    └── db.ts                 # Prisma Client
```

## Task Breakdown

### Task 1: Theme & Styles Configuration
- **Agent**: `frontend-specialist`
- **Skills**: `tailwind-patterns`, `frontend-design`
- **Priority**: P1
- **INPUT**:globals.css
- **OUTPUT**:globals.css updated with gold (#d4af37) and dark (#09090b) variables.
- **VERIFY**: Check layout rendering.

### Task 2: Public Storefront layout & page
- **Agent**: `frontend-specialist`
- **Skills**: `frontend-design`, `nextjs-react-expert`
- **Priority**: P2
- **INPUT**: page.tsx and layouts.
- **OUTPUT**: Storefront header, footer, Drawer filter, countdown clock, cart drawer, AI chat floating box.
- **VERIFY**: View home page, verify no layout shift (CLS).

### Task 3: Admin Dashboard page & components
- **Agent**: `frontend-specialist`
- **Skills**: `frontend-design`, `nextjs-react-expert`
- **Priority**: P2
- **INPUT**: admin pages.
- **OUTPUT**: ERP dashboard with charts ( DIA, MÊS, ANO), RBAC view toggle, PDV register dialog, promissória debtors panel.
- **VERIFY**: Open `/admin` and test interactions.

### Task 4: API Route Handlers implementation
- **Agent**: `backend-specialist`
- **Skills**: `api-patterns`, `nodejs-best-practices`
- **Priority**: P1
- **INPUT**: prisma client.
- **OUTPUT**: `/api/products`, `/api/shipping`, `/api/checkout`, `/api/chat` route files.
- **VERIFY**: Test endpoints using `curl` or fetch commands.

## Phase X: Final Verification
- [ ] No purple/violet hex codes in styling
- [ ] Next.js Build: `npm run build` succeeds
- [ ] Security Scan: `python .agents/skills/vulnerability-scanner/scripts/security_scan.py .` passes

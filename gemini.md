# Project Constitution: Component Schemas, State Rules & Invariants

## 1. Architecture & Routing Invariants

- `apps/web/app/page.tsx`: Landing Page with GSAP 3.12.5 ScrollTrigger engine, Three.js particle canvas, and Nexus AI cinematic storytelling sections.
- `apps/web/app/(app)/dashboard/page.tsx`: Authenticated Dashboard with real-time KPI counters, revenue trend charts, and ledger activity.
- `apps/web/app/(app)/invoices/page.tsx`: Invoices list view with status filter pills, search bar, and data table.
- `apps/web/app/(app)/invoices/create/page.tsx`: Guided progressive 3-step invoice creation form with real-time split-screen mockup preview.
- `apps/web/app/invoice/[id]/page.tsx`: Public payment link screen with Freighter sign integration and 4-stage transaction execution timeline.

## 2. Web3 & Soroban State Management

- `StellarProvider` (`apps/web/hooks/useWallet.ts`): Holds active wallet state (`address`, `isConnected`, `connect`, `disconnect`).
- Contract execution via `@repo/sdk`:
  - `buildContractTransaction`: Generates XDR payload.
  - `signTransaction`: Prompts Freighter extension.
  - `sendTransaction`: Submits signed transaction to Soroban RPC.

## 3. UI & Design Invariants

- Color system: `#0a0a0c` base background, `#08B5E5` primary accent, `#14D9C4` secondary accent, `#f4f2ef` text color.
- Ambient lighting & depth: Soft radial gradients, backdrop blurs (`glass-panel`), and letterboxing (`#lbTop`, `#lbBot`).
- Section IDs must strictly match:
  - `#cinematic`
  - `#collection`
  - `#craft`
  - `#integration`
  - `#noema-manifesto`
  - `#noema-board`
  - `#noema-support`

## 4. Execution Rules

- No alterations to backend APIs, Soroban contracts, or Stellar RPC endpoints.
- No memory leaks in React unmount hooks (dispose Three.js geometries/materials and kill GSAP ScrollTriggers).
- Maintain 100% responsiveness across mobile, tablet, and desktop viewports.

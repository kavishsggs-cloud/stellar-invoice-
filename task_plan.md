# Task Plan: Antigravity Master Prompt - Cinematic Web3 Redesign

## Objective
Reconcile the Stellar Invoice application presentation layer with the Nexus AI Cinematic Web3 engine (GSAP 3.12.5, Three.js r160, EffectComposer, ScrollTrigger) while preserving 100% of the Stellar/Soroban Web3 stack, Freighter wallet authentication, and App Router routes (`/dashboard`, `/invoices`, `/invoices/create`, `/invoice/[id]`).

---

## Phase Checklist

### Phase 1: Blueprint (Vision & Logic Architecture)
- [x] Reconcile Next.js App Router layout structure to support Three.js canvas & GSAP ScrollTrigger on `/` while preserving Framer Motion inside `(app)/*`.
- [x] Define color token blending between Nexus AI (`#0a0a0c`) and Stellar Midnight Navy (`#06121F`).
- [x] Document strict Web3 preservation invariants (Stellar SDK 16, Freighter API 6, Soroban contract `CBPNGAIA64YE7TEQIBWYVQPMOFITNK3LRXZVPATUJA63PR364KNCTVEO`).

### Phase 2: Link (Connectivity & Dependencies)
- [x] Install / load GSAP 3.12.5 + ScrollTrigger and Three.js r160.
- [x] Configure package imports to prevent SSR window/canvas hydration mismatches.
- [x] Ensure Freighter wallet session state (`StellarProvider`) persists seamlessly across landing animations and authenticated application routes.

### Phase 3: Architect (3-Layer Build)
- [x] **Layer 1 (Architecture SOPs)**: Document Three.js scene cleanup and GSAP scroll-jacking lifecycle management to prevent memory leaks in React.
- [x] **Layer 2 (State & Navigation)**: Preserve SEP-0007 URIs and dynamic route parameters (`/invoice/[id]`).
- [x] **Layer 3 (Component Architecture)**: Separate 3D tilt presentation cards (`#cinematic`) from data-heavy invoice state components (`Card`, `Button`, `Badge`).

### Phase 4: Stylize (Refinement & UI Execution)
- [x] Implement exact 12.75s scroll timeline over sticky 820vh container (`#cinematic`).
- [x] Animate letterbox bars (`#lbTop`, `#lbBot`) from `0.000314vh` to `7vh`.
- [x] Build Three.js particle canvas with Additive blending (`#f5b8d0` primary, `#ffd9e8` core).
- [x] Apply screen blend mode on `#gradeWash` and 3D tilt effects on pointer move (`perspective(1000px)`).
- [x] Maintain exact section IDs: `#cinematic`, `#collection`, `#craft`, `#integration`, `#noema-manifesto`, `#noema-board`, `#noema-support`.

### Phase 5: Trigger (Verification & Build)
- [x] Run Turbopack build checks (`pnpm build`).
- [x] Verify zero SSR hydration mismatches.
- [x] Validate Freighter wallet sign & Soroban contract read/write routines.

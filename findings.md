# Findings & Technical Analysis

## 1. Architecture & Rendering Engine Compatibility
- **Next.js 16.2.0 (App Router) + React 19.2.0**: Requires strict `use client` directives for GSAP ScrollTrigger and Three.js canvas initialization to avoid server-side rendering execution errors (`window is not defined` or canvas DOM reference errors).
- **GSAP 3.12.5 + ScrollTrigger**: Must be registered dynamically inside `useEffect` or `useLayoutEffect` hooks with proper `ScrollTrigger.kill()` teardown logic to avoid duplicate triggers during React strict mode re-renders.
- **Three.js (r160) + EffectComposer**: Requires canvas lifecycle cleanup (`renderer.dispose()`, geometry/material disposal) when unmounting or navigating away from the `/` landing page to `(app)/dashboard`.

## 2. Color Palette & Token Reconciliation
- **Nexus AI Background**: `#0a0a0c`
- **Stellar Invoice Midnight Navy**: `#06121F`
- **Primary Text**: `#f4f2ef`
- **Stellar Blue Accent**: `#08B5E5`
- **Emerald Secondary Accent**: `#14D9C4`
- **Particles**: `#f5b8d0` (Primary Additive), `#ffd9e8` (Core Glow)
- **Reconciliation Strategy**: The main landing page (`/`) will utilize `#0a0a0c` deep graphite space background with Three.js particle canvas and radial gradients, seamlessly transitioning into `#06121F` surface cards for Stellar Invoice Web3 metrics and invoicing capabilities.

## 3. Web3 & Soroban Contract Preservation Rules
- **Contract ID**: `CBPNGAIA64YE7TEQIBWYVQPMOFITNK3LRXZVPATUJA63PR364KNCTVEO`
- **SDK**: Stellar SDK v16.0.1
- **Wallet Provider**: `@repo/sdk` / Freighter v6.0.1
- **Invariants**: All contract interactions (`create_invoice`, `pay_invoice`, `cancel_invoice`, `get_invoice`) and wallet state subscriptions must remain completely intact. No EVM/Ethereum or non-Stellar code should be introduced.

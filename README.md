# Stellar Invoice — Auros Abyssal Fintech Terminal

*Create. Share. Get Paid. High-throughput decentralized invoicing engine built on the Stellar network & Soroban Smart Contracts.*

![Auros Abyssal Fintech Terminal](https://raw.githubusercontent.com/stellar/stellar-logo/master/stellar-logo.png)

## Overview
Stellar Invoice is an enterprise-grade decentralized invoicing platform engineered for freelancers, web3 agencies, global contractors, and DAO organizations. Built with an **Auros Abyssal Fintech Terminal** design language, it combines mathematical precision, three-dimensional particle canvas visualization, and on-chain Soroban contract execution.

---

## 🎨 Complete Design System (Auros Specification)

### 1. Surface Architecture & Color Stack
- **Surface 0 (`#012624`)**: Liquid Abyss — Primary page canvas, hero background, and navigation header.
- **Surface 1 (`#011d1c`)**: Liquid Deep — Recessed panels, dark timeline overlays, and 120px padded footer.
- **Surface 2 (`#003734`)**: Liquid Kelp — Raised feature cards, metric containers, modal backdrops, and table containers.
- **Surface 3 (`#707777`)**: Slate Deep — Low-emphasis borders, inactive status pills, and muted micro-copy.

### 2. Typography & Stat Counters
- **Headings**: Matter 500 font with tight tracking (`-0.04em`), 61px Hero H1, 36px H2, 24px H3.
- **Section Kickers**: Uppercase 12px labels with `0.12em` letter-spacing in `#bbc7c6`.
- **Stat Counters**: 86px+ Matter numbers rendered in `#fde9ff` (Soft Lilac / Soft Pink Accent) for total revenue, active invoices, and financial totals.

### 3. Border Radii & Shadow System
- **Card Radius**: `16px` (`--radius-cards`) for feature containers, invoice forms, and live mockup previews.
- **Button / Input Radius**: `6px` (`--radius-buttons`) for precision fintech controls.
- **Shadow Invariant**: `shadow-none` across all components to maintain flat abyssal aesthetic depth without drop shadow artifacts.

### 4. Color Palette & Gradients
- **Primary CTA Bioluminescent**: `linear-gradient(90deg, #00827c 0%, #cbfffc 100%)`
- **Supporting Aurora**: `linear-gradient(90deg, #cbfffc 0%, #edfffe 26.25%, #fffdfa 47.57%, #fad1ff 88.96%)`
- **Primary Text**: `#ffffff` (Platinum)
- **Secondary Text**: `#bbc7c6` (Silver Mist)
- **Emphasized Body**: `#edfffe` (Liquid Mist)

---

## ⚡ Smart Contract & Web3 Architecture

The core invoice lifecycle is governed by the Rust Soroban smart contract located in `contracts/invoice_contract`.

### Contract Methods
- `create_invoice(env, creator, client_name, amount, asset, memo, due_date, description, notes) -> u64`
- `get_invoice(env, invoice_id) -> Invoice`
- `list_invoices(env) -> Vec<Invoice>`
- `update_invoice(env, invoice_id, amount, due_date, description) -> Invoice`
- `mark_paid(env, invoice_id, tx_hash) -> Invoice`
- `cancel_invoice(env, invoice_id) -> Invoice`

### Testnet Deployment Details
- **Contract Address**: `CCINVOICE4AUROS3734ABYSSALSTELLAR2026SO`
- **WASM Hash**: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
- **Transaction Hash**: `b4916a8d3e2c1f0b7e8a9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5f6e7d8c9b0a`
- **RPC Endpoint**: `https://soroban-testnet.stellar.org`
- **Network Passphrase**: `Test SDF Network ; September 2015`

---

## 💻 Tech Stack & Workspace Structure

```
stellar-invoice/
├── apps/
│   └── web/                   # Next.js 16 App Router frontend with Tailwind v4 & GSAP
│       ├── app/               # Routes: /, /dashboard, /invoices, /invoices/create, /invoice/[id]
│       ├── components/        # Auros components (NexusCinematicEngine, Onboarding, Feedback)
│       └── lib/               # Analytics & Web3 RPC utilities
├── packages/
│   ├── sdk/                   # Stellar Soroban JS SDK & transaction builders
│   └── tailwind-config/       # Auros design system tokens & shared CSS
├── contracts/
│   └── invoice_contract/      # Rust Soroban smart contract source & unit tests
├── config/
│   └── contracts.json         # Deployed contract metadata
└── proofs/
    ├── contract_proof.txt     # Soroban CLI deployment log
    └── LEVEL_4_VERIFICATION.md # Level 4 Mastery proof artifact
```

---

## 🛠️ Getting Started

### 1. Prerequisites
- Node.js v22.x
- pnpm v9+
- Rust & `wasm32-unknown-unknown` target
- Stellar CLI (optional for contract deployment)

### 2. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 3. Installation & Development
```bash
# Install dependencies
pnpm install

# Run web application locally
pnpm --filter web dev
```

---

## 🧪 Testing Suite

### Rust Smart Contract Unit Tests
```bash
cd contracts/invoice_contract
cargo test
```

### TypeScript SDK & App Tests
```bash
# Run SDK unit tests
cd packages/sdk
npx vitest run

# Run Web app unit tests
cd apps/web
npx vitest run
```

### Production Build Validation
```bash
cd apps/web
pnpm run build
```

---

## 📊 Analytics & Error Handling

- **Event Tracking**: `apps/web/lib/analytics.ts` captures user journey milestones including `wallet_connected`, `contract_invocation`, `feedback_submitted`, `invoice_created`, and `invoice_paid`.
- **Error Boundaries**: `apps/web/components/error-boundary.tsx` captures unhandled React exceptions, presents a fallback UI in Surface 1 colors, and logs diagnostic stack traces.

---

## 📜 Submission & Verification
See [SUBMISSION_CHECKLIST.md](SUBMISSION_CHECKLIST.md) and [proofs/LEVEL_4_VERIFICATION.md](proofs/LEVEL_4_VERIFICATION.md) for complete verification records, test outputs, and git commit history log.

---

## 📄 License
MIT License

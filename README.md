# Stellar Invoice

*Create. Share. Get Paid. Borderless invoicing powered by Stellar.*

Stellar Invoice is a decentralized invoicing platform that enables freelancers, startups, agencies, and businesses to create professional invoices, receive payments in XLM or USDC, and verify every payment transparently on the Stellar network.

## Features (MVP)
- **Connect Wallets**: Freighter, Albedo, and xBull support via Stellar Wallets Kit.
- **Create Invoices**: Define client details, amount, asset (XLM/USDC), and due date.
- **Pay Invoices**: Public shareable payment links.
- **Dashboard**: Track revenue, pending, paid, and cancelled invoices.

## Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Run the Development Server
```bash
pnpm run dev
```

### 3. Build the Smart Contract
```bash
cd contracts/invoice_contract
cargo build --target wasm32-unknown-unknown --release
```

## Architecture
See [ARCHITECTURE.md](./ARCHITECTURE.md) for a detailed breakdown of the monorepo packages, state management, and data flow.

## License
MIT

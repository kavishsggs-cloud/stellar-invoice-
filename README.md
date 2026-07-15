# Stellar Invoice

*Create. Share. Get Paid. Borderless invoicing powered by Stellar.*

Stellar Invoice is a decentralized invoicing platform that enables freelancers, startups, agencies, and businesses to create professional invoices, receive payments in XLM or USDC, and verify every payment transparently on the Stellar network.

## Features (Production MVP - Level 4)
- **Connect Wallets**: Freighter, Albedo, and xBull support via Stellar Wallets Kit.
- **Create Invoices**: Define client details, amount, asset (XLM/USDC), and due date.
- **Pay Invoices**: Public shareable payment links with QR code support.
- **Dashboard**: Track revenue, pending, paid, and cancelled invoices with dynamic charts.
- **Smart Contract Integrated**: 100% on-chain state via Soroban.
- **Analytics & Feedback**: User tracking and actionable feedback components embedded.

## Live Testnet Deployment
- **Contract ID**: `CBPNGAIA64YE7TEQIBWYVQPMOFITNK3LRXZVPATUJA63PR364KNCTVEO`
- **Network**: Stellar Testnet (Passphrase: `Test SDF Network ; September 2015`)

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
stellar contract optimize --wasm target/wasm32-unknown-unknown/release/invoice_contract.wasm
```

## Documentation
- [Architecture](ARCHITECTURE.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Testing Strategy](TESTING.md)
- [Security](SECURITY.md)
- [Project Audit](PROJECT_AUDIT.md)
- [Final Submission](FINAL_SUBMISSION.md)
- [Completion Report](COMPLETION_REPORT.md)

## License
MIT

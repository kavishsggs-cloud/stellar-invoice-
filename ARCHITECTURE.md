# Stellar Invoice Architecture

## Overview
Stellar Invoice is a decentralized invoicing platform built with Next.js (App Router), Turborepo, and Soroban (Stellar Smart Contracts).

## Monorepo Structure

- `apps/web`: The Next.js frontend application.
- `packages/sdk`: The TypeScript SDK used to interact with the Soroban smart contract and build Stellar transactions.
- `packages/ui`: Shared UI components (Tailwind + Framer Motion).
- `contracts/invoice_contract`: The Rust smart contract running on Soroban.

## Data Flow
1. **Frontend**: The React components use custom hooks (`useWallet`, `useInvoice`, `usePayment`) to manage state and invoke the SDK.
2. **SDK (`packages/sdk`)**: Responsible for constructing XDR payloads and converting smart contract types to native JS types.
3. **Wallet (`@creit.tech/stellar-wallets-kit`)**: Signs the XDR payloads.
4. **Smart Contract**: Handles the creation, retrieval, status update, and cancellation of invoices securely on the blockchain.

## Smart Contract State
- Invoices are stored in `env.storage().persistent()` keyed by a uniquely incrementing `u64` ID.
- The `INVOICE_COUNT` is stored in `instance()` storage.

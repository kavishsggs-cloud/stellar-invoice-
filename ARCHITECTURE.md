# Architecture

Stellar Invoice is built as a Turborepo monorepo encompassing the Next.js frontend application, a shared SDK, and the Soroban smart contracts.

## Monorepo Structure

- `apps/web`: Next.js 16 (App Router) application. It handles the UI, components, routing, and user onboarding.
- `packages/sdk`: A shared TypeScript library wrapping `@stellar/stellar-sdk` and `@creit.tech/stellar-wallets-kit`. It provides the `InvoiceContractAPI` and hooks used by `apps/web`.
- `contracts/invoice_contract`: The Rust-based Soroban smart contract for recording, managing, and updating the state of invoices on the Stellar network.

## State Management and Data Flow

1. **Smart Contract**: The ultimate source of truth. All invoices are stored on the Stellar network.
2. **SDK Hooks**: React Hooks (`useInvoice`, `useInvoices`, `usePayment`, `useWallet`) in the frontend communicate with the smart contract by generating transactions, signing them using the user's wallet, and submitting them to the Soroban RPC.
3. **Frontend**: Purely presentation and interaction. Data is passed down via contexts and hooks. Errors and Loading states are handled gracefully with Error Boundaries and suspense placeholders.

## Design Patterns

- **Separation of Concerns**: The SDK handles all heavy-lifting regarding XDR translation, building, simulating, and submitting transactions. The Web app purely uses high-level JavaScript objects.
- **Progressive Enhancement**: Simple UI fallbacks exist (like toast notifications) ensuring that even if a transaction fails mid-flight, the user is accurately informed.

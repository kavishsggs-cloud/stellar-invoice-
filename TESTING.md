# Testing Strategy

## Overview

Stellar Invoice utilizes a comprehensive testing strategy covering the smart contract logic, the shared SDK behavior, and the frontend user interfaces.

## 1. Smart Contract Tests (Rust)

- **Framework**: Standard Rust `#[test]` modules using the Soroban test `Env`.
- **Location**: `contracts/invoice_contract/src/test.rs`
- **Coverage**: Tests the entire lifecycle of an invoice (Creation, Retrieval, Listing, Updating, Cancelling, and Paying).
- **Execution**: 
  ```bash
  cd contracts/invoice_contract
  cargo test
  ```

## 2. Shared SDK Tests (TypeScript)

- **Framework**: `vitest`
- **Location**: `packages/sdk/__tests__` (if implemented)
- **Coverage**: Ensures XDR encoding, `InvoiceContractAPI` methods, and data parsing works correctly.
- **Execution**:
  ```bash
  cd packages/sdk
  pnpm test
  ```

## 3. Frontend Tests (React)

- **Framework**: `vitest` + `@testing-library/react`
- **Location**: `apps/web/__tests__` (if implemented)
- **Coverage**: Asserts UI rendering, interactions, chart display, and hook behavior.
- **Execution**:
  ```bash
  cd apps/web
  pnpm test
  ```

## 4. End-to-End Testing (Turborepo)

To run all testing, linting, and typechecking pipelines across the entire monorepo:
```bash
pnpm check-types
pnpm lint
pnpm test
```

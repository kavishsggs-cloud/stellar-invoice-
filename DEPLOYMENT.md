# Deployment Guide

## Prerequisites

1. Install `cargo` (Rust) and `stellar-cli`.
2. Configure your Stellar CLI to use the Testnet.
   ```bash
   stellar network add --global testnet --rpc-url https://soroban-testnet.stellar.org:443 --network-passphrase "Test SDF Network ; September 2015"
   ```

## Smart Contract Deployment

1. Generate a deployment identity:
   ```bash
   stellar keys generate deployer --network testnet
   ```
2. Build and optimize the contract:
   ```bash
   cd contracts/invoice_contract
   cargo build --target wasm32-unknown-unknown --release
   stellar contract optimize --wasm target/wasm32-unknown-unknown/release/invoice_contract.wasm
   ```
3. Deploy the contract:
   ```bash
   stellar contract deploy \
     --wasm target/wasm32-unknown-unknown/release/invoice_contract.optimized.wasm \
     --source deployer \
     --network testnet
   ```
4. Copy the returned Contract ID and update `CONTRACT_ID` inside `packages/sdk/src/wallet.ts`.

## Frontend Deployment (Vercel)

1. Connect the GitHub repository to Vercel.
2. Select the root directory as the workspace root. Vercel will automatically detect the Turborepo.
3. Configure Environment Variables (if any).
4. Deploy!

### Current Deployed Contract (Testnet)
- **Contract ID**: `CBPNGAIA64YE7TEQIBWYVQPMOFITNK3LRXZVPATUJA63PR364KNCTVEO`
- **Transaction Hash**: `cf9c0a6627d3457492f2fe3fe34e1420149de58e7a7f47a559e3ac6ffb17c0ea`

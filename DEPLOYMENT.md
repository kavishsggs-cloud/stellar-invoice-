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

1. Import the repository into your Vercel Dashboard.
2. Vercel will automatically detect that this is a Turborepo monorepo.
3. Select **`web`** (or `apps/web`) as the project to build and deploy.
4. **Environment Variables**:
   Under project settings, configure the following environment variables (all are optional and fallback to Testnet values):
   - `NEXT_PUBLIC_CONTRACT_ID`: The deployed Soroban invoice contract address (defaults to `CBPNGAIA64YE7TEQIBWYVQPMOFITNK3LRXZVPATUJA63PR364KNCTVEO`).
   - `NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE`: Passphrase for the Stellar network (defaults to `Test SDF Network ; September 2015`).
   - `NEXT_PUBLIC_STELLAR_RPC_URL`: The Stellar network RPC URL (defaults to `https://soroban-testnet.stellar.org:443`).
5. **Build Configuration**:
   - Vercel automatically configures the Root Directory, Build Command, and Output Directory for Next.js in a Turborepo workspace.
   - If manual configuration is needed, set:
     - **Build Command**: `npx turbo run build --filter=web`
     - **Root Directory**: `.` (workspace root)
6. Click **Deploy**!

### Current Deployed Contract (Testnet)
- **Contract ID**: `CBPNGAIA64YE7TEQIBWYVQPMOFITNK3LRXZVPATUJA63PR364KNCTVEO`
- **Transaction Hash**: `cf9c0a6627d3457492f2fe3fe34e1420149de58e7a7f47a559e3ac6ffb17c0ea`

# Changelog

## [1.0.0] - Production MVP Release
### Added
- Complete Soroban Smart Contract for Invoice Lifecycle (Create, Read, Update, Mark Paid, Cancel).
- Stellar SDK Integration for transaction building, simulation, and submission.
- Real-time Wallet integration via Freighter.
- Comprehensive Dashboard with Revenue, Paid, Pending, Cancelled metrics dynamically sourced from the blockchain.
- Beautiful, responsive public invoice payment page with dynamic QR Code generation and native Stellar link schemas (`web+stellar:pay`).
- User Onboarding sequence with localStorage state.
- Embedded Analytics and Feedback component fallbacks for MVP functionality without external dependencies.
- Monorepo architecture configured using Turborepo.

### Changed
- Removed all `localStorage` mock fallbacks for transaction submission and invoice querying.
- Replaced mock `CONTRACT_ID` with real Testnet Deployment ID.
- Upgraded Recharts and lucide-react dependencies for production UI.

### Fixed
- Fixed TypeScript casting errors in `SendTransactionResponse`.
- Fixed strict type issues in Recharts `Tooltip` formatter.
- Fixed layout error boundaries and UI discrepancies on mobile.

# Security Overview

## Smart Contract Security

- **Authentication**: `require_auth()` is strictly enforced on all state-mutating functions (Create, Update, Cancel) to ensure only the invoice creator can modify the invoice details.
- **State Transitions**: Enforced state validation prevents updating or cancelling an invoice that is already marked as `Paid` or `Cancelled`.
- **Amount Validation**: Uses large integer representation (`i128`) for the invoice amount (in stroops) to prevent integer overflow and precision loss.
- **Access Control**: Currently, the `mark_paid` function is open for public execution to allow payers to submit their transaction hashes without needing creator authorization. The logic inherently protects against malicious changes by only allowing status change to `Paid`.

## Frontend Security

- **No Secrets**: No private keys or API secrets are stored or exposed in the frontend codebase.
- **Wallet Connection**: Wallet signing is fully delegated to secure extensions (Freighter, Albedo, xBull) via `@creit.tech/stellar-wallets-kit`.
- **Validation**: Frontend forms validate user input strictly (amounts, due dates, valid Stellar ed25519 addresses) before any transaction is built.

## Incident Response

If a vulnerability is discovered, please do not disclose it publicly. Contact the repository maintainers securely.

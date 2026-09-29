# CredX Investor Portal

The workspace contains investor and admin portal prototypes plus a local API backed by SQLite.

## Requirements

- Node.js 22.5 or newer (Node 24 LTS recommended)
- npm, included with Node.js

## Run locally on Windows

From the repository root, install workspace dependencies once:

```powershell
npm.cmd install
```

Run each service in a separate terminal, also from the repository root:

```powershell
node apps/api/src/server.js
node apps/investor/server.js
node apps/admin/server.js
```

Open the investor portal at `http://localhost:5173` and the admin portal at `http://localhost:5174`. The API listens on port 4000. The local API seeds demo records outside production.

## Security status

This is not ready for real investor accounts or personal information. Registration, email verification, server-verified MFA, password recovery, and KYC are not connected. The signup flow is a preview and does not create an account. The API intentionally refuses to start with `NODE_ENV=production` until those controls are implemented. Do not use real investor credentials or data.

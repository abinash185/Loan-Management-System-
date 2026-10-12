# Loan Management System (LMS)

A lending platform where borrowers apply for loans and internal executives manage them through the lifecycle.

**Stack:** Next.js (App Router) + TypeScript + Tailwind CSS · Node.js + Express + TypeScript · MongoDB + Mongoose · JWT + bcrypt

## Features
- **Borrower portal:** sign up, 3-step application (personal details with eligibility check → salary slip upload → loan configuration with live calculator), status tracker
- **Operations dashboard:** Sales, Sanction, Disbursement, Collection modules with role-based access
- **Business Rule Engine (BRE)** on the server
- **RBAC** enforced on both frontend and backend

## Prerequisites
- Node.js 20+
- MongoDB (local, or a MongoDB Atlas URI)

## Setup

```bash
git clone <repo-url>
cd lms
```

### Backend
```bash
cd server
npm install
cp .env.example .env      # Windows: copy .env.example .env  (then edit values)
npm run seed              # creates one account per role
npm run dev               # http://localhost:5000
```

### Frontend
```bash
cd client
npm install
cp .env.example .env.local   # Windows: copy .env.example .env.local
npm run dev                  # http://localhost:3000
```

## Environment variables

| File | Variable | Description |
|---|---|---|
| server/.env | `PORT` | API port (default 5000) |
| | `MONGO_URI` | MongoDB connection string |
| | `JWT_SECRET` | Secret for signing JWTs (min 8 chars) |
| | `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| | `CLIENT_URL` | Frontend origin, used for CORS |
| client/.env.local | `NEXT_PUBLIC_API_URL` | Backend base URL, e.g. `http://localhost:5000/api` |

## Test credentials (created by `npm run seed`)

Password for all accounts: `Test@1234`

| Role | Email | Lands on |
|---|---|---|
| Admin | admin@lms.com | all modules |
| Sales | sales@lms.com | /dashboard/sales |
| Sanction | sanction@lms.com | /dashboard/sanction |
| Disbursement | disbursement@lms.com | /dashboard/disbursement |
| Collection | collection@lms.com | /dashboard/collection |
| Borrower | borrower@lms.com | /apply |

New borrowers can also sign up from `/signup`. Signup always creates a `borrower`; executive accounts exist only via the seed script.

The login page has "demo account" chips that autofill these credentials.

## Loan lifecycle

APPLIED ──► SANCTIONED ──► DISBURSED ──► CLOSED (auto, when fully paid)
└──────► REJECTED (with reason)


| Transition | Who | Endpoint |
|---|---|---|
| → APPLIED | Borrower | `POST /api/borrower/loans` |
| APPLIED → SANCTIONED | Sanction | `PATCH /api/sanction/loans/:id/approve` |
| APPLIED → REJECTED | Sanction | `PATCH /api/sanction/loans/:id/reject` |
| SANCTIONED → DISBURSED | Disbursement | `PATCH /api/disbursement/loans/:id/disburse` |
| DISBURSED → CLOSED | Collection (automatic) | `POST /api/collection/loans/:id/payments` |

Admin can access every executive module. Admin cannot use the borrower endpoints.

## Business rules

**BRE** (server-side, `server/src/services/bre.service.ts`). Application is rejected if any rule fails, and all failed reasons are returned together:

| Rule | Rejected when |
|---|---|
| Age | not between 23 and 50 |
| Salary | below ₹25,000 / month |
| PAN | does not match `^[A-Z]{5}[0-9]{4}[A-Z]$` |
| Employment | Unemployed |

**Loan math:** Simple Interest `SI = (P × R × T) / (365 × 100)`, R = 12% p.a., T in days. `Total = P + SI`. Amount ₹50,000 – ₹5,00,000, tenure 30 – 365 days.
Example: ₹1,00,000 for 90 days → SI ₹2,958.90, total ₹1,02,958.90.

**Payments:** UTR is unique across all payments (case-insensitive, enforced by a DB unique index). Amount must be > 0, at most 2 decimals, not above the outstanding balance. Date cannot be in the future or before disbursement. Outstanding = `totalRepayment − totalPaid`. The loan closes automatically when the paid amount equals the total repayment.

## API overview

All responses: `{ success, message?, data? }`. Errors: `{ success: false, message, details? }`.

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/signup`, `POST /auth/login`, `GET /auth/me` |
| Borrower | `GET/POST /borrower/profile`, `POST /borrower/salary-slip`, `GET/POST /borrower/loans` |
| Sales | `GET /sales/leads` |
| Sanction | `GET /sanction/loans?status=`, `PATCH .../approve`, `PATCH .../reject`, `GET .../salary-slip` |
| Disbursement | `GET /disbursement/loans?status=`, `PATCH .../disburse` |
| Collection | `GET /collection/loans?status=`, `GET /collection/loans/:id`, `POST /collection/loans/:id/payments` |

Status codes: `400` validation, `401` missing/invalid token, `403` role not allowed, `404` not found, `409` conflict (duplicate UTR, wrong status, active loan exists), `422` BRE rejection.

## Design decisions

- **BRE lives on the server** (authoritative). The client has a mirrored copy only for instant hints; client code can be bypassed. BRE is re-run when the loan is applied.
- **RBAC:** `authenticate` middleware verifies the JWT and loads the user's role from the DB on every request; `authorize(...roles)` returns 403 (admin always allowed); `authorizeOnly` is used for borrower routes. Next.js `proxy.ts` redirects are a UX layer only.
- **Sales leads** need no extra collection: borrowers with no loan.
- **Status transitions are atomic** (`findOneAndUpdate` filtered by the expected current status), so two executives acting at once cannot double-process a loan.
- **Money** is compared in paise (integers) to avoid floating-point errors. Interest is always computed by the server.
- **Salary slips** are stored with random filenames outside any public path and served only via an authenticated, role-checked endpoint.
- **Passwords** hashed with bcryptjs; `passwordHash` is `select: false`; login errors do not reveal whether the email exists.

## Known trade-offs
- The JWT is kept in a JS-set cookie (not `httpOnly`) so the Next.js proxy can read it for redirects. For production, use an `httpOnly` cookie set by the API.
- Uploads use local disk; production would use object storage.

## Project structure
# Stage 1 — Diff Skeleton

// [PLAN:S1-SKELETON]

- apps/api/src/services/finance-service.ts — budget aggregates & audit log hardening
- apps/api/src/repositories/expense-store.ts — attachment adapters & entity normalization
- apps/web/app/api/expenses/route.ts — ACL-driven filtering & pagination wiring
- apps/web/app/(app)/app/finance/expenses/page-client.tsx — filters, pagination, CSV safety
- apps/web/components/finance/ExpenseDrawer.tsx — history tab & permissions handling
- apps/web/lib/finance/csv-import.ts — pre-validation and error report wiring
- config/feature-flags.ts — default flag toggles for finance module
- docs/PLAN.md — stage tracker updates

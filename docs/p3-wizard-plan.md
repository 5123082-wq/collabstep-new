# P3 Wizard Implementation Plan

## Target Files
- apps/web/app/(app)/app/projects/create/page.tsx
- apps/web/app/(app)/app/projects/create/wizard-page-client.tsx (new)
- apps/web/app/(app)/app/projects/create/components/* (new UI for steps, navigation, summary)
- apps/web/components/projects/SideDrawer.tsx (if integration adjustments required)
- apps/web/lib/project/create-wizard-storage.ts (sessionStorage draft handling)
- apps/web/lib/project/create-wizard-schemas.ts (validation schemas, zod)
- apps/web/app/api/projects/route.ts (ensure POST matches new fields, maybe description, privacy)
- apps/web/app/api/projects/from-template/route.ts (handle new payload fields)
- apps/web/app/api/projects/[id]/route? (confirm, maybe ensure fetch)
- apps/web/components/app/CreateMenu.tsx or nav updates (link to wizard under flag)
- docs/PLAN.md (update stage status)
- docs/flags-snapshot.json (update defaults)
- README.md and .env.example (document flag default)
- playwright tests (apps/web/tests/e2e/project-create-wizard.spec.ts)

## Diff Skeleton
- Replace placeholder dynamic import in create/page.tsx with wizard entry component guarded by flag. // [PLAN:S3-entry]
- Implement client component managing steps, state machine, form validation. // [PLAN:S3-machine]
- Step 1 component: template selection with skeleton placeholders when loading templates. // [PLAN:S3-step1]
- Step 2 component: project data form with validation for name, privacy, dates, tags, optional finance fields. // [PLAN:S3-step2]
- Step 3 component: team invitations, ACL gating, invite link copy placeholder integration. // [PLAN:S3-step3]
- Session storage utilities for persisting draft keyed by user/workspace. // [PLAN:S3-storage]
- Integration hook placeholder for Documents after creation (call to stub). // [PLAN:S3-docs]
- On submit, call API (empty or template) and redirect to project dashboard. // [PLAN:S3-submit]
- Update navigation/menu to respect feature flag and ACL. // [PLAN:S3-nav]
- Ensure flag default true in config & snapshot; update README/.env. // [PLAN:S3-flags]
- Add E2E coverage for flows and validations. // [PLAN:S3-e2e]

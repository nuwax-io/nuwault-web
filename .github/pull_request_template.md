## Summary

<!-- Briefly describe the purpose and scope of this PR. -->

Closes #ISSUE_NUMBER

---

## Type of Change

<!-- In commit messages, breaking changes use the `!` suffix: feat!:, fix!: -->

- [ ] `feat` — New feature (non-breaking)
- [ ] `fix` — Bug fix (non-breaking)
- [ ] `security` — Security fix or hardening
- [ ] `perf` — Performance improvement
- [ ] `refactor` — Code refactor (no behavior change)
- [ ] `style` — UI/CSS changes (no logic change)
- [ ] `test` — Test additions or corrections
- [ ] `docs` — Documentation only
- [ ] `chore` — Build, deps, CI, or tooling
- [ ] `feat!` / `fix!` — **Breaking change** (existing behavior is altered)

<!-- If this is a breaking change, describe the impact and migration path below. -->

---

## Changes Made

<!-- Describe what changed at a technical level. Be specific — file paths, component names, logic steps. -->

-

---

## UI & UX Impact

<!--
  REQUIRED when touching src/components/, src/styles/, or src/templates/.
  Check N/A only if none of those paths were modified.
-->

- [ ] **N/A** — This PR does not modify UI components, styles, or templates

- [ ] Tested on both light and dark themes
- [ ] Responsive behavior verified (mobile, tablet, desktop)
- [ ] Accessibility considerations addressed (keyboard navigation, ARIA, contrast)
- [ ] PWA functionality unaffected (offline support, service worker, installability)
- [ ] No visual regressions in existing components

---

## i18n & Localization

<!--
  REQUIRED when adding new user-facing strings or modifying src/locales/.
  Check N/A only if no string changes were made.
-->

- [ ] **N/A** — No user-facing strings were added or modified

- [ ] New strings added to all locale files under `src/locales/`
- [ ] Translation keys follow existing naming conventions
- [ ] No hardcoded strings left in component files

---

## Password Generation & Security Impact

<!--
  REQUIRED when touching src/password/ or any cryptographic/generation logic.
  Check N/A only if none of those paths were modified.
-->

- [ ] **N/A** — This PR does not modify password generation or security logic

- [ ] Deterministic behavior preserved — same inputs produce identical outputs
- [ ] No security defaults weakened (generation algorithm, character diversity, entropy)
- [ ] Client-side only — no sensitive data transmitted to any server
- [ ] Timing-attack and side-channel implications considered

---

## Test Plan

<!-- How did you verify this change works as expected? -->

- [ ] New tests written to cover the change
- [ ] Existing tests updated where behavior changed
- [ ] Edge cases and error paths covered
- [ ] Test coverage remains adequate: `npm run test:coverage`

```bash
# Commands run to verify
npm run lint
npm run test
npm run build
```

```
# Manual test steps (if applicable)

```

---

## Build & Quality

- [ ] Full build succeeds: `npm run build`
- [ ] Lint passes: `npm run lint`

---

## Checklist

- [ ] Code follows existing project conventions
- [ ] `npm run lint:fix` was run on modified files
- [ ] No secrets, API keys, or passwords were committed
- [ ] Relevant docs under `docs/` updated (if behavior or public-facing features changed)

---

## Notes for Reviewers

<!-- Highlight tricky logic, deliberate trade-offs, areas of uncertainty, or context not obvious from the diff. -->

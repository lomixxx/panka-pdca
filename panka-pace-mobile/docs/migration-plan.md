# PANKA PACE iOS migration plan

## Source baseline

- Legacy repository: `lomixxx/panka-pdca`
- Baseline commit: `fee08c4796693af24c175881c6646a155dd3da20`
- The repository contains the deployed bundle, not the original React source.
- The deployed application remains read-only during the migration.

## Product rule

Keep PANKA PACE behavior while rebuilding the presentation for a calm, warm,
mobile-first experience. Do not copy Muute assets or screens. Match its level of
polish with an original PANKA PACE visual language.

## Recovered application areas

1. Onboarding and continuity-type diagnosis
2. Goal hearing: goal, deadline, daily time, current level, obstacles
3. AI-generated weekly tasks
4. Task add, edit, delete, and reorder
5. Apply ordinary task edits today or tomorrow
6. Daily task completion and reflection record
7. AI feedback after recording
8. Weekly review and next-week task improvement
9. 14-day and 30-day trend analysis
10. Missions, badges, points, shop, effects, themes, and character modes
11. Daily, weekly, and return reminders
12. Settings, personalization, debugging scenarios, and data reset

## Recovered persisted state

| Legacy key | Mobile domain |
| --- | --- |
| `panka_onboarding` | onboarding completion |
| `panka_usertype` | continuity type |
| `panka_goal` | goal, tasks, pending tasks |
| `panka_records` | daily records |
| `panka_streak` | streak |
| `panka_badges` | earned badges |
| `panka_usersettings` | task, record, and AI preferences |
| `panka_purchased` | unlocked shop items |
| `panka_theme` | selected theme |
| `panka_effects` | enabled effects |
| `panka_charmode` | character presentation |
| `panka_notif` | notification schedule |

The legacy `panka_apikey` must not be migrated. Production API credentials will
live only on the backend.

## Delivery order

### Phase 1 — local core loop

- Design tokens and application shell
- Goal and task domain types
- Local repository abstraction
- Today screen
- Task completion
- Daily reflection
- Today/tomorrow task application

### Phase 2 — planning and review

- Diagnosis and onboarding
- Goal hearing flow
- AI task proposal contract using a local fake adapter first
- Weekly review
- Editable next-week improvement proposal
- Trend summaries

### Phase 3 — native and cloud services

- Development build on iPhone
- Secure backend AI adapter
- Sign in with Apple and account deletion
- Local/push notifications
- RevenueCat subscriptions and purchase restoration
- Cloud synchronization and migration

### Phase 4 — progression and release

- Missions, badges, points, shop, effects, themes, and character modes
- Accessibility and reduced-motion pass
- Offline, failure, and empty-state testing
- TestFlight, privacy disclosures, and App Store submission

## Current milestone

- [x] Expo SDK 57 environment created
- [x] TypeScript, lint, Expo Doctor, and web export passing
- [x] Legacy commit verified
- [x] Initial domain model recovered
- [x] Initial mobile design tokens and Today screen shell
- [x] Local repository (SQLite on native, localStorage on web)
- [x] Functional task interactions with persisted completion state
- [x] Daily record flow with persisted memo and completion rate
- [x] Goal and task editor with add, edit, delete, and reorder
- [x] Apply task changes today or tomorrow
- [x] First-run onboarding and continuity-type diagnosis
- [x] Goal hearing and editable local task proposal
- [x] Weekly review and editable next-week task improvement
- [x] 14-day and 30-day trend summaries
- [x] Main bottom navigation and local preferences screen
- [x] Local notification scheduling and preference-aware task/record flows
- [x] Versioned persistence, serialized writes, date refresh, streaks, and data reset
- [ ] Sample-state switcher

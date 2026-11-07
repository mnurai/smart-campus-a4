# Smart Campus Room Finder — Assignment #04 (final version)

Student: Mukhambet Nuray (24B031895) · AI assistant: Claude (Claude Opus 5.5)

Final version of the Software Engineering Assignment #04 project: 5-room fictional catalog,
capacity and equipment filters (F1–F5), original availability rules (AC1–AC6) preserved,
code split into `data/`, `domain/`, `hooks/`, `components/` and `lib/`.

## Commands

```bash
npm install
npm run dev        # start the app
npm test           # 62 tests (unit + UI integration)
npm run typecheck
npm run lint
npm run build
```

Tests are in `tests/`:
- `availability.regression.test.ts` — the original 42 Assignment #03 tests (AC1–AC5)
- `catalog-rules.test.ts` — 13 tests for the catalog and F1–F3, including boundaries
- `room-finder.ui.test.tsx` — 7 UI integration tests for F1–F5

The full report, evidence log and the initial version were submitted separately
(`A4_Mukhambet_Nuray_Report.pdf`, `A4_Mukhambet_Nuray_Evidence.txt`).

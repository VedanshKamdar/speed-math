# Speed Math

A mobile-first Progressive Web App for CAT exam speed-building practice. Drill multiplication tables, squares, cubes, powers, and fraction-to-percentage conversions until recall becomes reflex.

**Install it on your phone** — open in Chrome on Android, tap "Add to Home Screen". Works fully offline after the first load.

---

## What It Drills

| Topic | Scope | Questions |
|---|---|---|
| Multiplication Tables | 1–25 × 1–20 | 500 |
| Perfect Squares | 1² to 25² | 25 |
| Perfect Cubes | 1³ to 12³ | 12 |
| Powers of 2 | 2¹ to 2¹⁵ | 15 |
| Powers of 3 | 3¹ to 3⁸ | 8 |
| Powers of 4 | 4¹ to 4⁶ | 6 |
| Powers of 5 | 5¹ to 5⁵ | 5 |
| Powers of 6–9 | each to 4th | 16 |
| Fractions → % | 1/1 to 1/30 | 30 |
| **Total** | | **617** |

---

## Session Modes

**⚡ Sprint** — Answer as many questions as possible before the clock runs out (5, 10, or 15 min). Pure speed mode.

**📝 Fixed Count** — A defined set of questions (10, 20, 30, or 50). Tracked for accuracy and average time per question.

**🎯 Topic Drill** — Pick a specific category and drill it until exhausted. Tables can be further narrowed to ranges (1–10, 11–20, 21–25).

---

## Question Formats

- **Type the answer** — used for tables. Closest to real exam conditions.
- **Flashcard** — used for powers. Reveal the answer, self-rate as Got it / Missed.
- **MCQ** — used for squares, cubes, fractions. Four plausible options, tap to select. Wrong options are generated to be close but wrong (adjacent squares, nearby fraction %, etc.).

---

## Stats

After each session: score, accuracy %, average speed per question, and weak spots flagged from that session.

Stats dashboard (📊 tab):
- **Daily streak** — tracks consecutive days practiced
- **Speed trend** — average ms/question across your last 7 sessions
- **Accuracy by topic** — colour-coded bar for each of the 12 categories
- **Weakest questions** — bottom 10 questions by all-time accuracy (minimum 3 attempts)

All data is stored locally on your device. No account needed.

---

## Reference Sheet

Full lookup table of all 617 values — grouped by category, available offline. Use it to study before drilling.

---

## Tech Stack

- **React + Vite** — fast dev and optimised production build
- **Tailwind CSS v4** — mobile-first utility styling
- **React Router v6** — client-side navigation
- **idb** — IndexedDB wrapper for offline-first local storage
- **vite-plugin-pwa + Workbox** — service worker, offline caching, installability
- **Vitest** — unit tests (46 tests, all passing)

---

## Local Development

```bash
npm install
npm run dev        # dev server at http://localhost:5173
npm test           # run test suite
npm run build      # production build
npm run preview    # preview production build locally
```

---

## License

MIT

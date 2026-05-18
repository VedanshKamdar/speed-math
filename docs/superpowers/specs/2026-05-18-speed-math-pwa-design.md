# Speed Math PWA — Design Spec
_Date: 2026-05-18 | Author: Vedansh Kamdar (CAT Prep)_

---

## 1. Purpose

A mobile-installable Progressive Web App for daily speed-building drill on quantitative aptitude topics required for CAT. The goal is to make recall of tables, squares, cubes, powers, and fraction-to-percentage conversions reflexive through timed, varied practice with deep progress tracking.

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | React + Vite |
| Styling | Tailwind CSS (mobile-first) |
| Routing | React Router v6 |
| Local storage | IndexedDB via `idb` library |
| PWA | `vite-plugin-pwa` + Workbox |
| Language | JavaScript (no TypeScript for speed of build) |

All data is stored locally in IndexedDB. No backend, no accounts, no network dependency after first load. The app installs to the Android home screen via the browser's "Add to Home Screen" prompt.

---

## 3. Math Content

### 3.1 Question Bank (621 questions total)

| Category | Scope | Count |
|---|---|---|
| Tables | 1–25 × 1–20 | 500 |
| Squares | 1² to 25² | 25 |
| Cubes | 1³ to 12³ | 12 |
| Powers Base 2 | 2¹ to 2¹⁵ | 15 |
| Powers Base 3 | 3¹ to 3⁸ | 8 |
| Powers Base 4 | 4¹ to 4⁶ | 6 |
| Powers Base 5 | 5¹ to 5⁵ | 5 |
| Powers Base 6 | 6¹ to 6⁴ | 4 |
| Powers Base 7 | 7¹ to 7⁴ | 4 |
| Powers Base 8 | 8¹ to 8⁴ | 4 |
| Powers Base 9 | 9¹ to 9⁴ | 4 |
| Fractions → % | 1/1 to 1/30 | 30 |
| **Total** | | **617** |

### 3.2 Question Object Shape

```js
{
  id: "tbl-7x14",        // unique, stable ID
  category: "tables",    // one of the 12 categories above
  subcategory: "11-20",  // for tables: "1-10" | "11-20" | "21-25"
  prompt: "7 × 14",      // display string
  answer: 98,            // number or string
  answerDisplay: "98"    // formatted for display (e.g. "33.33%" for fractions)
}
```

The question bank is a static JS module — generated once, never mutated at runtime.

### 3.3 Table Subcategories

Tables are split into subcategories for targeted drilling:
- `1–10` (multiplicands 1–10)
- `11–20` (multiplicands 11–20)
- `21–25` (multiplicands 21–25)

---

## 4. Screens & Navigation

### Navigation
Bottom tab bar with two tabs:
- **Practice** — Home + all session flows
- **Stats** — Progress dashboard

### 4.1 Home Screen
- Daily streak counter (prominent)
- "Start Session" primary CTA
- Three mode buttons: Sprint | Fixed Count | Topic Drill
- Reference Sheet button (opens the full cheat sheet as a scrollable view)

### 4.2 Session Setup Screen
Configured per mode:

**Sprint**
- Select categories (multi-select, default: all)
- Select duration: 5 min / 10 min / 15 min

**Fixed Count**
- Select categories (multi-select, default: all)
- Select question count: 10 / 20 / 30 / 50

**Topic Drill**
- Select one category from the list
- For tables: additionally select subcategory (1–10, 11–20, 21–25, or All)
- Drills all questions in that category in random order, loops when exhausted

### 4.3 Active Session Screen
- Question displayed large and centered
- Format: type-answer, flashcard, or MCQ (see Section 5)
- Timer: countdown (Sprint) or elapsed (Fixed/Topic)
- Progress: "Q 7 / 20" or time remaining
- Immediate feedback after each answer: green (correct) or red (wrong) flash + correct answer shown for 1.2s before next question

### 4.4 Session Results Screen
- Score: X correct / Y total
- Accuracy %
- Average time per question (ms)
- Top 3 weak spots from this session
- Buttons: Retry Same | Go Home

### 4.5 Stats Dashboard Screen
- Daily streak (with last 7-day calendar dots)
- Per-category accuracy bars (all 12 categories)
- Speed trend: average ms/question for last 7 sessions (line chart)
- Weakest Questions list: bottom 10 by all-time accuracy (min 3 attempts to qualify)

### 4.6 Reference Sheet Screen
- Scrollable display of all values from the question bank
- Grouped by category
- Read-only, no interaction

---

## 5. Question Formats

Each category has a fixed default format. The mix is not adaptive — format is deterministic per category for predictability.

| Category | Format |
|---|---|
| Tables | Type-answer |
| Squares | MCQ |
| Cubes | MCQ |
| Powers (all bases) | Flashcard |
| Fractions → % | MCQ |

### Type-answer
User types a number, submits. Exact match required (integer). Timer runs per-question.

### Flashcard
Question shown. User taps "Reveal". Answer shown. User self-rates: "Got it" (correct) or "Missed" (incorrect). Time measured from question display to reveal tap.

### MCQ
Question + 4 options displayed. One tap selects. No confirm step — immediate feedback.

**Wrong option generation (per category):**
- **Squares**: `(n±1)²`, `(n±2)²` — pick 3 closest wrong values
- **Cubes**: adjacent cubes in the bank
- **Fractions**: 3 nearby % values from the same fraction table
- **Powers**: adjacent powers of same base or same exponent on adjacent base

---

## 6. Session Engine

```
startSession(config)
  → shuffles question pool for chosen categories/mode
  → returns { sessionId, questions[], startTime }

nextQuestion(sessionState)
  → returns next question + format to display

submitAnswer({ questionId, userAnswer, timeTakenMs })
  → checks correctness
  → records attempt to IndexedDB
  → returns { correct, correctAnswer }

endSession(sessionId)
  → marks session complete in IndexedDB
  → computes and returns session summary
  → updates streak
```

---

## 7. Data Model (IndexedDB)

### Store: `sessions`
```js
{
  id,           // uuid
  mode,         // "sprint" | "fixed" | "topic"
  categories,   // string[]
  date,         // ISO date string "YYYY-MM-DD"
  startTime,    // timestamp ms
  durationMs,   // total session duration
  totalQuestions,
  completed     // boolean
}
```

### Store: `attempts`
```js
{
  id,           // uuid
  sessionId,
  questionId,   // matches question bank id
  category,
  format,       // "type" | "flashcard" | "mcq"
  correct,      // boolean
  timeTakenMs,
  date          // ISO date string "YYYY-MM-DD"
}
```

### Store: `meta`
```js
// Key-value store, single record:
{ key: "streak", value: { count: 14, lastSessionDate: "2026-05-18" } }
```

---

## 8. Streak Logic

Evaluated at `endSession`:

```
today = current local date (YYYY-MM-DD)
last  = meta.streak.lastSessionDate

if last === today       → no change (multiple sessions same day)
if last === yesterday   → streak.count += 1
else                    → streak.count = 1

meta.streak.lastSessionDate = today
```

---

## 9. Stats Computation

Stats are computed on-read from raw `attempts` records. Nothing pre-aggregated.

| Stat | Computation |
|---|---|
| Per-question accuracy | correct attempts / total attempts for that questionId |
| Per-category accuracy | mean of all per-question accuracies in that category |
| Speed trend | mean timeTakenMs per session, last 7 sessions |
| Weakest questions | bottom 10 by per-question accuracy, min 3 attempts to qualify |
| Session accuracy | correct / total within sessionId |
| Session avg speed | mean timeTakenMs within sessionId |

---

## 10. PWA Configuration

- `manifest.json`: name "Speed Math", short_name "SpeedMath", theme color, icons (192×192, 512×512)
- Workbox strategy: **Cache First** for all static assets; app shell fully cached on install
- Works fully offline after first load
- On Android Chrome: "Add to Home Screen" banner triggers automatically after 2 visits

---

## 11. Out of Scope (v1)

- User accounts or cloud sync
- Multiple user profiles
- Push notifications / reminders
- Leaderboards
- Adaptive difficulty (format changes based on performance)
- Audio feedback

# Speed Math PWA — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-installable React PWA that drills 617 math questions across 5 topics with three session modes, mixed question formats, and a deep stats dashboard.

**Architecture:** Pure client-side React SPA with no backend. All data persists in IndexedDB. The question bank is a static JS module generated at build time. Stats are computed on-read from raw attempt records.

**Tech Stack:** React 18 + Vite, Tailwind CSS, React Router v6, `idb` (IndexedDB wrapper), `vite-plugin-pwa` + Workbox, Vitest + jsdom + @testing-library/react

---

## File Map

```
mental-arithmetic/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── public/
│   └── icons/
│       ├── icon-192.png          (placeholder — replace with real icon)
│       └── icon-512.png          (placeholder — replace with real icon)
├── src/
│   ├── main.jsx                  Entry point
│   ├── App.jsx                   Router + layout shell
│   ├── test-setup.js             Vitest global setup
│   ├── data/
│   │   └── questionBank.js       Static array of 617 question objects
│   ├── db/
│   │   └── index.js              IndexedDB open + CRUD (sessions, attempts, meta)
│   ├── engine/
│   │   ├── session.js            startSession / nextQuestion / submitAnswer / endSession
│   │   ├── mcqOptions.js         Wrong option generation per category
│   │   └── streak.js             Streak read/update logic
│   ├── stats/
│   │   └── compute.js            On-read stats from raw attempts
│   ├── hooks/
│   │   ├── useSession.js         useReducer-based session state
│   │   └── useStats.js           Loads + returns computed stats
│   ├── components/
│   │   ├── BottomNav.jsx         Two-tab navigation bar
│   │   ├── StreakBadge.jsx       Streak count display
│   │   ├── Timer.jsx             Countdown or elapsed timer
│   │   ├── ProgressBar.jsx       Q n of N progress indicator
│   │   ├── FeedbackFlash.jsx     Green/red overlay for 1.2s after answer
│   │   ├── TypeAnswer.jsx        Numeric input + submit
│   │   ├── Flashcard.jsx         Reveal + self-rate buttons
│   │   ├── MCQOptions.jsx        4-option tap grid
│   │   ├── AccuracyBar.jsx       Category accuracy progress bar
│   │   └── SpeedTrendChart.jsx   SVG line chart for speed over sessions
│   └── screens/
│       ├── Home.jsx              Streak, mode buttons, reference link
│       ├── SessionSetup.jsx      Mode config form
│       ├── ActiveSession.jsx     Core drill screen
│       ├── SessionResults.jsx    Post-session summary
│       ├── StatsDashboard.jsx    Full stats view
│       └── ReferenceSheet.jsx    Read-only cheat sheet
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json` (via npm create)
- Create: `vite.config.js`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `src/test-setup.js`
- Modify: `src/main.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Scaffold Vite + React project**

```bash
cd /home/vedanshkamdar/Desktop/mental-arithmetic
npm create vite@latest . -- --template react
```

When prompted about existing files, select "Ignore files and continue".

- [ ] **Step 2: Install all dependencies**

```bash
npm install
npm install react-router-dom idb
npm install -D vite-plugin-pwa workbox-window
npm install -D tailwindcss postcss autoprefixer
npm install -D vitest jsdom @vitest/coverage-v8
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
npx tailwindcss init -p
```

- [ ] **Step 3: Write `vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Speed Math',
        short_name: 'SpeedMath',
        theme_color: '#1e1b4b',
        background_color: '#0f0e1a',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.js'],
    globals: true,
  },
})
```

- [ ] **Step 4: Write `tailwind.config.js`**

```js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 900: '#0f0e1a', 800: '#1e1b4b', 700: '#312e81' },
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 5: Write `src/test-setup.js`**

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 6: Replace `src/index.css` with Tailwind directives**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 7: Write `src/main.jsx`**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
```

- [ ] **Step 8: Write `src/App.jsx` (placeholder routes — screens added in later tasks)**

```jsx
import { Routes, Route, Navigate } from 'react-router-dom'

export default function App() {
  return (
    <div className="min-h-screen bg-brand-900 text-white">
      <Routes>
        <Route path="/" element={<div className="p-8 text-center">Home</div>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
```

- [ ] **Step 9: Create placeholder icons**

```bash
mkdir -p public/icons
# Create 1px placeholder PNGs so Vite build doesn't error
node -e "
const { createCanvas } = require('canvas') 
" 2>/dev/null || true

# Simple approach: copy any existing PNG or create via node
node -e "
const fs = require('fs')
// Minimal 1x1 purple PNG (valid PNG bytes)
const png192 = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64')
fs.writeFileSync('public/icons/icon-192.png', png192)
fs.writeFileSync('public/icons/icon-512.png', png192)
console.log('Placeholder icons created')
"
```

- [ ] **Step 10: Verify dev server starts**

```bash
npm run dev
```

Expected: Vite starts on `http://localhost:5173`. Open in browser — should show white "Home" text on dark background.

- [ ] **Step 11: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold Vite + React + Tailwind + PWA"
```

---

## Task 2: Question Bank

**Files:**
- Create: `src/data/questionBank.js`
- Create: `src/data/questionBank.test.js`

- [ ] **Step 1: Write `src/data/questionBank.js`**

```js
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function generateTables() {
  const qs = []
  for (let a = 1; a <= 25; a++) {
    const sub = a <= 10 ? '1-10' : a <= 20 ? '11-20' : '21-25'
    for (let b = 1; b <= 20; b++) {
      qs.push({
        id: `tbl-${a}x${b}`,
        category: 'tables',
        subcategory: sub,
        prompt: `${a} × ${b}`,
        answer: a * b,
        answerDisplay: String(a * b),
      })
    }
  }
  return qs
}

function generateSquares() {
  return Array.from({ length: 25 }, (_, i) => {
    const n = i + 1
    return {
      id: `sq-${n}`,
      category: 'squares',
      subcategory: null,
      prompt: `${n}²`,
      answer: n * n,
      answerDisplay: String(n * n),
    }
  })
}

function generateCubes() {
  return Array.from({ length: 12 }, (_, i) => {
    const n = i + 1
    return {
      id: `cb-${n}`,
      category: 'cubes',
      subcategory: null,
      prompt: `${n}³`,
      answer: Math.pow(n, 3),
      answerDisplay: String(Math.pow(n, 3)),
    }
  })
}

function generatePowers() {
  const configs = [
    { base: 2, max: 15 },
    { base: 3, max: 8 },
    { base: 4, max: 6 },
    { base: 5, max: 5 },
    { base: 6, max: 4 },
    { base: 7, max: 4 },
    { base: 8, max: 4 },
    { base: 9, max: 4 },
  ]
  const qs = []
  for (const { base, max } of configs) {
    for (let exp = 1; exp <= max; exp++) {
      qs.push({
        id: `pow-${base}-${exp}`,
        category: `powers-base${base}`,
        subcategory: null,
        prompt: `${base}^${exp}`,
        answer: Math.pow(base, exp),
        answerDisplay: String(Math.pow(base, exp)),
      })
    }
  }
  return qs
}

// Exact % values rounded to 2 decimal places (100/n)
const FRACTION_PCT = {
  1:'100%', 2:'50%', 3:'33.33%', 4:'25%', 5:'20%',
  6:'16.67%', 7:'14.29%', 8:'12.5%', 9:'11.11%', 10:'10%',
  11:'9.09%', 12:'8.33%', 13:'7.69%', 14:'7.14%', 15:'6.67%',
  16:'6.25%', 17:'5.88%', 18:'5.56%', 19:'5.26%', 20:'5%',
  21:'4.76%', 22:'4.55%', 23:'4.35%', 24:'4.17%', 25:'4%',
  26:'3.85%', 27:'3.7%', 28:'3.57%', 29:'3.45%', 30:'3.33%',
}

function generateFractions() {
  return Array.from({ length: 30 }, (_, i) => {
    const n = i + 1
    return {
      id: `frac-${n}`,
      category: 'fractions',
      subcategory: null,
      prompt: `1/${n}`,
      answer: FRACTION_PCT[n],
      answerDisplay: FRACTION_PCT[n],
    }
  })
}

export const QUESTION_BANK = [
  ...generateTables(),
  ...generateSquares(),
  ...generateCubes(),
  ...generatePowers(),
  ...generateFractions(),
]

export const CATEGORIES = [
  'tables', 'squares', 'cubes',
  'powers-base2', 'powers-base3', 'powers-base4', 'powers-base5',
  'powers-base6', 'powers-base7', 'powers-base8', 'powers-base9',
  'fractions',
]

export const TABLE_SUBCATEGORIES = ['1-10', '11-20', '21-25']

// Format per category — determines how questions are presented
export const CATEGORY_FORMAT = {
  tables: 'type',
  squares: 'mcq',
  cubes: 'mcq',
  'powers-base2': 'flashcard',
  'powers-base3': 'flashcard',
  'powers-base4': 'flashcard',
  'powers-base5': 'flashcard',
  'powers-base6': 'flashcard',
  'powers-base7': 'flashcard',
  'powers-base8': 'flashcard',
  'powers-base9': 'flashcard',
  fractions: 'mcq',
}

export function getByCategory(category, subcategory = null) {
  return QUESTION_BANK.filter(
    q => q.category === category && (subcategory === null || q.subcategory === subcategory)
  )
}

export { shuffle }
```

- [ ] **Step 2: Write failing tests in `src/data/questionBank.test.js`**

```js
import { describe, it, expect } from 'vitest'
import { QUESTION_BANK, getByCategory, FRACTION_PCT, CATEGORY_FORMAT } from './questionBank'

describe('QUESTION_BANK', () => {
  it('has 617 total questions', () => {
    expect(QUESTION_BANK).toHaveLength(617)
  })

  it('has 500 table questions', () => {
    expect(QUESTION_BANK.filter(q => q.category === 'tables')).toHaveLength(500)
  })

  it('has 25 square questions', () => {
    expect(QUESTION_BANK.filter(q => q.category === 'squares')).toHaveLength(25)
  })

  it('has 12 cube questions', () => {
    expect(QUESTION_BANK.filter(q => q.category === 'cubes')).toHaveLength(12)
  })

  it('has 50 power questions total', () => {
    const powers = QUESTION_BANK.filter(q => q.category.startsWith('powers-'))
    expect(powers).toHaveLength(50)
  })

  it('has 30 fraction questions', () => {
    expect(QUESTION_BANK.filter(q => q.category === 'fractions')).toHaveLength(30)
  })

  it('all IDs are unique', () => {
    const ids = QUESTION_BANK.map(q => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('7 × 14 = 98', () => {
    const q = QUESTION_BANK.find(q => q.id === 'tbl-7x14')
    expect(q.answer).toBe(98)
  })

  it('13² = 169', () => {
    const q = QUESTION_BANK.find(q => q.id === 'sq-13')
    expect(q.answer).toBe(169)
  })

  it('2^10 = 1024', () => {
    const q = QUESTION_BANK.find(q => q.id === 'pow-2-10')
    expect(q.answer).toBe(1024)
  })

  it('1/7 = 14.29%', () => {
    const q = QUESTION_BANK.find(q => q.id === 'frac-7')
    expect(q.answer).toBe('14.29%')
  })

  it('tables subcategory 21-25 has 100 questions', () => {
    expect(getByCategory('tables', '21-25')).toHaveLength(100)
  })
})
```

- [ ] **Step 3: Run tests — expect them to fail (module not found or assertion failure)**

```bash
npx vitest run src/data/questionBank.test.js
```

Expected: Some tests may already pass if the module is correct. The count checks are the key assertions.

- [ ] **Step 4: Run tests — verify all pass**

```bash
npx vitest run src/data/questionBank.test.js
```

Expected: All 12 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/
git commit -m "feat: add question bank with 617 questions across 5 topics"
```

---

## Task 3: IndexedDB Layer

**Files:**
- Create: `src/db/index.js`
- Create: `src/db/index.test.js`

- [ ] **Step 1: Write failing tests in `src/db/index.test.js`**

```js
import { describe, it, expect, beforeEach } from 'vitest'
import { openDB as mockOpenDB } from 'idb'
import { getDB, saveSession, saveAttempts, getAttempts, getSessions, getMeta, setMeta } from './index'

// idb uses IndexedDB which is not available in jsdom — mock it
vi.mock('idb', () => {
  const store = {}
  const mockDB = {
    put: vi.fn((storeName, val) => { store[storeName] = store[storeName] || []; store[storeName].push(val); return Promise.resolve() }),
    getAll: vi.fn((storeName) => Promise.resolve(store[storeName] || [])),
    get: vi.fn((storeName, key) => Promise.resolve((store[storeName] || []).find(v => v.key === key))),
  }
  return {
    openDB: vi.fn(() => Promise.resolve(mockDB)),
    _mockDB: mockDB,
    _store: store,
  }
})

describe('db layer', () => {
  it('saveSession stores a session object', async () => {
    const session = { id: 's1', mode: 'sprint', categories: ['tables'], date: '2026-05-18', completed: false }
    await saveSession(session)
    const all = await getSessions()
    expect(all.some(s => s.id === 's1')).toBe(true)
  })

  it('saveAttempts stores multiple attempts', async () => {
    const attempts = [
      { id: 'a1', sessionId: 's1', questionId: 'tbl-1x1', correct: true, timeTakenMs: 1200 },
      { id: 'a2', sessionId: 's1', questionId: 'tbl-2x2', correct: false, timeTakenMs: 3000 },
    ]
    await saveAttempts(attempts)
    const all = await getAttempts()
    expect(all.length).toBeGreaterThanOrEqual(2)
  })

  it('setMeta and getMeta round-trip', async () => {
    await setMeta('streak', { count: 5, lastSessionDate: '2026-05-18' })
    const val = await getMeta('streak')
    expect(val.count).toBe(5)
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx vitest run src/db/index.test.js
```

Expected: FAIL — module `./index` not found.

- [ ] **Step 3: Write `src/db/index.js`**

```js
import { openDB } from 'idb'

const DB_NAME = 'speed-math'
const DB_VERSION = 1

let dbPromise = null

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('sessions')) {
          db.createObjectStore('sessions', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('attempts')) {
          const store = db.createObjectStore('attempts', { keyPath: 'id' })
          store.createIndex('by-session', 'sessionId')
          store.createIndex('by-question', 'questionId')
        }
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta', { keyPath: 'key' })
        }
      },
    })
  }
  return dbPromise
}

export async function saveSession(session) {
  const db = await getDB()
  await db.put('sessions', session)
}

export async function getSessions() {
  const db = await getDB()
  return db.getAll('sessions')
}

export async function saveAttempts(attempts) {
  const db = await getDB()
  const tx = db.transaction('attempts', 'readwrite')
  await Promise.all([...attempts.map(a => tx.store.put(a)), tx.done])
}

export async function getAttempts() {
  const db = await getDB()
  return db.getAll('attempts')
}

export async function getMeta(key) {
  const db = await getDB()
  const record = await db.get('meta', key)
  return record ? record.value : null
}

export async function setMeta(key, value) {
  const db = await getDB()
  await db.put('meta', { key, value })
}
```

- [ ] **Step 4: Run tests — verify all pass**

```bash
npx vitest run src/db/index.test.js
```

Expected: All 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/db/
git commit -m "feat: add IndexedDB layer for sessions, attempts, meta"
```

---

## Task 4: MCQ Option Generator

**Files:**
- Create: `src/engine/mcqOptions.js`
- Create: `src/engine/mcqOptions.test.js`

- [ ] **Step 1: Write failing tests in `src/engine/mcqOptions.test.js`**

```js
import { describe, it, expect } from 'vitest'
import { generateOptions } from './mcqOptions'
import { QUESTION_BANK } from '../data/questionBank'

describe('generateOptions', () => {
  it('returns exactly 4 options', () => {
    const q = QUESTION_BANK.find(q => q.id === 'sq-13')
    const opts = generateOptions(q, QUESTION_BANK)
    expect(opts).toHaveLength(4)
  })

  it('includes the correct answer', () => {
    const q = QUESTION_BANK.find(q => q.id === 'sq-13') // 169
    const opts = generateOptions(q, QUESTION_BANK)
    expect(opts.some(o => o.value === q.answer && o.correct)).toBe(true)
  })

  it('all options are distinct', () => {
    const q = QUESTION_BANK.find(q => q.id === 'sq-15') // 225
    const opts = generateOptions(q, QUESTION_BANK)
    const values = opts.map(o => o.answerDisplay)
    expect(new Set(values).size).toBe(4)
  })

  it('generates options for fractions', () => {
    const q = QUESTION_BANK.find(q => q.id === 'frac-7') // 14.29%
    const opts = generateOptions(q, QUESTION_BANK)
    expect(opts).toHaveLength(4)
    expect(opts.some(o => o.correct)).toBe(true)
  })

  it('generates options for cubes', () => {
    const q = QUESTION_BANK.find(q => q.id === 'cb-7') // 343
    const opts = generateOptions(q, QUESTION_BANK)
    expect(opts).toHaveLength(4)
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx vitest run src/engine/mcqOptions.test.js
```

Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/engine/mcqOptions.js`**

```js
import { shuffle } from '../data/questionBank'

function pickDistractors(correctValue, pool, count) {
  const wrong = pool
    .filter(q => q.answer !== correctValue)
    .map(q => ({ value: q.answer, answerDisplay: q.answerDisplay, correct: false }))
  return shuffle(wrong).slice(0, count)
}

function squareDistractors(question, bank) {
  // Use adjacent squares: (n±1)², (n±2)², (n±3)²
  const n = Math.round(Math.sqrt(question.answer))
  const candidates = [-3, -2, -1, 1, 2, 3]
    .map(d => n + d)
    .filter(m => m >= 1 && m <= 30)
    .map(m => ({ value: m * m, answerDisplay: String(m * m), correct: false }))
  return shuffle(candidates).slice(0, 3)
}

function cubeDistractors(question, bank) {
  const sameCategory = bank.filter(q => q.category === 'cubes' && q.id !== question.id)
  return shuffle(sameCategory)
    .slice(0, 3)
    .map(q => ({ value: q.answer, answerDisplay: q.answerDisplay, correct: false }))
}

function fractionDistractors(question, bank) {
  const sameCategory = bank.filter(q => q.category === 'fractions' && q.id !== question.id)
  return shuffle(sameCategory)
    .slice(0, 3)
    .map(q => ({ value: q.answer, answerDisplay: q.answerDisplay, correct: false }))
}

function powerDistractors(question, bank) {
  // Adjacent powers: same base different exp, or adjacent base same exp
  const [, baseStr, expStr] = question.id.split('-')
  const base = Number(baseStr)
  const exp = Number(expStr)
  const candidates = bank
    .filter(q => {
      if (q.id === question.id) return false
      const parts = q.id.split('-')
      if (parts[0] !== 'pow') return false
      const qBase = Number(parts[1])
      const qExp = Number(parts[2])
      return (qBase === base && Math.abs(qExp - exp) <= 2) ||
             (qExp === exp && Math.abs(qBase - base) <= 2)
    })
    .map(q => ({ value: q.answer, answerDisplay: q.answerDisplay, correct: false }))
  const pool = candidates.length >= 3 ? candidates : bank.filter(q => q.category === question.category && q.id !== question.id).map(q => ({ value: q.answer, answerDisplay: q.answerDisplay, correct: false }))
  return shuffle(pool).slice(0, 3)
}

export function generateOptions(question, bank) {
  const correct = {
    value: question.answer,
    answerDisplay: question.answerDisplay,
    correct: true,
  }

  let distractors
  if (question.category === 'squares') distractors = squareDistractors(question, bank)
  else if (question.category === 'cubes') distractors = cubeDistractors(question, bank)
  else if (question.category === 'fractions') distractors = fractionDistractors(question, bank)
  else if (question.category.startsWith('powers-')) distractors = powerDistractors(question, bank)
  else distractors = pickDistractors(question.answer, bank.filter(q => q.category === question.category && q.id !== question.id), 3)

  // Deduplicate distractors against correct answer
  const unique = distractors.filter(d => d.answerDisplay !== correct.answerDisplay).slice(0, 3)

  return shuffle([correct, ...unique])
}
```

- [ ] **Step 4: Run tests — verify all pass**

```bash
npx vitest run src/engine/mcqOptions.test.js
```

Expected: All 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/engine/mcqOptions.js src/engine/mcqOptions.test.js
git commit -m "feat: add MCQ wrong-option generator per category"
```

---

## Task 5: Streak Logic

**Files:**
- Create: `src/engine/streak.js`
- Create: `src/engine/streak.test.js`

- [ ] **Step 1: Write failing tests in `src/engine/streak.test.js`**

```js
import { describe, it, expect } from 'vitest'
import { computeNewStreak } from './streak'

describe('computeNewStreak', () => {
  it('starts streak at 1 when no prior session', () => {
    const result = computeNewStreak(null, '2026-05-18')
    expect(result).toEqual({ count: 1, lastSessionDate: '2026-05-18' })
  })

  it('increments streak when last session was yesterday', () => {
    const prior = { count: 5, lastSessionDate: '2026-05-17' }
    const result = computeNewStreak(prior, '2026-05-18')
    expect(result).toEqual({ count: 6, lastSessionDate: '2026-05-18' })
  })

  it('does not change count when last session was today', () => {
    const prior = { count: 5, lastSessionDate: '2026-05-18' }
    const result = computeNewStreak(prior, '2026-05-18')
    expect(result).toEqual({ count: 5, lastSessionDate: '2026-05-18' })
  })

  it('resets to 1 when streak is broken', () => {
    const prior = { count: 10, lastSessionDate: '2026-05-15' }
    const result = computeNewStreak(prior, '2026-05-18')
    expect(result).toEqual({ count: 1, lastSessionDate: '2026-05-18' })
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx vitest run src/engine/streak.test.js
```

Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/engine/streak.js`**

```js
function addDays(dateStr, n) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export function computeNewStreak(prior, today) {
  if (!prior) return { count: 1, lastSessionDate: today }
  const { count, lastSessionDate } = prior
  if (lastSessionDate === today) return { count, lastSessionDate: today }
  if (addDays(lastSessionDate, 1) === today) return { count: count + 1, lastSessionDate: today }
  return { count: 1, lastSessionDate: today }
}
```

- [ ] **Step 4: Run tests — verify all pass**

```bash
npx vitest run src/engine/streak.test.js
```

Expected: All 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/engine/streak.js src/engine/streak.test.js
git commit -m "feat: add streak computation logic"
```

---

## Task 6: Session Engine

**Files:**
- Create: `src/engine/session.js`
- Create: `src/engine/session.test.js`

- [ ] **Step 1: Write failing tests in `src/engine/session.test.js`**

```js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildSession, getNextQuestion, checkAnswer } from './session'
import { QUESTION_BANK } from '../data/questionBank'

describe('buildSession', () => {
  it('sprint mode returns shuffled questions from selected categories', () => {
    const session = buildSession({ mode: 'sprint', categories: ['squares'], durationSec: 300 })
    expect(session.questions.every(q => q.category === 'squares')).toBe(true)
    expect(session.questions).toHaveLength(25)
  })

  it('fixed mode limits to requested count', () => {
    const session = buildSession({ mode: 'fixed', categories: ['tables'], count: 20 })
    expect(session.questions).toHaveLength(20)
  })

  it('topic mode with subcategory filters correctly', () => {
    const session = buildSession({ mode: 'topic', categories: ['tables'], subcategory: '21-25' })
    expect(session.questions.every(q => q.subcategory === '21-25')).toBe(true)
    expect(session.questions).toHaveLength(100)
  })

  it('multi-category sprint mixes categories', () => {
    const session = buildSession({ mode: 'sprint', categories: ['squares', 'cubes'], durationSec: 300 })
    const cats = new Set(session.questions.map(q => q.category))
    expect(cats.size).toBe(2)
  })
})

describe('checkAnswer', () => {
  it('correct integer answer returns true', () => {
    const q = QUESTION_BANK.find(q => q.id === 'tbl-7x14')
    expect(checkAnswer(q, '98')).toBe(true)
    expect(checkAnswer(q, 98)).toBe(true)
  })

  it('wrong integer answer returns false', () => {
    const q = QUESTION_BANK.find(q => q.id === 'tbl-7x14')
    expect(checkAnswer(q, '99')).toBe(false)
  })

  it('fraction answer matches string', () => {
    const q = QUESTION_BANK.find(q => q.id === 'frac-7')
    expect(checkAnswer(q, '14.29%')).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx vitest run src/engine/session.test.js
```

Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/engine/session.js`**

```js
import { QUESTION_BANK, CATEGORY_FORMAT, getByCategory, shuffle } from '../data/questionBank'
import { generateOptions } from './mcqOptions'

export function buildSession({ mode, categories, durationSec, count, subcategory }) {
  let pool = []

  if (mode === 'topic' && subcategory) {
    pool = getByCategory(categories[0], subcategory)
  } else {
    pool = QUESTION_BANK.filter(q => categories.includes(q.category))
  }

  let questions = shuffle(pool)

  if (mode === 'fixed') {
    questions = questions.slice(0, count)
  }

  return {
    id: crypto.randomUUID(),
    mode,
    categories,
    subcategory: subcategory || null,
    durationSec: durationSec || null,
    questions,
    startTime: Date.now(),
    date: new Date().toISOString().slice(0, 10),
  }
}

export function getFormat(question) {
  return CATEGORY_FORMAT[question.category] || 'type'
}

export function buildQuestionView(question, bank) {
  const format = getFormat(question)
  return {
    question,
    format,
    options: format === 'mcq' ? generateOptions(question, bank) : null,
  }
}

export function checkAnswer(question, userAnswer) {
  const correct = question.answer
  if (typeof correct === 'number') {
    return Number(userAnswer) === correct
  }
  return String(userAnswer).trim() === String(correct).trim()
}

export function buildAttempt({ sessionId, question, correct, timeTakenMs, format }) {
  return {
    id: crypto.randomUUID(),
    sessionId,
    questionId: question.id,
    category: question.category,
    format,
    correct,
    timeTakenMs,
    date: new Date().toISOString().slice(0, 10),
  }
}
```

- [ ] **Step 4: Run tests — verify all pass**

```bash
npx vitest run src/engine/session.test.js
```

Expected: All 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/engine/session.js src/engine/session.test.js
git commit -m "feat: add session engine (build, check, attempt)"
```

---

## Task 7: Stats Computation

**Files:**
- Create: `src/stats/compute.js`
- Create: `src/stats/compute.test.js`

- [ ] **Step 1: Write failing tests in `src/stats/compute.test.js`**

```js
import { describe, it, expect } from 'vitest'
import { computeStats } from './compute'

const makeAttempt = (overrides) => ({
  id: crypto.randomUUID(),
  sessionId: 's1',
  questionId: 'tbl-7x14',
  category: 'tables',
  format: 'type',
  correct: true,
  timeTakenMs: 2000,
  date: '2026-05-18',
  ...overrides,
})

describe('computeStats', () => {
  it('per-question accuracy is correct/total', () => {
    const attempts = [
      makeAttempt({ questionId: 'sq-5', category: 'squares', correct: true }),
      makeAttempt({ questionId: 'sq-5', category: 'squares', correct: true }),
      makeAttempt({ questionId: 'sq-5', category: 'squares', correct: false }),
    ]
    const stats = computeStats(attempts, [])
    expect(stats.questionAccuracy['sq-5']).toBeCloseTo(0.667, 2)
  })

  it('weakest questions excludes those with fewer than 3 attempts', () => {
    const attempts = [
      makeAttempt({ questionId: 'sq-1', category: 'squares', correct: false }),
      makeAttempt({ questionId: 'sq-1', category: 'squares', correct: false }),
    ]
    const stats = computeStats(attempts, [])
    expect(stats.weakestQuestions.find(q => q.questionId === 'sq-1')).toBeUndefined()
  })

  it('weakest questions includes those with 3+ attempts sorted by accuracy asc', () => {
    const attempts = [
      makeAttempt({ questionId: 'sq-2', category: 'squares', correct: false }),
      makeAttempt({ questionId: 'sq-2', category: 'squares', correct: false }),
      makeAttempt({ questionId: 'sq-2', category: 'squares', correct: false }),
      makeAttempt({ questionId: 'sq-3', category: 'squares', correct: true }),
      makeAttempt({ questionId: 'sq-3', category: 'squares', correct: true }),
      makeAttempt({ questionId: 'sq-3', category: 'squares', correct: true }),
    ]
    const stats = computeStats(attempts, [])
    const weak = stats.weakestQuestions
    expect(weak[0].questionId).toBe('sq-2')
  })

  it('categoryAccuracy averages per-question accuracies', () => {
    const attempts = [
      makeAttempt({ questionId: 'sq-1', category: 'squares', correct: true }),
      makeAttempt({ questionId: 'sq-1', category: 'squares', correct: true }),
      makeAttempt({ questionId: 'sq-2', category: 'squares', correct: false }),
      makeAttempt({ questionId: 'sq-2', category: 'squares', correct: false }),
    ]
    const stats = computeStats(attempts, [])
    // sq-1 = 1.0, sq-2 = 0.0 → avg = 0.5
    expect(stats.categoryAccuracy['squares']).toBeCloseTo(0.5)
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx vitest run src/stats/compute.test.js
```

Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/stats/compute.js`**

```js
export function computeStats(attempts, sessions) {
  // Per-question accuracy
  const byQuestion = {}
  for (const a of attempts) {
    if (!byQuestion[a.questionId]) byQuestion[a.questionId] = { correct: 0, total: 0, category: a.category }
    byQuestion[a.questionId].total++
    if (a.correct) byQuestion[a.questionId].correct++
  }

  const questionAccuracy = {}
  for (const [qid, data] of Object.entries(byQuestion)) {
    questionAccuracy[qid] = data.total > 0 ? data.correct / data.total : 0
  }

  // Per-category accuracy (mean of per-question accuracies)
  const categoryBuckets = {}
  for (const [qid, data] of Object.entries(byQuestion)) {
    if (!categoryBuckets[data.category]) categoryBuckets[data.category] = []
    categoryBuckets[data.category].push(questionAccuracy[qid])
  }

  const categoryAccuracy = {}
  for (const [cat, accs] of Object.entries(categoryBuckets)) {
    categoryAccuracy[cat] = accs.reduce((s, v) => s + v, 0) / accs.length
  }

  // Weakest questions (min 3 attempts, sorted by accuracy asc, top 10)
  const weakestQuestions = Object.entries(byQuestion)
    .filter(([, data]) => data.total >= 3)
    .map(([questionId, data]) => ({
      questionId,
      category: data.category,
      accuracy: questionAccuracy[questionId],
      attempts: data.total,
    }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 10)

  // Speed trend: average timeTakenMs per session, last 7 sessions
  const bySession = {}
  for (const a of attempts) {
    if (!bySession[a.sessionId]) bySession[a.sessionId] = []
    bySession[a.sessionId].push(a.timeTakenMs)
  }

  const sessionSpeeds = sessions
    .slice(-7)
    .map(s => {
      const times = bySession[s.id] || []
      return {
        sessionId: s.id,
        date: s.date,
        avgMs: times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0,
      }
    })

  return { questionAccuracy, categoryAccuracy, weakestQuestions, sessionSpeeds }
}
```

- [ ] **Step 4: Run tests — verify all pass**

```bash
npx vitest run src/stats/compute.test.js
```

Expected: All 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/stats/
git commit -m "feat: add on-read stats computation"
```

---

## Task 8: App Shell + Navigation

**Files:**
- Create: `src/components/BottomNav.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Write `src/components/BottomNav.jsx`**

```jsx
import { NavLink } from 'react-router-dom'

export default function BottomNav() {
  const base = 'flex-1 flex flex-col items-center py-3 text-xs font-medium transition-colors'
  const active = 'text-indigo-400'
  const inactive = 'text-gray-500'

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex bg-brand-800 border-t border-indigo-900 safe-area-pb">
      <NavLink to="/" end className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
        <span className="text-xl mb-1">⚡</span>
        Practice
      </NavLink>
      <NavLink to="/stats" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
        <span className="text-xl mb-1">📊</span>
        Stats
      </NavLink>
    </nav>
  )
}
```

- [ ] **Step 2: Write final `src/App.jsx` with all routes**

```jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Home from './screens/Home'
import SessionSetup from './screens/SessionSetup'
import ActiveSession from './screens/ActiveSession'
import SessionResults from './screens/SessionResults'
import StatsDashboard from './screens/StatsDashboard'
import ReferenceSheet from './screens/ReferenceSheet'

export default function App() {
  return (
    <div className="min-h-screen bg-brand-900 text-white pb-16">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/session/setup" element={<SessionSetup />} />
        <Route path="/session/active" element={<ActiveSession />} />
        <Route path="/session/results" element={<SessionResults />} />
        <Route path="/stats" element={<StatsDashboard />} />
        <Route path="/reference" element={<ReferenceSheet />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </div>
  )
}
```

Note: Screens (Home, SessionSetup, etc.) will be created in subsequent tasks. Add temporary stub files so the app compiles:

```bash
mkdir -p src/screens
for screen in Home SessionSetup ActiveSession SessionResults StatsDashboard ReferenceSheet; do
  echo "export default function ${screen}() { return <div className='p-8'>${screen}</div> }" > src/screens/${screen}.jsx
done
```

- [ ] **Step 3: Verify app compiles and nav renders**

```bash
npm run dev
```

Open `http://localhost:5173`. Should see a dark background with bottom nav showing ⚡ Practice and 📊 Stats tabs.

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx src/components/BottomNav.jsx src/screens/
git commit -m "feat: add app shell with bottom navigation and route stubs"
```

---

## Task 9: Home Screen

**Files:**
- Create: `src/components/StreakBadge.jsx`
- Modify: `src/screens/Home.jsx`

- [ ] **Step 1: Write `src/components/StreakBadge.jsx`**

```jsx
export default function StreakBadge({ count }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-5xl font-black text-indigo-400">{count}</span>
      <span className="text-sm text-gray-400 mt-1">day streak 🔥</span>
    </div>
  )
}
```

- [ ] **Step 2: Write `src/screens/Home.jsx`**

```jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StreakBadge from '../components/StreakBadge'
import { getMeta } from '../db'

export default function Home() {
  const [streak, setStreak] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    getMeta('streak').then(s => setStreak(s?.count || 0))
  }, [])

  return (
    <div className="flex flex-col items-center px-6 pt-12 gap-8">
      <h1 className="text-2xl font-bold tracking-tight">Speed Math</h1>

      <StreakBadge count={streak} />

      <div className="w-full flex flex-col gap-3">
        <button
          onClick={() => navigate('/session/setup', { state: { mode: 'sprint' } })}
          className="w-full py-4 rounded-2xl bg-indigo-600 active:bg-indigo-700 font-semibold text-lg"
        >
          ⚡ Sprint
        </button>
        <button
          onClick={() => navigate('/session/setup', { state: { mode: 'fixed' } })}
          className="w-full py-4 rounded-2xl bg-violet-700 active:bg-violet-800 font-semibold text-lg"
        >
          📝 Fixed Count
        </button>
        <button
          onClick={() => navigate('/session/setup', { state: { mode: 'topic' } })}
          className="w-full py-4 rounded-2xl bg-purple-800 active:bg-purple-900 font-semibold text-lg"
        >
          🎯 Topic Drill
        </button>
      </div>

      <button
        onClick={() => navigate('/reference')}
        className="text-indigo-400 underline underline-offset-2 text-sm"
      >
        View Reference Sheet
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Fix the db import path in Home.jsx**

The import `from '../db'` should point to `'../db/index'` — verify it resolves. If Vite can't find it, update to `'../db/index.js'`.

- [ ] **Step 4: Verify in browser**

Open `http://localhost:5173`. Should see streak badge (0), three mode buttons, and reference link.

- [ ] **Step 5: Commit**

```bash
git add src/screens/Home.jsx src/components/StreakBadge.jsx
git commit -m "feat: add Home screen with streak and mode buttons"
```

---

## Task 10: Session Setup Screen

**Files:**
- Modify: `src/screens/SessionSetup.jsx`

- [ ] **Step 1: Write `src/screens/SessionSetup.jsx`**

```jsx
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CATEGORIES, TABLE_SUBCATEGORIES } from '../data/questionBank'
import { buildSession } from '../engine/session'
import { saveSession } from '../db'

const CATEGORY_LABELS = {
  tables: 'Tables',
  squares: 'Squares',
  cubes: 'Cubes',
  'powers-base2': 'Powers (Base 2)',
  'powers-base3': 'Powers (Base 3)',
  'powers-base4': 'Powers (Base 4)',
  'powers-base5': 'Powers (Base 5)',
  'powers-base6': 'Powers (Base 6)',
  'powers-base7': 'Powers (Base 7)',
  'powers-base8': 'Powers (Base 8)',
  'powers-base9': 'Powers (Base 9)',
  fractions: 'Fractions → %',
}

export default function SessionSetup() {
  const { state } = useLocation()
  const mode = state?.mode || 'sprint'
  const navigate = useNavigate()

  const [selectedCats, setSelectedCats] = useState(CATEGORIES)
  const [duration, setDuration] = useState(300) // seconds
  const [count, setCount] = useState(20)
  const [subcategory, setSubcategory] = useState(null)

  function toggleCat(cat) {
    setSelectedCats(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  async function startSession() {
    if (selectedCats.length === 0) return
    const session = buildSession({
      mode,
      categories: selectedCats,
      durationSec: mode === 'sprint' ? duration : null,
      count: mode === 'fixed' ? count : null,
      subcategory: mode === 'topic' ? subcategory : null,
    })
    await saveSession({ ...session, completed: false, questions: undefined })
    navigate('/session/active', { state: { session } })
  }

  return (
    <div className="flex flex-col px-6 pt-10 gap-6 pb-8">
      <button onClick={() => navigate(-1)} className="text-indigo-400 text-sm self-start">← Back</button>
      <h2 className="text-xl font-bold capitalize">{mode} Setup</h2>

      {/* Mode-specific config */}
      {mode === 'sprint' && (
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-400">Duration</label>
          <div className="flex gap-2">
            {[300, 600, 900].map(s => (
              <button key={s}
                onClick={() => setDuration(s)}
                className={`flex-1 py-3 rounded-xl font-semibold ${duration === s ? 'bg-indigo-600' : 'bg-brand-800'}`}
              >
                {s / 60} min
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === 'fixed' && (
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-400">Questions</label>
          <div className="flex gap-2">
            {[10, 20, 30, 50].map(n => (
              <button key={n}
                onClick={() => setCount(n)}
                className={`flex-1 py-3 rounded-xl font-semibold ${count === n ? 'bg-indigo-600' : 'bg-brand-800'}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === 'topic' && (
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-400">Table range (optional)</label>
          <div className="flex gap-2 flex-wrap">
            {[null, ...TABLE_SUBCATEGORIES].map(s => (
              <button key={String(s)}
                onClick={() => setSubcategory(s)}
                className={`px-4 py-2 rounded-xl text-sm font-medium ${subcategory === s ? 'bg-indigo-600' : 'bg-brand-800'}`}
              >
                {s || 'All'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category selector */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-400">Topics</label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => toggleCat(cat)}
              className={`py-3 rounded-xl text-sm font-medium text-left px-3 ${selectedCats.includes(cat) ? 'bg-indigo-700 text-white' : 'bg-brand-800 text-gray-400'}`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={startSession}
        disabled={selectedCats.length === 0}
        className="w-full py-4 rounded-2xl bg-indigo-600 disabled:opacity-40 font-bold text-lg mt-2"
      >
        Start →
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

Tap any mode button on Home. Should navigate to SessionSetup with correct mode shown, categories toggleable, and Start button active.

- [ ] **Step 3: Commit**

```bash
git add src/screens/SessionSetup.jsx
git commit -m "feat: add Session Setup screen with mode config and category picker"
```

---

## Task 11: Question Format Components

**Files:**
- Create: `src/components/TypeAnswer.jsx`
- Create: `src/components/Flashcard.jsx`
- Create: `src/components/MCQOptions.jsx`
- Create: `src/components/FeedbackFlash.jsx`
- Create: `src/components/Timer.jsx`
- Create: `src/components/ProgressBar.jsx`

- [ ] **Step 1: Write `src/components/TypeAnswer.jsx`**

```jsx
import { useState, useRef, useEffect } from 'react'

export default function TypeAnswer({ onSubmit }) {
  const [value, setValue] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    setValue('')
  }, [onSubmit]) // reset on new question

  function handleSubmit(e) {
    e.preventDefault()
    if (value.trim() === '') return
    onSubmit(value.trim())
    setValue('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-full px-6">
      <input
        ref={inputRef}
        type="number"
        inputMode="numeric"
        value={value}
        onChange={e => setValue(e.target.value)}
        className="w-full text-center text-3xl font-bold py-4 rounded-2xl bg-brand-800 border-2 border-indigo-700 focus:border-indigo-400 outline-none"
        placeholder="?"
      />
      <button
        type="submit"
        className="w-full py-4 rounded-2xl bg-indigo-600 active:bg-indigo-700 font-bold text-lg"
      >
        Submit
      </button>
    </form>
  )
}
```

- [ ] **Step 2: Write `src/components/Flashcard.jsx`**

```jsx
import { useState, useEffect } from 'react'

export default function Flashcard({ question, onRate }) {
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    setRevealed(false)
  }, [question.id])

  if (!revealed) {
    return (
      <div className="flex flex-col items-center gap-6 px-6 w-full">
        <button
          onClick={() => setRevealed(true)}
          className="w-full py-5 rounded-2xl bg-brand-800 border-2 border-indigo-700 font-semibold text-indigo-300 text-lg"
        >
          Tap to Reveal
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 px-6 w-full">
      <div className="w-full py-5 rounded-2xl bg-brand-800 text-center text-3xl font-black text-indigo-300">
        {question.answerDisplay}
      </div>
      <div className="flex gap-3 w-full">
        <button
          onClick={() => onRate(false)}
          className="flex-1 py-4 rounded-2xl bg-red-800 active:bg-red-900 font-bold"
        >
          ✗ Missed
        </button>
        <button
          onClick={() => onRate(true)}
          className="flex-1 py-4 rounded-2xl bg-green-700 active:bg-green-800 font-bold"
        >
          ✓ Got it
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Write `src/components/MCQOptions.jsx`**

```jsx
export default function MCQOptions({ options, onSelect, disabled }) {
  return (
    <div className="grid grid-cols-2 gap-3 px-6 w-full">
      {options.map((opt, i) => (
        <button
          key={i}
          onClick={() => !disabled && onSelect(opt)}
          className="py-5 rounded-2xl bg-brand-800 border-2 border-indigo-900 active:border-indigo-500 font-bold text-xl"
          disabled={disabled}
        >
          {opt.answerDisplay}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Write `src/components/FeedbackFlash.jsx`**

```jsx
import { useEffect, useState } from 'react'

export default function FeedbackFlash({ result, correctAnswer, onDone }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setVisible(true)
    const t = setTimeout(() => { setVisible(false); onDone() }, 1200)
    return () => clearTimeout(t)
  }, [result])

  if (!visible) return null

  return (
    <div className={`fixed inset-0 flex flex-col items-center justify-center z-50 pointer-events-none ${result ? 'bg-green-900/60' : 'bg-red-900/60'}`}>
      <span className="text-6xl">{result ? '✓' : '✗'}</span>
      {!result && (
        <span className="text-2xl font-bold mt-3 text-white">{correctAnswer}</span>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Write `src/components/Timer.jsx`**

```jsx
import { useEffect, useState, useRef } from 'react'

export default function Timer({ mode, durationSec, onExpire }) {
  const [elapsed, setElapsed] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    ref.current = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(ref.current)
  }, [])

  useEffect(() => {
    if (mode === 'sprint' && elapsed >= durationSec) {
      clearInterval(ref.current)
      onExpire()
    }
  }, [elapsed])

  const display = mode === 'sprint'
    ? Math.max(0, durationSec - elapsed)
    : elapsed

  const mm = String(Math.floor(display / 60)).padStart(2, '0')
  const ss = String(display % 60).padStart(2, '0')
  const warning = mode === 'sprint' && display <= 30

  return (
    <span className={`font-mono font-bold text-lg ${warning ? 'text-red-400' : 'text-indigo-300'}`}>
      {mm}:{ss}
    </span>
  )
}
```

- [ ] **Step 6: Write `src/components/ProgressBar.jsx`**

```jsx
export default function ProgressBar({ current, total }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0
  return (
    <div className="w-full flex items-center gap-3 px-6">
      <div className="flex-1 h-2 bg-brand-800 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-400 whitespace-nowrap">{current} / {total}</span>
    </div>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add src/components/
git commit -m "feat: add question format components (type, flashcard, mcq, feedback, timer, progress)"
```

---

## Task 12: Active Session Screen

**Files:**
- Create: `src/hooks/useSession.js`
- Modify: `src/screens/ActiveSession.jsx`

- [ ] **Step 1: Write `src/hooks/useSession.js`**

```js
import { useReducer, useCallback, useRef } from 'react'
import { QUESTION_BANK } from '../data/questionBank'
import { buildQuestionView, checkAnswer, buildAttempt } from '../engine/session'

const initialState = {
  currentIndex: 0,
  attempts: [],
  phase: 'question', // 'question' | 'feedback' | 'done'
  lastResult: null,
}

function reducer(state, action) {
  switch (action.type) {
    case 'ANSWER': return { ...state, phase: 'feedback', lastResult: action.result, attempts: [...state.attempts, action.attempt] }
    case 'NEXT': {
      const next = state.currentIndex + 1
      if (next >= action.total) return { ...state, phase: 'done', currentIndex: next }
      return { ...state, phase: 'question', currentIndex: next, lastResult: null }
    }
    case 'END': return { ...state, phase: 'done' }
    default: return state
  }
}

export function useSession(session) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const questionStartTime = useRef(Date.now())

  const current = session.questions[state.currentIndex]
  const view = current ? buildQuestionView(current, QUESTION_BANK) : null

  const submitAnswer = useCallback((userAnswer) => {
    if (!current || state.phase !== 'question') return
    const timeTakenMs = Date.now() - questionStartTime.current
    const correct = checkAnswer(current, userAnswer)
    const attempt = buildAttempt({ sessionId: session.id, question: current, correct, timeTakenMs, format: view.format })
    dispatch({ type: 'ANSWER', result: correct, attempt })
  }, [current, state.phase, session.id, view])

  const advance = useCallback(() => {
    questionStartTime.current = Date.now()
    dispatch({ type: 'NEXT', total: session.questions.length })
  }, [session.questions.length])

  const forceEnd = useCallback(() => dispatch({ type: 'END' }), [])

  return { state, view, submitAnswer, advance, forceEnd }
}
```

- [ ] **Step 2: Write `src/screens/ActiveSession.jsx`**

```jsx
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSession } from '../hooks/useSession'
import { saveAttempts, saveSession, getMeta, setMeta } from '../db'
import { computeNewStreak } from '../engine/streak'
import TypeAnswer from '../components/TypeAnswer'
import Flashcard from '../components/Flashcard'
import MCQOptions from '../components/MCQOptions'
import FeedbackFlash from '../components/FeedbackFlash'
import Timer from '../components/Timer'
import ProgressBar from '../components/ProgressBar'

export default function ActiveSession() {
  const { state: navState } = useLocation()
  const session = navState?.session
  const navigate = useNavigate()
  const { state, view, submitAnswer, advance, forceEnd } = useSession(session)

  useEffect(() => {
    if (state.phase === 'done') finishSession()
  }, [state.phase])

  async function finishSession() {
    await saveAttempts(state.attempts)
    await saveSession({ id: session.id, mode: session.mode, categories: session.categories, date: session.date, startTime: session.startTime, durationMs: Date.now() - session.startTime, totalQuestions: state.attempts.length, completed: true })
    const prior = await getMeta('streak')
    const today = new Date().toISOString().slice(0, 10)
    await setMeta('streak', computeNewStreak(prior, today))
    navigate('/session/results', { state: { attempts: state.attempts, session } })
  }

  if (!session || !view) return null

  return (
    <div className="flex flex-col items-center pt-8 gap-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between w-full px-6">
        <Timer mode={session.mode} durationSec={session.durationSec} onExpire={forceEnd} />
        {session.mode !== 'sprint' && (
          <ProgressBar current={state.currentIndex} total={session.questions.length} />
        )}
        <button onClick={forceEnd} className="text-gray-500 text-sm">End</button>
      </div>

      {/* Question prompt */}
      <div className="text-5xl font-black text-white text-center px-6">
        {view.question.prompt} = ?
      </div>

      {/* Format component */}
      {view.format === 'type' && <TypeAnswer onSubmit={submitAnswer} />}
      {view.format === 'flashcard' && <Flashcard question={view.question} onRate={submitAnswer} />}
      {view.format === 'mcq' && (
        <MCQOptions
          options={view.options}
          onSelect={opt => submitAnswer(opt.value)}
          disabled={state.phase === 'feedback'}
        />
      )}

      {/* Feedback overlay */}
      {state.phase === 'feedback' && (
        <FeedbackFlash
          result={state.lastResult}
          correctAnswer={view.question.answerDisplay}
          onDone={advance}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 3: Verify full drill flow in browser**

1. Go Home → Sprint → select any categories → Start
2. Answer questions — should see prompt, input, feedback flash, auto-advance
3. End session manually — should navigate to results (stub screen for now)

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useSession.js src/screens/ActiveSession.jsx
git commit -m "feat: add Active Session screen with full drill loop"
```

---

## Task 13: Session Results Screen

**Files:**
- Modify: `src/screens/SessionResults.jsx`

- [ ] **Step 1: Write `src/screens/SessionResults.jsx`**

```jsx
import { useLocation, useNavigate } from 'react-router-dom'

export default function SessionResults() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { attempts = [], session } = state || {}

  const correct = attempts.filter(a => a.correct).length
  const total = attempts.length
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
  const avgSpeed = total > 0
    ? Math.round(attempts.reduce((s, a) => s + a.timeTakenMs, 0) / total / 100) / 10
    : 0

  // Weak spots from this session: lowest accuracy by questionId
  const byQ = {}
  for (const a of attempts) {
    if (!byQ[a.questionId]) byQ[a.questionId] = { prompt: null, correct: 0, total: 0 }
    byQ[a.questionId].total++
    if (a.correct) byQ[a.questionId].correct++
  }
  const weakSpots = Object.entries(byQ)
    .filter(([, d]) => d.total >= 1)
    .map(([qid, d]) => ({ qid, accuracy: d.correct / d.total }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3)
    .map(w => w.qid)

  return (
    <div className="flex flex-col px-6 pt-10 gap-6">
      <h2 className="text-2xl font-bold text-center">Session Done</h2>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-brand-800 rounded-2xl p-4">
          <p className="text-3xl font-black text-indigo-400">{correct}/{total}</p>
          <p className="text-xs text-gray-400 mt-1">Correct</p>
        </div>
        <div className="bg-brand-800 rounded-2xl p-4">
          <p className="text-3xl font-black text-indigo-400">{accuracy}%</p>
          <p className="text-xs text-gray-400 mt-1">Accuracy</p>
        </div>
        <div className="bg-brand-800 rounded-2xl p-4">
          <p className="text-3xl font-black text-indigo-400">{avgSpeed}s</p>
          <p className="text-xs text-gray-400 mt-1">Avg Speed</p>
        </div>
      </div>

      {weakSpots.length > 0 && (
        <div className="bg-brand-800 rounded-2xl p-4">
          <p className="text-sm font-semibold text-gray-400 mb-2">Weak Spots This Session</p>
          <ul className="flex flex-col gap-1">
            {weakSpots.map(qid => (
              <li key={qid} className="text-sm text-red-300 font-mono">{qid}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-3 mt-4">
        <button
          onClick={() => navigate('/session/setup', { state: { mode: session?.mode || 'sprint' } })}
          className="flex-1 py-4 rounded-2xl bg-brand-800 font-semibold"
        >
          Retry
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex-1 py-4 rounded-2xl bg-indigo-600 font-semibold"
        >
          Home
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify end-to-end flow**

Complete a full session and check that results page shows correct score, accuracy, avg speed, and weak spots.

- [ ] **Step 3: Commit**

```bash
git add src/screens/SessionResults.jsx
git commit -m "feat: add Session Results screen with score summary and weak spots"
```

---

## Task 14: Stats Dashboard

**Files:**
- Create: `src/hooks/useStats.js`
- Create: `src/components/AccuracyBar.jsx`
- Create: `src/components/SpeedTrendChart.jsx`
- Modify: `src/screens/StatsDashboard.jsx`

- [ ] **Step 1: Write `src/hooks/useStats.js`**

```js
import { useState, useEffect } from 'react'
import { getAttempts, getSessions, getMeta } from '../db'
import { computeStats } from '../stats/compute'

export function useStats() {
  const [stats, setStats] = useState(null)
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [attempts, sessions, streakMeta] = await Promise.all([
        getAttempts(),
        getSessions(),
        getMeta('streak'),
      ])
      setStats(computeStats(attempts, sessions.filter(s => s.completed)))
      setStreak(streakMeta?.count || 0)
      setLoading(false)
    }
    load()
  }, [])

  return { stats, streak, loading }
}
```

- [ ] **Step 2: Write `src/components/AccuracyBar.jsx`**

```jsx
const LABELS = {
  tables: 'Tables', squares: 'Squares', cubes: 'Cubes',
  'powers-base2': 'Base 2', 'powers-base3': 'Base 3',
  'powers-base4': 'Base 4', 'powers-base5': 'Base 5',
  'powers-base6': 'Base 6', 'powers-base7': 'Base 7',
  'powers-base8': 'Base 8', 'powers-base9': 'Base 9',
  fractions: 'Fractions',
}

export default function AccuracyBar({ category, accuracy }) {
  const pct = Math.round((accuracy || 0) * 100)
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400 w-20 shrink-0">{LABELS[category] || category}</span>
      <div className="flex-1 h-3 bg-brand-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            backgroundColor: pct >= 80 ? '#22c55e' : pct >= 50 ? '#eab308' : '#ef4444',
          }}
        />
      </div>
      <span className="text-xs text-gray-300 w-10 text-right">{pct}%</span>
    </div>
  )
}
```

- [ ] **Step 3: Write `src/components/SpeedTrendChart.jsx`**

```jsx
export default function SpeedTrendChart({ sessionSpeeds }) {
  if (!sessionSpeeds || sessionSpeeds.length < 2) {
    return <p className="text-xs text-gray-500 text-center py-4">Need 2+ sessions to show trend</p>
  }

  const W = 300
  const H = 80
  const padding = 10
  const maxMs = Math.max(...sessionSpeeds.map(s => s.avgMs), 1)
  const pts = sessionSpeeds.map((s, i) => {
    const x = padding + (i / (sessionSpeeds.length - 1)) * (W - padding * 2)
    const y = H - padding - ((s.avgMs / maxMs) * (H - padding * 2))
    return `${x},${y}`
  })

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 80 }}>
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke="#6366f1"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {sessionSpeeds.map((s, i) => {
        const [x, y] = pts[i].split(',').map(Number)
        return <circle key={i} cx={x} cy={y} r="3" fill="#818cf8" />
      })}
    </svg>
  )
}
```

- [ ] **Step 4: Write `src/screens/StatsDashboard.jsx`**

```jsx
import { useStats } from '../hooks/useStats'
import AccuracyBar from '../components/AccuracyBar'
import SpeedTrendChart from '../components/SpeedTrendChart'
import { CATEGORIES } from '../data/questionBank'

export default function StatsDashboard() {
  const { stats, streak, loading } = useStats()

  if (loading) return <div className="flex items-center justify-center pt-20 text-gray-400">Loading…</div>

  return (
    <div className="flex flex-col px-6 pt-10 gap-6 pb-8">
      <h2 className="text-2xl font-bold">Stats</h2>

      {/* Streak */}
      <div className="bg-brand-800 rounded-2xl p-4 text-center">
        <p className="text-4xl font-black text-indigo-400">{streak}</p>
        <p className="text-sm text-gray-400 mt-1">day streak 🔥</p>
      </div>

      {/* Speed trend */}
      <div className="bg-brand-800 rounded-2xl p-4">
        <p className="text-sm font-semibold text-gray-400 mb-3">Speed Trend (avg ms/question)</p>
        <SpeedTrendChart sessionSpeeds={stats?.sessionSpeeds || []} />
      </div>

      {/* Category accuracy */}
      <div className="bg-brand-800 rounded-2xl p-4 flex flex-col gap-3">
        <p className="text-sm font-semibold text-gray-400">Accuracy by Topic</p>
        {CATEGORIES.map(cat => (
          <AccuracyBar key={cat} category={cat} accuracy={stats?.categoryAccuracy[cat] || 0} />
        ))}
      </div>

      {/* Weakest questions */}
      {stats?.weakestQuestions?.length > 0 && (
        <div className="bg-brand-800 rounded-2xl p-4">
          <p className="text-sm font-semibold text-gray-400 mb-3">Weakest Questions (3+ attempts)</p>
          <ul className="flex flex-col gap-2">
            {stats.weakestQuestions.map(q => (
              <li key={q.questionId} className="flex justify-between text-sm">
                <span className="font-mono text-red-300">{q.questionId}</span>
                <span className="text-gray-400">{Math.round(q.accuracy * 100)}% ({q.attempts} tries)</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Verify in browser**

After completing a session, go to Stats tab. Should show streak, speed chart (after 2+ sessions), accuracy bars per category, and weakest questions.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useStats.js src/components/AccuracyBar.jsx src/components/SpeedTrendChart.jsx src/screens/StatsDashboard.jsx
git commit -m "feat: add Stats Dashboard with accuracy, speed trend, and weakest questions"
```

---

## Task 15: Reference Sheet

**Files:**
- Modify: `src/screens/ReferenceSheet.jsx`

- [ ] **Step 1: Write `src/screens/ReferenceSheet.jsx`**

```jsx
import { useNavigate } from 'react-router-dom'
import { QUESTION_BANK, CATEGORIES } from '../data/questionBank'

const CATEGORY_LABELS = {
  tables: 'Tables (1–25 × 1–20)',
  squares: 'Perfect Squares (1²–25²)',
  cubes: 'Perfect Cubes (1³–12³)',
  'powers-base2': 'Powers of 2 (2¹–2¹⁵)',
  'powers-base3': 'Powers of 3 (3¹–3⁸)',
  'powers-base4': 'Powers of 4 (4¹–4⁶)',
  'powers-base5': 'Powers of 5 (5¹–5⁵)',
  'powers-base6': 'Powers of 6 (6¹–6⁴)',
  'powers-base7': 'Powers of 7 (7¹–7⁴)',
  'powers-base8': 'Powers of 8 (8¹–8⁴)',
  'powers-base9': 'Powers of 9 (9¹–9⁴)',
  fractions: 'Fractions → % (1/1–1/30)',
}

export default function ReferenceSheet() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col px-4 pt-8 pb-8 gap-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-indigo-400">← Back</button>
        <h2 className="text-xl font-bold">Reference Sheet</h2>
      </div>

      {CATEGORIES.map(cat => {
        const questions = QUESTION_BANK.filter(q => q.category === cat)
        return (
          <div key={cat} className="bg-brand-800 rounded-2xl p-4">
            <p className="text-sm font-semibold text-indigo-300 mb-3">{CATEGORY_LABELS[cat]}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {questions.map(q => (
                <div key={q.id} className="flex justify-between text-sm font-mono">
                  <span className="text-gray-300">{q.prompt}</span>
                  <span className="text-indigo-400 font-bold">{q.answerDisplay}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

Tap "View Reference Sheet" from Home. Should show all categories with their prompts and answers side by side.

- [ ] **Step 3: Run the full test suite one last time**

```bash
npx vitest run
```

Expected: All tests PASS.

- [ ] **Step 4: Verify PWA build**

```bash
npm run build
npm run preview
```

Open `http://localhost:4173` on your phone (or Chrome DevTools mobile view). Check that "Add to Home Screen" prompt appears. Verify offline works by disabling network in DevTools.

- [ ] **Step 5: Final commit**

```bash
git add src/screens/ReferenceSheet.jsx
git commit -m "feat: add Reference Sheet screen with all 617 question values"
```

---

## Self-Review Checklist

- [x] **Spec coverage:**
  - Tables (1–25 × 1–20, 500 questions) → Task 2
  - Squares, Cubes, Powers, Fractions → Task 2
  - Mixed formats (type/flashcard/MCQ) → Tasks 4, 11
  - Sprint / Fixed Count / Topic Drill modes → Tasks 6, 10
  - Deep stats (accuracy, speed trend, weakest) → Tasks 7, 14
  - Daily streak → Tasks 5, 12
  - PWA installable → Task 1, 15 (vite-plugin-pwa)
  - Reference sheet → Task 15
  - IndexedDB offline storage → Task 3

- [x] **No placeholders:** All steps contain runnable code or exact commands.

- [x] **Type consistency:**
  - `buildSession` → returns `{ id, mode, categories, questions[], startTime, date }`
  - `buildAttempt` → returns `{ id, sessionId, questionId, category, format, correct, timeTakenMs, date }`
  - `computeNewStreak(prior, today)` called in Task 12 matches definition in Task 5
  - `generateOptions(question, bank)` called in Task 6 (`session.js`) matches Task 4
  - `computeStats(attempts, sessions)` called in Task 14 matches Task 7

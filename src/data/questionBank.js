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
      const lo = Math.min(a, b), hi = Math.max(a, b)
      qs.push({
        id: `tbl-${a}x${b}`,
        factKey: `tbl-fact-${lo}x${hi}`,   // 7×8 and 8×7 share FSRS state
        category: 'tables',
        subcategory: sub,
        prompt: `${a} × ${b}`,
        answer: a * b,
        answerDisplay: String(a * b),
        speedTargetMs: 1500 + 60 * (a + b),
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
      speedTargetMs: n <= 15 ? 1500 : 2500,
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

const POWER_CONFIGS = [
  { base: 2, max: 15 },
  { base: 3, max: 8 },
  { base: 4, max: 6 },
  { base: 5, max: 5 },
  { base: 6, max: 4 },
  { base: 7, max: 4 },
  { base: 8, max: 4 },
  { base: 9, max: 4 },
]

function generatePowers() {
  const qs = []
  for (const { base, max } of POWER_CONFIGS) {
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
export const FRACTION_PCT = {
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

// ─── Reverse questions (CAT prep: tests both directions) ────────────────────

function generateSquareRoots() {
  return Array.from({ length: 25 }, (_, i) => {
    const n = i + 1
    return {
      id: `sqrt-${n}`,
      category: 'square-roots',
      subcategory: null,
      prompt: `√${n * n}`,
      answer: n,
      answerDisplay: String(n),
    }
  })
}

function generateCubeRoots() {
  return Array.from({ length: 12 }, (_, i) => {
    const n = i + 1
    return {
      id: `cbrt-${n}`,
      category: 'cube-roots',
      subcategory: null,
      prompt: `∛${n * n * n}`,
      answer: n,
      answerDisplay: String(n),
    }
  })
}

function generateLogs() {
  const qs = []
  for (const { base, max } of POWER_CONFIGS) {
    for (let exp = 1; exp <= max; exp++) {
      const result = Math.pow(base, exp)
      qs.push({
        id: `log-${base}-${exp}`,
        category: `log-base${base}`,
        subcategory: null,
        prompt: `${base}^? = ${result}`,
        answer: exp,
        answerDisplay: String(exp),
      })
    }
  }
  return qs
}

function generatePctToFrac() {
  // Skip n=1 (100% = 1/1 is trivial)
  return Array.from({ length: 29 }, (_, i) => {
    const n = i + 2
    return {
      id: `pct-${n}`,
      category: 'pct-to-frac',
      subcategory: null,
      prompt: `${FRACTION_PCT[n]} = 1/?`,
      answer: n,
      answerDisplay: String(n),
    }
  })
}

// ─── Approximation (CAT prep: estimate without exact calc, ±5% accepted) ────

// Hand-picked CAT-style problems. Mix of percent-of, multiply, divide.
// Each emits id, prompt, exact answer, rounded display, tolerance.
const APPROXIMATION_SPECS = [
  // percent of (kind, a, b)  → a% of b
  ['pct',  17,  245],
  ['pct',  23,  478],
  ['pct',  8,   537],
  ['pct',  62,  184],
  ['pct',  34,  825],
  ['pct',  9,   678],
  ['pct',  19,  384],
  ['pct',  46,  217],
  ['pct',  31,  692],
  ['pct',  7,   1450],
  // multiply: a × b
  ['mul',  47,  89],
  ['mul',  73,  28],
  ['mul',  152, 38],
  ['mul',  64,  71],
  ['mul',  89,  91],
  ['mul',  126, 47],
  ['mul',  213, 19],
  ['mul',  342, 27],
  ['mul',  56,  124],
  ['mul',  78,  132],
  // divide: a ÷ b
  ['div',  1247, 13],
  ['div',  893,  17],
  ['div',  2456, 41],
  ['div',  5234, 67],
  ['div',  7892, 89],
  ['div',  3417, 23],
  ['div',  1856, 32],
  ['div',  9876, 73],
  ['div',  4523, 47],
  ['div',  6789, 81],
]

function generateApproximations() {
  return APPROXIMATION_SPECS.map(([kind, a, b]) => {
    let exact, prompt
    if (kind === 'pct') { exact = (a / 100) * b; prompt = `${a}% of ${b}` }
    if (kind === 'mul') { exact = a * b;         prompt = `${a} × ${b}` }
    if (kind === 'div') { exact = a / b;         prompt = `${a} ÷ ${b}` }
    return {
      id: `approx-${kind}-${a}-${b}`,
      category: 'approximation',
      subcategory: kind,
      prompt,
      answer: exact,
      answerDisplay: String(Math.round(exact)),
      tolerance: 0.05,
    }
  })
}

export const QUESTION_BANK = [
  ...generateTables(),
  ...generateSquares(),
  ...generateCubes(),
  ...generatePowers(),
  ...generateFractions(),
  ...generateSquareRoots(),
  ...generateCubeRoots(),
  ...generateLogs(),
  ...generatePctToFrac(),
  ...generateApproximations(),
]

export const CATEGORIES = [
  // Forward
  'tables', 'squares', 'cubes',
  'powers-base2', 'powers-base3', 'powers-base4', 'powers-base5',
  'powers-base6', 'powers-base7', 'powers-base8', 'powers-base9',
  'fractions',
  // Reverse
  'square-roots', 'cube-roots',
  'log-base2', 'log-base3', 'log-base4', 'log-base5',
  'log-base6', 'log-base7', 'log-base8', 'log-base9',
  'pct-to-frac',
  // Approximation
  'approximation',
]

export const TABLE_SUBCATEGORIES = ['1-10', '11-20', '21-25']

// Format per category — determines how questions are presented
export const CATEGORY_FORMAT = {
  tables: 'type',
  squares: 'mcq',
  cubes: 'mcq',
  'powers-base2': 'mcq',
  'powers-base3': 'mcq',
  'powers-base4': 'mcq',
  'powers-base5': 'mcq',
  'powers-base6': 'mcq',
  'powers-base7': 'mcq',
  'powers-base8': 'mcq',
  'powers-base9': 'mcq',
  fractions: 'mcq',
  'square-roots': 'mcq',
  'cube-roots': 'mcq',
  'log-base2': 'mcq',
  'log-base3': 'mcq',
  'log-base4': 'mcq',
  'log-base5': 'mcq',
  'log-base6': 'mcq',
  'log-base7': 'mcq',
  'log-base8': 'mcq',
  'log-base9': 'mcq',
  'pct-to-frac': 'mcq',
  'approximation': 'approx',
}

export function getByCategory(category, subcategory = null) {
  return QUESTION_BANK.filter(
    q => q.category === category && (subcategory === null || q.subcategory === subcategory)
  )
}

export { shuffle }

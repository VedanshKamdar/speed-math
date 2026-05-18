import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { QUESTION_BANK, CATEGORIES } from '../data/questionBank'
import { IconArrowLeft, IconChevronDown } from '../components/Icons'

const CATEGORY_LABELS = {
  tables: 'Tables',
  squares: 'Squares',
  cubes: 'Cubes',
  'powers-base2': 'Powers · 2',
  'powers-base3': 'Powers · 3',
  'powers-base4': 'Powers · 4',
  'powers-base5': 'Powers · 5',
  'powers-base6': 'Powers · 6',
  'powers-base7': 'Powers · 7',
  'powers-base8': 'Powers · 8',
  'powers-base9': 'Powers · 9',
  fractions: 'Fractions → %',
}

const CATEGORY_SUBTITLES = {
  tables: '1–25 × 1–20',
  squares: '1² → 25²',
  cubes: '1³ → 12³',
  'powers-base2': '2¹ → 2¹⁵',
  'powers-base3': '3¹ → 3⁸',
  'powers-base4': '4¹ → 4⁶',
  'powers-base5': '5¹ → 5⁵',
  'powers-base6': '6¹ → 6⁴',
  'powers-base7': '7¹ → 7⁴',
  'powers-base8': '8¹ → 8⁴',
  'powers-base9': '9¹ → 9⁴',
  fractions: '1/1 → 1/30',
}

// Tables get a sub-grouping by base (table of 2, table of 3 …) for legibility.
function groupQuestions(cat, qs) {
  if (cat === 'tables') {
    const map = new Map()
    for (const q of qs) {
      const base = parseInt(q.prompt.split(/[×x]/)[0].trim(), 10)
      if (!map.has(base)) map.set(base, [])
      map.get(base).push(q)
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([base, list]) => ({ heading: `Table of ${base}`, items: list }))
  }
  return [{ heading: null, items: qs }]
}

export default function ReferenceSheet() {
  const navigate = useNavigate()
  const [active, setActive] = useState('tables')
  const [openGroups, setOpenGroups] = useState(new Set())

  const grouped = useMemo(() => {
    const qs = QUESTION_BANK.filter(q => q.category === active)
    return groupQuestions(active, qs)
  }, [active])

  function toggleGroup(heading) {
    setOpenGroups(prev => {
      const next = new Set(prev)
      next.has(heading) ? next.delete(heading) : next.add(heading)
      return next
    })
  }

  function handleCategoryChange(cat) {
    setActive(cat)
    setOpenGroups(new Set())
  }

  return (
    <div className="flex flex-col" style={{ padding: '12px 20px 88px' }}>
      {/* Header */}
      <header className="flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="icon-btn" aria-label="Back">
          <IconArrowLeft size={16} />
        </button>
        <span className="eyebrow">Reference · 617</span>
        <div style={{ width: 36 }} />
      </header>

      {/* Title */}
      <h2 className="serif" style={{ fontSize: 32, lineHeight: 1.05, margin: '18px 0 4px' }}>
        Reference.
      </h2>
      <p style={{ fontSize: 12, color: 'var(--color-fg-muted)', margin: 0 }}>
        Every value, grouped. Works offline.
      </p>

      {/* Category strip */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          marginTop: 16,
          overflowX: 'auto',
          paddingBottom: 6,
          marginLeft: -20,
          marginRight: -20,
          paddingLeft: 20,
          paddingRight: 20,
        }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`chip ${active === cat ? 'is-on' : ''}`}
            style={{ whiteSpace: 'nowrap' }}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Section header */}
      <div className="flex justify-between items-baseline" style={{ marginTop: 18 }}>
        <span className="serif" style={{ fontSize: 22 }}>{CATEGORY_LABELS[active]}</span>
        <span className="mono" style={{ fontSize: 11, color: 'var(--color-fg-muted)' }}>
          {CATEGORY_SUBTITLES[active]}
        </span>
      </div>

      {/* Body */}
      {grouped.map(({ heading, items }) => {
        const isAccordion = heading !== null
        const isOpen = !isAccordion || openGroups.has(heading)

        return (
          <section key={heading || '_'} style={{ marginTop: isAccordion ? 0 : 12 }}>
            {isAccordion ? (
              <button
                onClick={() => toggleGroup(heading)}
                className="flex justify-between items-center w-full"
                style={{
                  padding: '13px 0',
                  borderBottom: '1px solid var(--color-line)',
                  background: 'none',
                  border: 'none',
                  borderBottom: '1px solid var(--color-line)',
                  cursor: 'pointer',
                  color: 'var(--color-fg)',
                  width: '100%',
                }}
              >
                <span className="eyebrow" style={{ letterSpacing: '0.1em' }}>{heading}</span>
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--color-fg-muted)',
                  transition: 'transform 0.2s',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}>
                  <IconChevronDown size={14} />
                </span>
              </button>
            ) : null}

            {isOpen && (
              <ul style={{ borderTop: isAccordion ? 0 : '1px solid var(--color-line)' }}>
                {items.map((q) => (
                  <li
                    key={q.id}
                    className="flex justify-between items-baseline"
                    style={{
                      padding: '9px 0',
                      borderBottom: '1px solid var(--color-line)',
                    }}
                  >
                    <span className="mono" style={{ fontSize: 13, color: 'var(--color-fg-muted)' }}>
                      {q.prompt}
                    </span>
                    <span className="num" style={{ fontSize: 22 }}>{q.answerDisplay}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </div>
  )
}

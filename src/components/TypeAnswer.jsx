import { useState } from 'react'
import { IconArrowRight } from './Icons'

function IconBackspace({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 7H9l-6 5 6 5h12V7Z" />
      <path d="m13 11 4 4M17 11l-4 4" />
    </svg>
  )
}

const ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['⌫', '0', '→'],
]

export default function TypeAnswer({ onSubmit }) {
  const [value, setValue] = useState('')

  function handleKey(k) {
    if (k === '⌫') {
      setValue(v => v.slice(0, -1))
    } else if (k === '→') {
      if (!value) return
      onSubmit(value)
      setValue('')
    } else {
      if (value.length >= 6) return
      setValue(v => v + k)
    }
  }

  const isSubmit = (k) => k === '→'
  const isBack   = (k) => k === '⌫'

  return (
    <div style={{ padding: '0 16px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* Answer display */}
      <div
        className="num"
        style={{
          textAlign: 'center',
          fontSize: 52,
          lineHeight: 1,
          minHeight: 68,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-surface)',
          border: `1px solid ${value ? 'var(--color-accent)' : 'var(--color-line)'}`,
          borderRadius: 16,
          padding: '10px 16px',
          color: value ? 'var(--color-fg)' : 'var(--color-fg-dim)',
          transition: 'border-color 0.15s',
          letterSpacing: '0.04em',
        }}
      >
        {value || '—'}
      </div>

      {/* Keypad */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {ROWS.flat().map((k, i) => {
          const submit  = isSubmit(k)
          const back    = isBack(k)
          const disabled = submit && !value

          return (
            <button
              key={i}
              onClick={() => handleKey(k)}
              disabled={disabled}
              style={{
                height: 64,
                borderRadius: 16,
                border: `1px solid ${submit ? 'transparent' : 'var(--color-line)'}`,
                background: submit
                  ? (value ? 'var(--color-fg)' : 'var(--color-surface)')
                  : back
                  ? 'var(--color-surface)'
                  : 'var(--color-surface-2)',
                color: submit
                  ? (value ? 'var(--color-bg)' : 'var(--color-fg-dim)')
                  : 'var(--color-fg)',
                fontSize: 26,
                fontFamily: back ? 'inherit' : 'var(--font-display)',
                cursor: disabled ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.1s, color 0.1s, transform 0.07s',
                WebkitTapHighlightColor: 'transparent',
                userSelect: 'none',
              }}
              onPointerDown={e => { if (!disabled) e.currentTarget.style.transform = 'scale(0.93)' }}
              onPointerUp={e   => { e.currentTarget.style.transform = '' }}
              onPointerLeave={e => { e.currentTarget.style.transform = '' }}
            >
              {submit ? <IconArrowRight size={22} sw={2} /> : back ? <IconBackspace /> : k}
            </button>
          )
        })}
      </div>
    </div>
  )
}

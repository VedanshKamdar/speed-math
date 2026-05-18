import { useState, useRef, useEffect } from 'react'
import { IconArrowRight } from './Icons'

export default function TypeAnswer({ onSubmit }) {
  const [value, setValue] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    setValue('')
  }, [onSubmit])

  function handleSubmit(e) {
    e.preventDefault()
    if (value.trim() === '') return
    onSubmit(value.trim())
    setValue('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 w-full"
      style={{ padding: '0 20px' }}
    >
      <input
        ref={inputRef}
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="?"
        className="num"
        style={{
          width: '100%',
          textAlign: 'center',
          fontSize: 48,
          lineHeight: 1.2,
          padding: '18px 12px',
          borderRadius: 16,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-line)',
          color: 'var(--color-fg)',
          outline: 'none',
          fontFamily: 'var(--font-display)',
          fontVariantNumeric: 'tabular-nums',
        }}
        onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
        onBlur={(e)  => (e.target.style.borderColor = 'var(--color-line)')}
      />
      <button type="submit" disabled={value.trim() === ''} className="btn-primary">
        Submit <IconArrowRight size={16} sw={1.8} />
      </button>
    </form>
  )
}

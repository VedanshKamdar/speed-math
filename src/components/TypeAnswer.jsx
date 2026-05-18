import { useState, useRef, useEffect } from 'react'

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
      <button type="submit"
        className="w-full py-4 rounded-2xl bg-indigo-600 active:bg-indigo-700 font-bold text-lg">
        Submit
      </button>
    </form>
  )
}

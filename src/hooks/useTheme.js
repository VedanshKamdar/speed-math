import { useState } from 'react'

export function useTheme() {
  const [isDark, setIsDark] = useState(
    () => document.documentElement.dataset.theme !== 'light'
  )

  function toggleTheme() {
    const next = isDark ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    localStorage.setItem('theme', next)
    setIsDark(!isDark)
  }

  return { isDark, toggleTheme }
}

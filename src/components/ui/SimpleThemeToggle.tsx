'use client'

import { useSimpleTheme } from '@/components/providers/SimpleThemeProvider'
import { Button } from "@/components/ui/button"
import { Sun, Moon } from "lucide-react"

export function SimpleThemeToggle() {
  const { theme, setTheme } = useSimpleTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="h-8 w-8 rounded-full"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  )
} 
"use client"

import { RiMoonFill, RiSunLine } from "@remixicon/react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

const ToggleThemeButton = () => {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle color theme"
      title="Toggle color theme"
    >
      <RiSunLine size={18} className="hidden dark:block" />
      <RiMoonFill size={18} className="block dark:hidden" />
    </Button>
  )
}

export default ToggleThemeButton

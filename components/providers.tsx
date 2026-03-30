"use client"

import { useEffect, useState } from "react"
import { Provider } from "react-redux"
import { ThemeProvider } from "next-themes"

import { Toaster } from "@/components/ui/sonner"
import { bootstrapAuth } from "@/lib/store/auth-store"
import { createAppStore, type AppStore } from "@/lib/store"
import type { User } from "@/types/auth.types"

export default function Providers({
  children,
  initialUser,
}: {
  children: React.ReactNode
  initialUser: User | null
}) {
  const [store] = useState<AppStore>(() => createAppStore(initialUser))

  useEffect(() => {
    void store.dispatch(bootstrapAuth({ initialUser }))
  }, [initialUser, store])

  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="system" storageKey="af-theme" enableSystem>
        {children}
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </Provider>
  )
}

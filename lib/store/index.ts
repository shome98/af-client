"use client"

import { configureStore } from "@reduxjs/toolkit"

import { authReducer } from "@/lib/store/auth-store"
import type { User } from "@/types/auth.types"

export function createAppStore(initialUser: User | null) {
  const preloadedState = {
    auth: {
      user: initialUser,
      isAuthenticated: Boolean(initialUser),
      isHydrated: false,
      isBootstrapping: true,
      bootstrapRequestId: null,
      error: null,
      guestSession: {
        guestId: null,
        hasData: false,
        initialized: false,
      },
    },
  }

  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState,
  })
}

export type AppStore = ReturnType<typeof createAppStore>
export type RootState = ReturnType<AppStore["getState"]>
export type AppDispatch = AppStore["dispatch"]

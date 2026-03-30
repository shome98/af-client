"use client"

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

import { authApi, guestApi } from "@/lib/actions/auth-api"
import type { GuestDataResponse, LoginPayload, RegisterPayload, User } from "@/types/auth.types"

export interface GuestSessionState {
  guestId: string | null
  hasData: boolean
  initialized: boolean
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isHydrated: boolean
  isBootstrapping: boolean
  bootstrapRequestId: string | null
  guestSession: GuestSessionState
  error: string | null
}

export interface BootstrapPayload {
  initialUser: User | null
}

async function resolveGuestSession(): Promise<GuestSessionState> {
  try {
    const response = await guestApi.getData()
    const data = response.data as GuestDataResponse | null
    const hasData = Boolean(data?.data && Object.keys(data.data).length > 0)

    if (data?.guestId || data?.data !== null) {
      return {
        guestId: data?.guestId ?? null,
        hasData,
        initialized: true,
      }
    }
  } catch {
    // Fall through to guest initialization when there is no existing session.
  }

  const response = await guestApi.init()
  const guestPayload = response.data

  return {
    guestId: guestPayload?.guestId ?? null,
    hasData: Boolean(guestPayload?.data && Object.keys(guestPayload.data).length > 0),
    initialized: true,
  }
}

export const bootstrapAuth = createAsyncThunk(
  "auth/bootstrap",
  async ({ initialUser }: BootstrapPayload) => {
    if (initialUser) {
      return {
        user: initialUser,
        guestSession: {
          guestId: null,
          hasData: false,
          initialized: false,
        } satisfies GuestSessionState,
      }
    }

    try {
      // Match the working legacy client behavior: bootstrap through /auth/me
      // on the client so the response interceptor can silently refresh first.
      const response = await authApi.getMe()
      const user = response.data?.user ?? null

      if (user) {
        return {
          user,
          guestSession: {
            guestId: null,
            hasData: false,
            initialized: false,
          } satisfies GuestSessionState,
        }
      }
    } catch {
      // Fall through to guest bootstrap if the refresh path cannot recover.
    }

    const guestSession = await resolveGuestSession()

    return {
      user: null,
      guestSession,
    }
  }
)

export const loginUser = createAsyncThunk("auth/login", async (payload: LoginPayload) => {
  await authApi.login(payload)

  const response = await authApi.getMe()

  return response.data?.user ?? null
})

export const registerUser = createAsyncThunk(
  "auth/register",
  async (payload: RegisterPayload) => {
    await authApi.register(payload)

    const response = await authApi.getMe()

    return response.data?.user ?? null
  }
)

export const refreshUser = createAsyncThunk("auth/refreshUser", async () => {
  const response = await authApi.getMe()
  return response.data?.user ?? null
})

export const ensureGuestSession = createAsyncThunk("auth/ensureGuestSession", async () => {
  return resolveGuestSession()
})

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  try {
    await authApi.logout()
  } catch {
    // Best-effort logout keeps the UI moving even if the server already cleared cookies.
  }

  const guestSession = await resolveGuestSession()

  return guestSession
})

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isHydrated: false,
  isBootstrapping: true,
  bootstrapRequestId: null,
  guestSession: {
    guestId: null,
    hasData: false,
    initialized: false,
  },
  error: null,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.pending, (state, action) => {
        state.isBootstrapping = true
        state.bootstrapRequestId = action.meta.requestId
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        if (state.bootstrapRequestId !== action.meta.requestId) {
          return
        }

        state.user = action.payload.user
        state.isAuthenticated = Boolean(action.payload.user)
        state.isHydrated = true
        state.isBootstrapping = false
        state.bootstrapRequestId = null
        state.guestSession = action.payload.guestSession
        state.error = null
      })
      .addCase(bootstrapAuth.rejected, (state, action) => {
        if (state.bootstrapRequestId !== action.meta.requestId) {
          return
        }

        state.isHydrated = true
        state.isBootstrapping = false
        state.bootstrapRequestId = null
        state.error = action.error.message ?? "Failed to bootstrap auth."
      })
      .addCase(loginUser.pending, (state) => {
        state.isBootstrapping = false
        state.bootstrapRequestId = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload
        state.isAuthenticated = Boolean(action.payload)
        state.isHydrated = true
        state.isBootstrapping = false
        state.bootstrapRequestId = null
        state.guestSession = {
          guestId: null,
          hasData: false,
          initialized: false,
        }
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isBootstrapping = false
        state.bootstrapRequestId = null
        state.error = action.error.message ?? "Login failed."
      })
      .addCase(registerUser.pending, (state) => {
        state.isBootstrapping = false
        state.bootstrapRequestId = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload
        state.isAuthenticated = Boolean(action.payload)
        state.isHydrated = true
        state.isBootstrapping = false
        state.bootstrapRequestId = null
        state.guestSession = {
          guestId: null,
          hasData: false,
          initialized: false,
        }
        state.error = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isBootstrapping = false
        state.bootstrapRequestId = null
        state.error = action.error.message ?? "Registration failed."
      })
      .addCase(refreshUser.fulfilled, (state, action) => {
        state.user = action.payload
        state.isAuthenticated = Boolean(action.payload)
        state.error = null
      })
      .addCase(refreshUser.rejected, (state) => {
        state.user = null
        state.isAuthenticated = false
      })
      .addCase(ensureGuestSession.fulfilled, (state, action) => {
        state.guestSession = action.payload
      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.user = null
        state.isAuthenticated = false
        state.isHydrated = true
        state.isBootstrapping = false
        state.bootstrapRequestId = null
        state.guestSession = action.payload
        state.error = null
      })
  },
})

export const { clearAuthError } = authSlice.actions
export const authReducer = authSlice.reducer

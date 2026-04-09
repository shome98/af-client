export interface ValidationError {
    field: string
    message: string
}

export interface AuthApiResponse<T = unknown> {
    success: boolean
    statusCode: number
    message: string
    data: T | null
    errors?: ValidationError[] | null
    timestamp: string
}

/** Fields returned by GET /auth/me, POST /auth/login, POST /auth/register */
export interface User {
    id: string
    email: string
    name: string | null
    image: string | null
    role: 'user' | 'admin'
    emailVerified: boolean
}

/** Fields returned by GET /user/profile (superset of User) */
export interface ProfileUser extends User {
    createdAt: string
}

export interface LoginActivity {
    id: string
    userId: string
    ipAddress: string | null
    userAgent: string | null
    success: boolean
    createdAt: string
}

export interface GuestData {
    guestId: string
    data: Record<string, unknown>
}

/** GET /api/guest/data response — guestId may be absent when no session */
export interface GuestDataResponse {
    guestId?: string
    data: Record<string, unknown> | null
}

/** Partial user returned by PATCH /admin/users/:id/role */
export interface AdminUser {
    id: string
    email: string
    name: string | null
    role: 'user' | 'admin'
}

// ── Request payloads ────────────────────────────────────
export interface RegisterPayload {
    email: string
    password: string
    name?: string
}

export interface LoginPayload {
    email: string
    password: string
}

export interface ForgotPasswordPayload {
    email: string
}

export interface ResetPasswordPayload {
    token: string
    password: string
}

export interface VerifyEmailPayload {
    token: string
}

export interface ResendVerificationPayload {
    email: string
}

export interface UpdateProfilePayload {
    name?: string
    image?: string | null
}

export interface ChangePasswordPayload {
    currentPassword: string
    newPassword: string
}

export interface UpdateRolePayload {
    role: 'user' | 'admin'
}

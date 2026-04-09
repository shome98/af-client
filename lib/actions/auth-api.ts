import axios, {
    AxiosError,
    type AxiosInstance,
    type AxiosRequestConfig,
} from 'axios'

import type {
    AuthApiResponse,
    ValidationError,
    User,
    ProfileUser,
    AdminUser,
    LoginActivity,
    GuestData,
    GuestDataResponse,
    RegisterPayload,
    LoginPayload,
    ForgotPasswordPayload,
    ResetPasswordPayload,
    VerifyEmailPayload,
    ResendVerificationPayload,
    UpdateProfilePayload,
    ChangePasswordPayload,
    UpdateRolePayload,
} from '@/types/auth.types';

const AUTH_API_BASE_URL = process.env.NEXT_PUBLIC_AUTH_API_BASE_URL;

if (!AUTH_API_BASE_URL) {
    throw new Error(
        'Missing auth API base URL. Set NEXT_PUBLIC_AUTH_API_BASE_URL.'
    )
}

const BASE = `${AUTH_API_BASE_URL.replace(/\/+$/, '')}/api`

export class AuthApiError extends Error {
    statusCode: number
    errors?: ValidationError[]

    constructor(message: string, statusCode: number, errors?: ValidationError[]) {
        super(message)
        this.statusCode = statusCode
        this.errors = errors
    }
}

// 🚀 AXIOS INSTANCE

const apiClient: AxiosInstance = axios.create({
    baseURL: BASE,
    withCredentials: true,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// 🔁 TOKEN REFRESH QUEUE

let isRefreshing = false

let failedQueue: Array<{
    resolve: (value?: unknown) => void
    reject: (error?: unknown) => void
}> = []

const processQueue = (error: unknown, success: boolean) => {
    failedQueue.forEach((p) => {
        if (success) p.resolve(true)
        else p.reject(error)
    })
    failedQueue = []
}

const refreshToken = async (): Promise<void> => {
    try {
        await axios.post(`${BASE}/auth/refresh`, {}, {withCredentials: true})
    } catch (error) {
        if (error instanceof AuthApiError) {
            throw error
        }

        if (axios.isAxiosError<AuthApiResponse>(error)) {
            const data = error.response?.data

            throw new AuthApiError(
                data?.message || error.message,
                data?.statusCode || error.response?.status || 500,
                data?.errors ?? undefined
            )
        }

        throw new AuthApiError('Failed to refresh session.', 500)
    }
}

// ⚡ RESPONSE INTERCEPTOR

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<AuthApiResponse>) => {
        const originalRequest = error.config as AxiosRequestConfig & {
            _retry?: boolean
        }

        const status = error.response?.status ?? error.response?.data?.statusCode

        const NO_REFRESH_PATHS = ['/auth/login', '/auth/refresh']

        if (
            status === 401 &&
            !originalRequest._retry &&
            !NO_REFRESH_PATHS.some((p) => originalRequest.url?.includes(p))
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({resolve, reject})
                }).then(() => apiClient(originalRequest))
            }

            originalRequest._retry = true
            isRefreshing = true

            try {
                await refreshToken()
                processQueue(null, true)
                return apiClient(originalRequest)
            } catch (refreshError) {
                processQueue(refreshError, false)
                throw refreshError
            } finally {
                isRefreshing = false
            }
        }

        const data = error.response?.data

        throw new AuthApiError(
            data?.message || error.message,
            data?.statusCode || error.response?.status || 500,
            data?.errors ?? undefined
        )
    }
)

export async function authRequest<T>(
    config: AxiosRequestConfig
): Promise<AuthApiResponse<T>> {
    const response = await apiClient.request<AuthApiResponse<T>>(config)

    const data = response.data

    if (!data.success) {
        throw new AuthApiError(
            data.message,
            data.statusCode,
            data.errors ?? undefined
        )
    }

    return data
}

export const authApi = {
    register: (data: RegisterPayload) =>
        authRequest<{ user: User }>({
            url: '/auth/register',
            method: 'POST',
            data,
        }),

    login: (data: LoginPayload) =>
        authRequest<{ user: User }>({
            url: '/auth/login',
            method: 'POST',
            data,
        }),

    refresh: () =>
        authRequest<null>({
            url: '/auth/refresh',
            method: 'POST',
        }),

    logout: () =>
        authRequest<null>({
            url: '/auth/logout',
            method: 'POST',
        }),

    getMe: () =>
        authRequest<{ user: User }>({
            url: '/auth/me',
        }),

    verifyEmail: (data: VerifyEmailPayload) =>
        authRequest<null>({
            url: '/auth/verify-email',
            method: 'POST',
            data,
        }),

    resendVerification: (data: ResendVerificationPayload) =>
        authRequest<null>({
            url: '/auth/resend-verification',
            method: 'POST',
            data,
        }),

    forgotPassword: (data: ForgotPasswordPayload) =>
        authRequest<null>({
            url: '/auth/forgot-password',
            method: 'POST',
            data,
        }),

    resetPassword: (data: ResetPasswordPayload) =>
        authRequest<null>({
            url: '/auth/reset-password',
            method: 'POST',
            data,
        }),

    googleAuth: () => {
        if (typeof window === 'undefined') {
            throw new AuthApiError(
                'Google auth redirect must be started from the browser.',
                500
            )
        }

        window.location.href = `${BASE}/auth/google`
    },
}

// 👤 USER API

export const userApi = {
    getProfile: () =>
        authRequest<{ user: ProfileUser }>({
            url: '/user/profile',
        }),

    updateProfile: (data: UpdateProfilePayload) =>
        authRequest<{ user: User }>({
            url: '/user/profile',
            method: 'PATCH',
            data,
        }),

    changePassword: (data: ChangePasswordPayload) =>
        authRequest<null>({
            url: '/user/password',
            method: 'PATCH',
            data,
        }),

    deleteAccount: () =>
        authRequest<null>({
            url: '/user/account',
            method: 'DELETE',
        }),
}

// 🛠 ADMIN API

export const adminApi = {
    updateRole: (userId: string, data: UpdateRolePayload) =>
        authRequest<{ user: AdminUser }>({
            url: `/admin/users/${userId}/role`,
            method: 'PATCH',
            data,
        }),

    blockUser: (userId: string) =>
        authRequest<null>({
            url: `/admin/users/${userId}/block`,
            method: 'PATCH',
        }),

    unblockUser: (userId: string) =>
        authRequest<null>({
            url: `/admin/users/${userId}/unblock`,
            method: 'PATCH',
        }),

    getLoginActivity: (userId: string) =>
        authRequest<{ activity: LoginActivity[] }>({
            url: `/admin/users/${userId}/activity`,
        }),
}

// 👥 GUEST API

export const guestApi = {
    init: () =>
        authRequest<GuestData>({
            url: '/guest/init',
            method: 'POST',
        }),

    getData: () =>
        authRequest<GuestDataResponse>({
            url: '/guest/data',
        }),

    updateData: (data: Record<string, unknown>) =>
        authRequest<GuestData>({
            url: '/guest/data',
            method: 'PATCH',
            data,
        }),
}

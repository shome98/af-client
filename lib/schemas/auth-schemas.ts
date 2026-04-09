import { z } from "zod"

const passwordRule = z
  .string()
  .min(8, { message: "Password must be at least 8 characters." })
  .regex(/[a-z]/, { message: "Password must include a lowercase letter." })
  .regex(/[A-Z]/, { message: "Password must include an uppercase letter." })
  .regex(/[0-9]/, { message: "Password must include a number." })
  .regex(/[^a-zA-Z0-9]/, {
    message: "Password must include a special character.",
  })

export const loginSchema = z.object({
  email: z.email({ message: "Enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
})

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .max(80, { message: "Name must be 80 characters or fewer." })
    .optional()
    .or(z.literal("")),
  email: z.email({ message: "Enter a valid email address." }),
  password: passwordRule,
})

export const forgotPasswordSchema = z.object({
  email: z.email({ message: "Enter a valid email address." }),
})

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(1, { message: "Reset token is required." }),
  password: passwordRule,
})

export const verifyEmailSchema = z.object({
  token: z
    .string()
    .trim()
    .min(1, { message: "Verification token is required." }),
})

export const resendVerificationSchema = z.object({
  email: z.email({ message: "Enter a valid email address." }),
})

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .max(80, { message: "Name must be 80 characters or fewer." })
    .optional()
    .or(z.literal("")),
  image: z
    .union([
      z.url({ message: "Enter a valid image URL." }),
      z.literal(""),
      z.null(),
      z.undefined(),
    ])
    .optional(),
})

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, { message: "Current password is required." }),
  newPassword: passwordRule,
})

export const adminRoleSchema = z.object({
  userId: z.string().trim().min(1, { message: "User ID is required." }),
  role: z.enum(["user", "admin"]),
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
export type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>
export type ResendVerificationFormValues = z.infer<typeof resendVerificationSchema>
export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
export type AdminRoleFormValues = z.infer<typeof adminRoleSchema>

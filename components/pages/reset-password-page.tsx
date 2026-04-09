"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { AuthShell } from "@/components/auth/auth-shell"
import { FormErrorAlert, FormInfoAlert } from "@/components/auth/form-messages"
import { Button } from "@/components/ui/button"
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authApi } from "@/lib/actions/auth-api"
import { getApiErrorMessage } from "@/lib/auth/error-helpers"
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/lib/schemas/auth-schemas"

export function ResetPasswordPage({ initialToken }: { initialToken: string }) {
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: initialToken,
      password: "",
    },
  })

  const onSubmit = async (values: ResetPasswordFormValues) => {
    form.clearErrors("root")

    try {
      await authApi.resetPassword(values)
      toast.success("Password reset successfully.")
    } catch (error) {
      form.setError("root", {
        type: "server",
        message: getApiErrorMessage(error, "Failed to reset password."),
      })
      throw error
    }
  }

  return (
    <AuthShell
      title="Reset password"
      description="Use the reset token from your email and choose a new password."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-foreground hover:underline">
            Back to login
          </Link>
        </p>
      }
    >
      {form.formState.isSubmitSuccessful ? (
        <FormInfoAlert title="Password updated" message="Your password has been reset. You can now sign back in." />
      ) : (
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormErrorAlert message={form.formState.errors.root?.message} />

          <Field>
            <FieldLabel htmlFor="token">Reset token</FieldLabel>
            <FieldContent>
              <Input id="token" placeholder="Paste your token" {...form.register("token")} />
              <FieldError errors={[form.formState.errors.token]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="password">New password</FieldLabel>
            <FieldContent>
              <Input id="password" type="password" placeholder="Enter a new password" {...form.register("password")} />
              <FieldDescription>Use at least 8 characters with upper, lower, number, and special character.</FieldDescription>
              <FieldError errors={[form.formState.errors.password]} />
            </FieldContent>
          </Field>

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Resetting..." : "Reset password"}
          </Button>
        </form>
      )}
    </AuthShell>
  )
}

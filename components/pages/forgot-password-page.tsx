"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { AuthShell } from "@/components/auth/auth-shell"
import { FormErrorAlert, FormInfoAlert } from "@/components/auth/form-messages"
import { Button } from "@/components/ui/button"
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authApi } from "@/lib/actions/auth-api"
import { getApiErrorMessage } from "@/lib/auth/error-helpers"
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/lib/schemas/auth-schemas"

export function ForgotPasswordPage() {
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const sentEmail = form.formState.isSubmitSuccessful ? form.getValues("email") : ""

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    form.clearErrors("root")

    try {
      await authApi.forgotPassword(values)
      toast.success("Reset link sent.")
    } catch (error) {
      form.setError("root", {
        type: "server",
        message: getApiErrorMessage(error, "Failed to request a reset link."),
      })
      throw error
    }
  }

  return (
    <AuthShell
      title="Forgot password"
      description="Enter your email and we&apos;ll send you a reset link."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-foreground hover:underline">
            Back to login
          </Link>
        </p>
      }
    >
      {form.formState.isSubmitSuccessful ? (
        <FormInfoAlert
          title="Check your email"
          message={`If an account exists for ${sentEmail}, a password reset link has been sent.`}
        />
      ) : (
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormErrorAlert message={form.formState.errors.root?.message} />

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <FieldContent>
              <Input id="email" type="email" placeholder="you@example.com" {...form.register("email")} />
              <FieldError errors={[form.formState.errors.email]} />
            </FieldContent>
          </Field>

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Sending..." : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthShell>
  )
}

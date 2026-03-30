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
import { resendVerificationSchema, type ResendVerificationFormValues } from "@/lib/schemas/auth-schemas"

export function ResendVerificationPage() {
  const form = useForm<ResendVerificationFormValues>({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (values: ResendVerificationFormValues) => {
    form.clearErrors("root")

    try {
      await authApi.resendVerification(values)
      toast.success("Verification email sent.")
    } catch (error) {
      form.setError("root", {
        type: "server",
        message: getApiErrorMessage(error, "Failed to resend verification email."),
      })
      throw error
    }
  }

  return (
    <AuthShell
      title="Resend verification"
      description="Enter your email and we&apos;ll send a fresh verification link."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-foreground hover:underline">
            Back to login
          </Link>
        </p>
      }
    >
      {form.formState.isSubmitSuccessful ? (
        <FormInfoAlert title="Email sent" message="Check your inbox for a new verification email." />
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
            {form.formState.isSubmitting ? "Sending..." : "Send verification email"}
          </Button>
        </form>
      )}
    </AuthShell>
  )
}

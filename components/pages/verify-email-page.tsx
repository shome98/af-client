"use client"

import { useEffect, useEffectEvent, useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { AuthShell } from "@/components/auth/auth-shell"
import { FormErrorAlert, FormInfoAlert } from "@/components/auth/form-messages"
import { Button } from "@/components/ui/button"
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authApi } from "@/lib/actions/auth-api"
import { getApiErrorMessage } from "@/lib/auth/error-helpers"
import { verifyEmailSchema, type VerifyEmailFormValues } from "@/lib/schemas/auth-schemas"

type VerifyState = "idle" | "verifying" | "success" | "error"

export function VerifyEmailPage({ initialToken }: { initialToken: string }) {
  const [status, setStatus] = useState<VerifyState>(initialToken ? "verifying" : "idle")
  const [message, setMessage] = useState("")
  const form = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      token: initialToken,
    },
  })

  const runVerification = async (token: string) => {
    setStatus("verifying")
    form.clearErrors("root")

    try {
      const response = await authApi.verifyEmail({ token })
      setStatus("success")
      setMessage(response.message)
    } catch (error) {
      setStatus("error")
      setMessage(getApiErrorMessage(error, "Verification failed."))
    }
  }

  const verifyOnMount = useEffectEvent((token: string) => {
    void runVerification(token)
  })

  useEffect(() => {
    if (initialToken) {
      verifyOnMount(initialToken)
    }
  }, [initialToken])

  const onSubmit = async (values: VerifyEmailFormValues) => {
    await runVerification(values.token)
  }

  return (
    <AuthShell
      title="Verify email"
      description="Paste your verification token or use the token from the email link."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/resend-verification" className="font-medium text-foreground hover:underline">
            Resend verification email
          </Link>
        </p>
      }
    >
      {status === "verifying" ? (
        <FormInfoAlert title="Verifying email" message="We are checking your verification token right now." />
      ) : status === "success" ? (
        <FormInfoAlert title="Email verified" message={message || "Your email has been verified successfully."} />
      ) : (
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormErrorAlert message={status === "error" ? message : form.formState.errors.root?.message} />

          <Field>
            <FieldLabel htmlFor="token">Verification token</FieldLabel>
            <FieldContent>
              <Input id="token" placeholder="Paste your token" {...form.register("token")} />
              <FieldError errors={[form.formState.errors.token]} />
            </FieldContent>
          </Field>

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Verifying..." : "Verify email"}
          </Button>
        </form>
      )}
    </AuthShell>
  )
}

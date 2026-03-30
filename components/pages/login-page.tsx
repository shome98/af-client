"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { AuthShell } from "@/components/auth/auth-shell"
import { FormErrorAlert } from "@/components/auth/form-messages"
import { GoogleAuthButton } from "@/components/auth/google-auth-button"
import { Button } from "@/components/ui/button"
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { applyApiValidationErrors, getApiErrorMessage } from "@/lib/auth/error-helpers"
import { loginSchema, type LoginFormValues } from "@/lib/schemas/auth-schemas"
import { loginUser } from "@/lib/store/auth-store"
import { useAppDispatch } from "@/lib/store/hooks"

export function LoginPage() {
  const dispatch = useAppDispatch()
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    form.clearErrors("root")

    try {
      await dispatch(loginUser(values)).unwrap()
      toast.success("Logged in successfully.")
      window.location.replace("/dashboard")
    } catch (error) {
      applyApiValidationErrors(error, form.setError)
      form.setError("root", {
        type: "server",
        message: getApiErrorMessage(error, "Login failed."),
      })
    }
  }

  return (
    <AuthShell
      title="Sign in"
      description="Welcome back. Sign in to continue your migrated auth flow."
      footer={
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <GoogleAuthButton label="Continue with Google" />
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-foreground hover:underline">
              Register
            </Link>
          </p>
        </div>
      }
    >
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormErrorAlert message={form.formState.errors.root?.message} />

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <FieldContent>
              <Input id="email" type="email" placeholder="you@example.com" {...form.register("email")} />
              <FieldError errors={[form.formState.errors.email]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <FieldContent>
              <Input id="password" type="password" placeholder="Enter your password" {...form.register("password")} />
              <FieldError errors={[form.formState.errors.password]} />
            </FieldContent>
          </Field>
        </FieldGroup>

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-foreground">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
        </Button>

        <Field>
          <FieldDescription>
            Guest session data is initialized automatically and carried into the authenticated session by the backend
            contract when you sign in.
          </FieldDescription>
        </Field>
      </form>
    </AuthShell>
  )
}

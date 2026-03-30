"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { registerSchema, type RegisterFormValues } from "@/lib/schemas/auth-schemas"
import { registerUser } from "@/lib/store/auth-store"
import { useAppDispatch } from "@/lib/store/hooks"

export function RegisterPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  const onSubmit = async (values: RegisterFormValues) => {
    form.clearErrors("root")

    try {
      await dispatch(
        registerUser({
          email: values.email,
          password: values.password,
          name: values.name?.trim() ? values.name.trim() : undefined,
        })
      ).unwrap()
      toast.success("Account created. Check your inbox to verify your email.")
      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      applyApiValidationErrors(error, form.setError)
      form.setError("root", {
        type: "server",
        message: getApiErrorMessage(error, "Registration failed."),
      })
    }
  }

  return (
    <AuthShell
      title="Create account"
      description="Register with the rebuilt flow and keep the same backend session contract."
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
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-foreground hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      }
    >
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormErrorAlert message={form.formState.errors.root?.message} />

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <FieldContent>
              <Input id="name" placeholder="Optional display name" {...form.register("name")} />
              <FieldError errors={[form.formState.errors.name]} />
            </FieldContent>
          </Field>

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
              <Input id="password" type="password" placeholder="Create a strong password" {...form.register("password")} />
              <FieldDescription>Use at least 8 characters with upper, lower, number, and special character.</FieldDescription>
              <FieldError errors={[form.formState.errors.password]} />
            </FieldContent>
          </Field>
        </FieldGroup>

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthShell>
  )
}

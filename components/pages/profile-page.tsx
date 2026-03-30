"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { FormErrorAlert } from "@/components/auth/form-messages"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { userApi } from "@/lib/actions/auth-api"
import { applyApiValidationErrors, getApiErrorMessage } from "@/lib/auth/error-helpers"
import {
  changePasswordSchema,
  updateProfileSchema,
  type ChangePasswordFormValues,
  type UpdateProfileFormValues,
} from "@/lib/schemas/auth-schemas"
import { logoutUser, refreshUser } from "@/lib/store/auth-store"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"

export function ProfilePage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const profileForm = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name ?? "",
      image: user?.image ?? "",
    },
  })

  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  })

  useEffect(() => {
    profileForm.reset({
      name: user?.name ?? "",
      image: user?.image ?? "",
    })
  }, [profileForm, user])

  if (!user) {
    return null
  }

  const handleProfileSubmit = async (values: UpdateProfileFormValues) => {
    profileForm.clearErrors("root")

    try {
      await userApi.updateProfile({
        name: values.name?.trim() ? values.name.trim() : undefined,
        image: values.image?.trim() ? values.image.trim() : null,
      })
      await dispatch(refreshUser()).unwrap()
      toast.success("Profile updated.")
    } catch (error) {
      applyApiValidationErrors(error, profileForm.setError)
      profileForm.setError("root", {
        type: "server",
        message: getApiErrorMessage(error, "Failed to update profile."),
      })
    }
  }

  const handlePasswordSubmit = async (values: ChangePasswordFormValues) => {
    passwordForm.clearErrors("root")

    try {
      await userApi.changePassword(values)
      toast.success("Password changed. Please sign in again.")

      // Password changes revoke refresh tokens server-side, so we explicitly
      // clear the current client session rather than waiting for token expiry.
      await dispatch(logoutUser()).unwrap()
      router.push("/login")
      router.refresh()
    } catch (error) {
      applyApiValidationErrors(error, passwordForm.setError)
      passwordForm.setError("root", {
        type: "server",
        message: getApiErrorMessage(error, "Failed to change password."),
      })
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)

    try {
      await userApi.deleteAccount()
      await dispatch(logoutUser()).unwrap()
      toast.success("Account deleted.")
      router.push("/")
      router.refresh()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete account."))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">Profile settings</p>
        <h1 className="text-3xl font-semibold tracking-tight">Manage your account</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account status</CardTitle>
          <CardDescription>Read-only details coming from the current auth session.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-3">
          <div className="space-y-1">
            <p className="text-muted-foreground">Email</p>
            <p>{user.email}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Role</p>
            <Badge variant={user.role === "admin" ? "destructive" : "secondary"}>{user.role}</Badge>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Email status</p>
            <Badge variant={user.emailVerified ? "secondary" : "outline"}>
              {user.emailVerified ? "Verified" : "Pending"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit profile</CardTitle>
          <CardDescription>Update the fields returned by the user profile endpoints.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={profileForm.handleSubmit(handleProfileSubmit)}>
            <FormErrorAlert message={profileForm.formState.errors.root?.message} />
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <FieldContent>
                  <Input id="name" placeholder="Your display name" {...profileForm.register("name")} />
                  <FieldError errors={[profileForm.formState.errors.name]} />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="image">Avatar URL</FieldLabel>
                <FieldContent>
                  <Input id="image" placeholder="https://example.com/avatar.png" {...profileForm.register("image")} />
                  <FieldError errors={[profileForm.formState.errors.image]} />
                </FieldContent>
              </Field>
            </FieldGroup>

            <Button type="submit" disabled={profileForm.formState.isSubmitting}>
              {profileForm.formState.isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>Changing your password signs out the current session after the backend revokes refresh tokens.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}>
            <FormErrorAlert message={passwordForm.formState.errors.root?.message} />
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="currentPassword">Current password</FieldLabel>
                <FieldContent>
                  <Input id="currentPassword" type="password" {...passwordForm.register("currentPassword")} />
                  <FieldError errors={[passwordForm.formState.errors.currentPassword]} />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="newPassword">New password</FieldLabel>
                <FieldContent>
                  <Input id="newPassword" type="password" {...passwordForm.register("newPassword")} />
                  <FieldDescription>Use at least 8 characters with upper, lower, number, and special character.</FieldDescription>
                  <FieldError errors={[passwordForm.formState.errors.newPassword]} />
                </FieldContent>
              </Field>
            </FieldGroup>

            <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
              {passwordForm.formState.isSubmitting ? "Updating..." : "Change password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
          <CardDescription>Permanently delete this account and return the browser to an anonymous guest session.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!showDeleteConfirm ? (
            <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
              Delete account
            </Button>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Yes, delete my account"}
              </Button>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

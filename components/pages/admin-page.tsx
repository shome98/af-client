"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { FormErrorAlert } from "@/components/auth/form-messages"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { adminApi } from "@/lib/actions/auth-api"
import { getApiErrorMessage } from "@/lib/auth/error-helpers"
import { adminRoleSchema, type AdminRoleFormValues } from "@/lib/schemas/auth-schemas"
import type { AdminUser, LoginActivity } from "@/types/auth.types"

export function AdminPage() {
  const [activity, setActivity] = useState<LoginActivity[] | null>(null)
  const [roleResult, setRoleResult] = useState<AdminUser | null>(null)
  const [isActivityLoading, setIsActivityLoading] = useState(false)
  const [isBlocking, setIsBlocking] = useState(false)
  const [isUnblocking, setIsUnblocking] = useState(false)
  const [isUpdatingRole, setIsUpdatingRole] = useState(false)

  const form = useForm<AdminRoleFormValues>({
    resolver: zodResolver(adminRoleSchema),
    defaultValues: {
      userId: "",
      role: "user",
    },
  })

  const userId = form.watch("userId")
  const role = form.watch("role")

  const loadActivity = async () => {
    if (!(await form.trigger("userId"))) {
      return
    }

    setIsActivityLoading(true)
    setActivity(null)

    try {
      const response = await adminApi.getLoginActivity(userId.trim())
      setActivity(response.data?.activity ?? [])
      toast.success("Activity loaded.")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load login activity."))
    } finally {
      setIsActivityLoading(false)
    }
  }

  const blockUser = async () => {
    if (!(await form.trigger("userId"))) {
      return
    }

    setIsBlocking(true)

    try {
      await adminApi.blockUser(userId.trim())
      toast.success("User blocked.")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to block user."))
    } finally {
      setIsBlocking(false)
    }
  }

  const unblockUser = async () => {
    if (!(await form.trigger("userId"))) {
      return
    }

    setIsUnblocking(true)

    try {
      await adminApi.unblockUser(userId.trim())
      toast.success("User unblocked.")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to unblock user."))
    } finally {
      setIsUnblocking(false)
    }
  }

  const onSubmit = async (values: AdminRoleFormValues) => {
    setIsUpdatingRole(true)
    setRoleResult(null)

    try {
      const response = await adminApi.updateRole(values.userId.trim(), { role: values.role })
      setRoleResult(response.data?.user ?? null)
      toast.success(`Role updated to ${values.role}.`)
    } catch (error) {
      form.setError("root", {
        type: "server",
        message: getApiErrorMessage(error, "Failed to update role."),
      })
    } finally {
      setIsUpdatingRole(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">Admin controls</p>
        <h1 className="text-3xl font-semibold tracking-tight">Manage privileged actions</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          This route group is isolated so the admin surface can be removed later without touching the user auth flow.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User management</CardTitle>
          <CardDescription>Lookup a user by ID, inspect login activity, and update admin status.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormErrorAlert message={form.formState.errors.root?.message} />

            <Field>
              <FieldLabel htmlFor="userId">User ID</FieldLabel>
              <FieldContent>
                <Input id="userId" placeholder="Enter user UUID" {...form.register("userId")} />
                <FieldError errors={[form.formState.errors.userId]} />
              </FieldContent>
            </Field>

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={loadActivity} disabled={isActivityLoading}>
                {isActivityLoading ? "Loading..." : "View activity"}
              </Button>
              <Button type="button" variant="destructive" onClick={blockUser} disabled={isBlocking}>
                {isBlocking ? "Blocking..." : "Block user"}
              </Button>
              <Button type="button" variant="outline" onClick={unblockUser} disabled={isUnblocking}>
                {isUnblocking ? "Unblocking..." : "Unblock user"}
              </Button>
            </div>

            <Field>
              <FieldLabel htmlFor="role">Role</FieldLabel>
              <FieldContent>
                <Select
                  value={role}
                  onValueChange={(value) => {
                    form.setValue("role", value as AdminRoleFormValues["role"], {
                      shouldDirty: true,
                      shouldTouch: true,
                      shouldValidate: true,
                    })
                  }}
                >
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <FieldDescription>The selected user ID will be updated to the chosen role.</FieldDescription>
                <FieldError errors={[form.formState.errors.role]} />
              </FieldContent>
            </Field>

            <Button type="submit" disabled={isUpdatingRole}>
              {isUpdatingRole ? "Updating..." : `Update role to ${role}`}
            </Button>
          </form>
        </CardContent>
      </Card>

      {roleResult ? (
        <Card>
          <CardHeader>
            <CardTitle>Updated user</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{roleResult.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Name</span>
              <span>{roleResult.name || "Unavailable"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Role</span>
              <Badge variant={roleResult.role === "admin" ? "destructive" : "secondary"}>{roleResult.role}</Badge>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {activity !== null ? (
        <Card>
          <CardHeader>
            <CardTitle>Login activity</CardTitle>
            <CardDescription>{activity.length} record(s) for {userId || "the selected user"}.</CardDescription>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity found for this user.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      <th className="pb-3 pr-4">Date</th>
                      <th className="pb-3 pr-4">IP address</th>
                      <th className="pb-3 pr-4">User agent</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activity.map((entry) => (
                      <tr key={entry.id} className="border-b border-border/60">
                        <td className="py-3 pr-4">{new Date(entry.createdAt).toLocaleString()}</td>
                        <td className="py-3 pr-4 font-mono text-xs">{entry.ipAddress || "Unavailable"}</td>
                        <td className="max-w-80 truncate py-3 pr-4 text-muted-foreground">{entry.userAgent || "Unavailable"}</td>
                        <td className="py-3">
                          <Badge variant={entry.success ? "secondary" : "outline"}>
                            {entry.success ? "Success" : "Failed"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

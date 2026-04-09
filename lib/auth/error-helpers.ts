import type { FieldValues, Path, UseFormSetError } from "react-hook-form"

import { AuthApiError } from "@/lib/actions/auth-api"

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AuthApiError) {
    return error.message
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

export function applyApiValidationErrors<TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>
) {
  if (!(error instanceof AuthApiError) || !error.errors?.length) {
    return
  }

  error.errors.forEach((fieldError) => {
    if (!fieldError.field) {
      return
    }

    setError(fieldError.field as Path<TFieldValues>, {
      type: "server",
      message: fieldError.message,
    })
  })
}

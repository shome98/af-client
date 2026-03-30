import { RiErrorWarningLine, RiInformationLine } from "@remixicon/react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function FormErrorAlert({ message }: { message?: string | null }) {
  if (!message) {
    return null
  }

  return (
    <Alert variant="destructive">
      <RiErrorWarningLine className="size-4" />
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

export function FormInfoAlert({
  title,
  message,
}: {
  title: string
  message: string
}) {
  return (
    <Alert>
      <RiInformationLine className="size-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

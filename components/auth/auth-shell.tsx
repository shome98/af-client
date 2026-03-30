import type { ReactNode } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center px-4 py-10">
      <Card className="w-full border border-border/70 bg-card/95 shadow-sm">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {children}
          {footer}
        </CardContent>
      </Card>
    </div>
  )
}

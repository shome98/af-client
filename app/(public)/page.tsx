"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppSelector } from "@/lib/store/hooks"

const features = [
  {
    title: "Credential auth",
    description: "Register, sign in, verify email, recover passwords, and keep the existing API contract.",
  },
  {
    title: "Automatic guest session",
    description: "Anonymous visitors get a guest session on arrival so backend migration can happen on auth.",
  },
  {
    title: "Role-aware routing",
    description: "User and admin sections stay separated with App Router route groups for easier future cleanup.",
  },
]

export default function HomePage() {
  const { user, isBootstrapping } = useAppSelector((state) => state.auth)

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12">
      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Next.js 16 auth rebuild</p>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              The legacy auth flow, rebuilt for the App Router with Redux and Shadcn UI.
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
              Guest sessions are initialized automatically, protected routes restore on the client, and the same auth API remains the source of truth.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {isBootstrapping ? null : user ? (
              <>
                <Button asChild size="lg">
                  <Link href="/dashboard">Go to dashboard</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/profile">Manage profile</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="lg">
                  <Link href="/register">Create account</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/login">Sign in</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle>What changed</CardTitle>
            <CardDescription>A fast snapshot of the implementation direction now running in this repo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>App Router route groups replace the old SPA route tree.</p>
            <p>React Hook Form and Zod now back every auth-facing form.</p>
            <p>Redux owns authenticated session state so future stores can be added without rebuilding the shell.</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  )
}

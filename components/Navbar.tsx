"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { toast } from "sonner"

import ToggleThemeButton from "@/components/ToggleThemeButton"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { logoutUser } from "@/lib/store/auth-store"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { cn } from "@/lib/utils"

const NavBar = () => {
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const { user, isBootstrapping } = useAppSelector((state) => state.auth)

  const navClass = (href: string) =>
    cn(
      "text-sm text-muted-foreground transition-colors hover:text-foreground",
      pathname === href && "font-medium text-foreground"
    )

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap()
      toast.success("Logged out successfully.")
      window.location.replace("/")
    } catch {
      toast.error("Failed to log out.")
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm font-semibold tracking-[0.24em] uppercase text-foreground">
            Auth Flow
          </Link>
          <div className="hidden items-center gap-4 md:flex">
            {user ? (
              <>
                <Link href="/dashboard" className={navClass("/dashboard")}>
                  Dashboard
                </Link>
                <Link href="/profile" className={navClass("/profile")}>
                  Profile
                </Link>
                {user.role === "admin" ? (
                  <Link href="/admin" className={navClass("/admin")}>
                    Admin
                  </Link>
                ) : null}
              </>
            ) : (
              <>
                <Link href="/login" className={navClass("/login")}>
                  Login
                </Link>
                <Link href="/register" className={navClass("/register")}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isBootstrapping ? (
            <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground">
              <Spinner className="size-3.5" />
              Syncing session
            </div>
          ) : user ? (
            <>
              <span className="hidden text-xs text-muted-foreground md:inline">
                {user.name || user.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link href="/register">Get Started</Link>
            </Button>
          )}
          <ToggleThemeButton />
        </div>
      </nav>
    </header>
  )
}

export default NavBar

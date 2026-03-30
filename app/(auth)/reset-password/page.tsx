import { ResetPasswordPage } from "@/components/pages/reset-password-page"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>
}) {
  const params = await searchParams
  const token = typeof params.token === "string" ? params.token : ""

  return <ResetPasswordPage initialToken={token} />
}

import { VerifyEmailPage } from "@/components/pages/verify-email-page"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>
}) {
  const params = await searchParams
  const token = typeof params.token === "string" ? params.token : ""

  return <VerifyEmailPage initialToken={token} />
}

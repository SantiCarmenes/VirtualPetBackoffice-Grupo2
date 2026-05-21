import { redirect } from 'next/navigation'

export default function ShipmentsRedirectPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const params = new URLSearchParams()
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value !== undefined) {
      params.set(key, String(value))
    }
  })
  const queryString = params.toString()
  redirect(`/orders${queryString ? '?' + queryString : ''}`)
}

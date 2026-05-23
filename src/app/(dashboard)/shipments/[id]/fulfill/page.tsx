import { redirect } from 'next/navigation'

export default function ShipmentsIdRedirectPage({ params }: { params: { id: string } }) {
  redirect(`/orders/${params.id}/fulfill`)
}

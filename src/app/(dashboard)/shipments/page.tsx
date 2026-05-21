import { QueryClient, dehydrate } from '@tanstack/react-query'
import { HydrationWrapper } from '@/components/hydration-wrapper'
import { getServerShipments } from '@/lib/serverData'
import ShipmentsContent from './shipments-content'

export default async function ShipmentsPage() {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['shipments', { status: undefined, page: 1, limit: 20 }],
    queryFn: () => getServerShipments({ page: 1, limit: 20 }),
  })

  return (
    <HydrationWrapper state={dehydrate(queryClient)}>
      <ShipmentsContent />
    </HydrationWrapper>
  )
}

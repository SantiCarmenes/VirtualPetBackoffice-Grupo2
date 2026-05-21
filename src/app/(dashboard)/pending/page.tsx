import { QueryClient, dehydrate } from '@tanstack/react-query'
import { HydrationWrapper } from '@/components/hydration-wrapper'
import { getServerShipments } from '@/lib/serverData'
import PendingContent from './pending-content'

export default async function PendingPage() {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['shipments', { status: 'PENDING', page: 1, limit: 20 }],
    queryFn: () => getServerShipments({ status: 'PENDING', page: 1, limit: 20 }),
  })

  return (
    <HydrationWrapper state={dehydrate(queryClient)}>
      <PendingContent />
    </HydrationWrapper>
  )
}

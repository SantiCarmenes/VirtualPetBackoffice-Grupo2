import { QueryClient, dehydrate } from '@tanstack/react-query'
import { HydrationWrapper } from '@/components/hydration-wrapper'
import { getServerShipments } from '@/lib/serverData'
import IssuesContent from './issues-content'

export default async function IssuesPage() {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['shipments', { status: 'CANCELLED', page: 1, limit: 20 }],
    queryFn: () => getServerShipments({ status: 'CANCELLED', page: 1, limit: 20 }),
  })

  return (
    <HydrationWrapper state={dehydrate(queryClient)}>
      <IssuesContent />
    </HydrationWrapper>
  )
}

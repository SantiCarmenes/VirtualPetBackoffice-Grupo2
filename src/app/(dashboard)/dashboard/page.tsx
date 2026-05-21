import { QueryClient, dehydrate } from '@tanstack/react-query'
import { HydrationWrapper } from '@/components/hydration-wrapper'
import { getServerShipments, getServerIssues } from '@/lib/serverData'
import DashboardContent from './dashboard-content'

export default async function DashboardPage() {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['shipments', undefined],
    queryFn: () => getServerShipments(),
  })

  await queryClient.prefetchQuery({
    queryKey: ['issues', 1, 100],
    queryFn: () => getServerIssues(1, 100),
  })

  return (
    <HydrationWrapper state={dehydrate(queryClient)}>
      <DashboardContent />
    </HydrationWrapper>
  )
}

import { getServerShipments } from '@/lib/serverData'
import DashboardContent from './dashboard-content'

export default async function DashboardPage() {
  const shipments = await getServerShipments()

  return <DashboardContent shipments={shipments} />
}

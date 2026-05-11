import { apiClient } from '@/lib/apiClient'
import { FulfillmentPayload, Shipment } from '@/types/shipment'

export const fulfillmentService = {
  async submitFulfillment(payload: FulfillmentPayload): Promise<Shipment> {
    // TODO: verify endpoint
    return apiClient<Shipment>(`/shipments/${payload.shipmentId}/fulfill`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },
}

import { Shipment, ShipmentStatus } from '@/types/shipment'

const now = new Date().toISOString()
const daysAgo = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

export const mockShipments: Shipment[] = [
  {
    id: 'shp-001',
    orderId: 'ORD-7821',
    customerName: 'Mary Johnson',
    status: 'PENDING',
    products: [
      { id: 'prd-101', name: 'Premium Dog Food 5kg', sku: 'PET-DF-5K', quantity: 2, packed: false },
      { id: 'prd-102', name: 'Cat Litter Box', sku: 'PET-CLB-01', quantity: 1, packed: false },
    ],
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
  {
    id: 'shp-002',
    orderId: 'ORD-7825',
    customerName: 'John Smith',
    status: 'PENDING',
    products: [
      { id: 'prd-103', name: 'Bird Cage Large', sku: 'PET-BC-LG', quantity: 1, packed: false },
      { id: 'prd-104', name: 'Parrot Toy Set', sku: 'PET-PT-03', quantity: 3, packed: false },
      { id: 'prd-105', name: 'Seed Mix 1kg', sku: 'PET-SM-1K', quantity: 2, packed: false },
    ],
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: 'shp-003',
    orderId: 'ORD-7830',
    customerName: 'Anna Davis',
    status: 'PENDING',
    products: [
      { id: 'prd-106', name: 'Aquarium Filter', sku: 'PET-AF-02', quantity: 1, packed: false },
    ],
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0),
  },
  {
    id: 'shp-004',
    orderId: 'ORD-7801',
    customerName: 'Charles Wilson',
    status: 'IN_TRANSIT',
    products: [
      { id: 'prd-107', name: 'Dog Leash Reflective', sku: 'PET-DL-RF', quantity: 1, packed: true },
      { id: 'prd-108', name: 'Chew Toy Bone', sku: 'PET-CTB-05', quantity: 2, packed: true },
    ],
    createdAt: daysAgo(4),
    updatedAt: daysAgo(1),
    operatorName: 'John Smith',
    logisticsType: 'COURIER_1',
  },
  {
    id: 'shp-005',
    orderId: 'ORD-7798',
    customerName: 'Sophia Miller',
    status: 'IN_TRANSIT',
    products: [
      { id: 'prd-109', name: 'Cat Scratching Post', sku: 'PET-CSP-01', quantity: 1, packed: true },
    ],
    createdAt: daysAgo(5),
    updatedAt: daysAgo(2),
    operatorName: 'John Smith',
    logisticsType: 'INTERNAL_DELIVERY',
  },
  {
    id: 'shp-006',
    orderId: 'ORD-7785',
    customerName: 'James Taylor',
    status: 'IN_TRANSIT',
    products: [
      { id: 'prd-110', name: 'Fish Tank 50L', sku: 'PET-FT-50', quantity: 1, packed: true },
      { id: 'prd-111', name: 'Gravel Substrate 2kg', sku: 'PET-GS-2K', quantity: 2, packed: true },
      { id: 'prd-112', name: 'LED Aquarium Light', sku: 'PET-AL-LED', quantity: 1, packed: true },
    ],
    createdAt: daysAgo(6),
    updatedAt: daysAgo(2),
    operatorName: 'Sarah Johnson',
    logisticsType: 'COURIER_2',
  },
  {
    id: 'shp-007',
    orderId: 'ORD-7750',
    customerName: 'Lucy Anderson',
    status: 'DELIVERED',
    products: [
      { id: 'prd-113', name: 'Pet Carrier Medium', sku: 'PET-PC-MD', quantity: 1, packed: true },
    ],
    createdAt: daysAgo(10),
    updatedAt: daysAgo(3),
    operatorName: 'John Smith',
    logisticsType: 'COURIER_1',
  },
  {
    id: 'shp-008',
    orderId: 'ORD-7742',
    customerName: 'Peter White',
    status: 'DELIVERED',
    products: [
      { id: 'prd-114', name: 'Dog Bed Orthopedic', sku: 'PET-DB-ORT', quantity: 1, packed: true },
      { id: 'prd-115', name: 'Blanket Fleece', sku: 'PET-BL-FL', quantity: 1, packed: true },
    ],
    createdAt: daysAgo(12),
    updatedAt: daysAgo(5),
    operatorName: 'Sarah Johnson',
    logisticsType: 'INTERNAL_DELIVERY',
  },
  {
    id: 'shp-009',
    orderId: 'ORD-7730',
    customerName: 'Helen Clark',
    status: 'DELIVERED',
    products: [
      { id: 'prd-116', name: 'Hamster Wheel Silent', sku: 'PET-HW-SL', quantity: 1, packed: true },
      { id: 'prd-117', name: 'Bedding Wood Shavings', sku: 'PET-BW-WS', quantity: 3, packed: true },
      { id: 'prd-118', name: 'Water Bottle Small', sku: 'PET-WB-SM', quantity: 1, packed: true },
    ],
    createdAt: daysAgo(14),
    updatedAt: daysAgo(7),
    operatorName: 'John Smith',
    logisticsType: 'COURIER_2',
  },
  {
    id: 'shp-010',
    orderId: 'ORD-7715',
    customerName: 'Jason Lewis',
    status: 'FAILED_ATTEMPT_1',
    products: [
      { id: 'prd-119', name: 'Reptile Heat Lamp', sku: 'PET-RH-60', quantity: 1, packed: true },
    ],
    createdAt: daysAgo(8),
    updatedAt: daysAgo(1),
    operatorName: 'Sarah Johnson',
    logisticsType: 'COURIER_1',
  },
  {
    id: 'shp-011',
    orderId: 'ORD-7708',
    customerName: 'Kate Robinson',
    status: 'FAILED_ATTEMPT_1',
    products: [
      { id: 'prd-120', name: 'Catnip Toys 4pk', sku: 'PET-CT-4PK', quantity: 2, packed: true },
      { id: 'prd-121', name: 'Laser Pointer', sku: 'PET-LP-01', quantity: 1, packed: true },
    ],
    createdAt: daysAgo(9),
    updatedAt: daysAgo(2),
    operatorName: 'John Smith',
    logisticsType: 'COURIER_2',
  },
  {
    id: 'shp-012',
    orderId: 'ORD-7695',
    customerName: 'Richard Scott',
    status: 'FAILED_ATTEMPT_2',
    products: [
      { id: 'prd-122', name: 'Dog Shampoo 500ml', sku: 'PET-DS-500', quantity: 1, packed: true },
      { id: 'prd-123', name: 'Nail Clippers', sku: 'PET-NC-01', quantity: 1, packed: true },
    ],
    createdAt: daysAgo(11),
    updatedAt: daysAgo(3),
    operatorName: 'Sarah Johnson',
    logisticsType: 'INTERNAL_DELIVERY',
  },
  {
    id: 'shp-013',
    orderId: 'ORD-7680',
    customerName: 'Patricia Hall',
    status: 'FAILED_ATTEMPT_3',
    products: [
      { id: 'prd-124', name: 'Automatic Feeder', sku: 'PET-AF-AUTO', quantity: 1, packed: true },
    ],
    createdAt: daysAgo(15),
    updatedAt: daysAgo(4),
    operatorName: 'John Smith',
    logisticsType: 'COURIER_1',
  },
  {
    id: 'shp-014',
    orderId: 'ORD-7670',
    customerName: 'Andrew Wright',
    status: 'TOTAL_REFUND',
    products: [
      { id: 'prd-125', name: 'Dog Crate XL', sku: 'PET-DC-XL', quantity: 1, packed: false },
      { id: 'prd-126', name: 'Crate Mat', sku: 'PET-CM-01', quantity: 1, packed: false },
    ],
    createdAt: daysAgo(7),
    updatedAt: daysAgo(1),
  },
  {
    id: 'shp-015',
    orderId: 'ORD-7665',
    customerName: 'Natalie Green',
    status: 'PARTIAL_REFUND',
    products: [
      { id: 'prd-127', name: 'Cat Tree 3-level', sku: 'PET-CT-3LV', quantity: 1, packed: true },
      { id: 'prd-128', name: 'Feather Wand', sku: 'PET-FW-01', quantity: 2, packed: false },
    ],
    createdAt: daysAgo(6),
    updatedAt: daysAgo(1),
    operatorName: 'Sarah Johnson',
    logisticsType: 'COURIER_2',
  },
  {
    id: 'shp-016',
    orderId: 'ORD-7650',
    customerName: 'Robert Martinez',
    status: 'MISSING_STOCK',
    products: [
      { id: 'prd-129', name: 'Premium Dog Food 10kg', sku: 'PET-DF-10K', quantity: 1, packed: false },
      { id: 'prd-130', name: 'Treats Chicken 500g', sku: 'PET-TR-CH5', quantity: 3, packed: false },
    ],
    createdAt: daysAgo(3),
    updatedAt: daysAgo(0),
  },
]

export const mockShipmentRepository = {
  getShipments(params?: { status?: ShipmentStatus; page?: number; limit?: number }): {
    data: Shipment[]
    total: number
    page: number
    limit: number
  } {
    let data = [...mockShipments]

    if (params?.status) {
      data = data.filter((s) => s.status === params.status)
    }

    const page = params?.page ?? 1
    const limit = params?.limit ?? 10
    const start = (page - 1) * limit
    const end = start + limit

    return {
      data: data.slice(start, end),
      total: data.length,
      page,
      limit,
    }
  },

  getShipmentById(id: string): Shipment | undefined {
    return mockShipments.find((s) => s.id === id)
  },
}

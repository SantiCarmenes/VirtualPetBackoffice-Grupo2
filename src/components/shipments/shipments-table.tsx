'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowUpDown, ArrowUp, ArrowDown, CheckCircle } from 'lucide-react'

import { Shipment, Product } from '@/types/shipment'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusBadge } from './status-badge'
import { useFulfillmentMutation } from '@/hooks/useFulfillmentMutation'

const columns: ColumnDef<Shipment>[] = [
  {
    accessorKey: 'orderId',
    header: 'Nº Pedido',
    cell: ({ row }) => <span className="font-mono text-sm">{row.getValue('orderId')}</span>,
  },
  {
    accessorKey: 'customerName',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 data-[state=open]:bg-accent"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Cliente
          <SortIcon sorted={column.getIsSorted()} />
        </Button>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
  },
  {
    accessorKey: 'products',
    header: 'Productos',
    cell: ({ row }) => {
      const products = row.getValue('products') as Product[] | undefined
      return <span>{products?.length ?? 0}</span>
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 data-[state=open]:bg-accent"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Creado
          <SortIcon sorted={column.getIsSorted()} />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string
      return <span>{new Date(date).toLocaleDateString()}</span>
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const shipment = row.original
      return <ActionCell shipment={shipment} />
    },
  },
]

function SortIcon({ sorted }: { sorted: false | 'asc' | 'desc' }) {
  if (!sorted) return <ArrowUpDown className="ml-2 h-4 w-4" />
  if (sorted === 'asc') return <ArrowUp className="ml-2 h-4 w-4" />
  return <ArrowDown className="ml-2 h-4 w-4" />
}

function ActionCell({ shipment }: { shipment: Shipment }) {
  const { mutate: updateStatus, isPending } = useFulfillmentMutation()

  if (shipment.status === 'IN_TRANSIT') {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={() =>
          updateStatus({
            orderId: shipment.id,
            status: 'DELIVERED',
            updateOrderStatus: 'DELIVERED',
          })
        }
      >
        <CheckCircle className="mr-1 h-3 w-3" />
        {isPending ? '...' : 'Entregado'}
      </Button>
    )
  }

  return (
    <Link href={`/shipments/${shipment.id}/fulfill`}>
      <Button variant="outline" size="sm">
        {shipment.status === 'PENDING' ? 'Preparar' : 'Ver'}
      </Button>
    </Link>
  )
}

interface ShipmentsTableProps {
  data: Shipment[]
}

export function ShipmentsTable({ data }: ShipmentsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No se encontraron envíos.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

'use client'

import Link from 'next/link'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { useState } from 'react'

import { Order, OrderStatus, OrderItem, getAllowedTransitions } from '@/types/order'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { orderService } from '@/services/orderService'
import { toast } from 'sonner'

function SortIcon({ sorted }: { sorted: false | 'asc' | 'desc' }) {
  if (!sorted) return <ArrowUpDown className="ml-2 h-4 w-4" />
  if (sorted === 'asc') return <ArrowUp className="ml-2 h-4 w-4" />
  return <ArrowDown className="ml-2 h-4 w-4" />
}

function ActionCell({ order }: { order: Order }) {
  const [isUpdating, setIsUpdating] = useState(false)
  const allowedTransitions = getAllowedTransitions(order.status)

  async function handleStatusChange(newStatus: OrderStatus) {
    setIsUpdating(true)
    try {
      await orderService.updateOrderStatus(order.id, newStatus)
      toast.success('Estado actualizado correctamente')
      window.location.reload()
    } catch (error: any) {
      toast.error(error?.message || 'Error al actualizar el estado')
    } finally {
      setIsUpdating(false)
    }
  }

  if (allowedTransitions.length === 0) {
    return <span className="text-xs text-muted-foreground">Terminal</span>
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        disabled={isUpdating}
        value=""
        onValueChange={(value) => handleStatusChange(value as OrderStatus)}
      >
        <SelectTrigger className="h-8 w-[140px]">
          <SelectValue placeholder="Cambiar estado" />
        </SelectTrigger>
        <SelectContent>
          {allowedTransitions.map((status) => (
            <SelectItem key={status} value={status}>
              {status === 'CONFIRMED' && 'Confirmar'}
              {status === 'SHIPPED' && 'Enviar'}
              {status === 'DELIVERED' && 'Entregar'}
              {status === 'CANCELLED' && 'Cancelar'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Link href={`/orders/${order.id}/fulfill`}>
        <Button variant="outline" size="sm">
          Ver
        </Button>
      </Link>
    </div>
  )
}

export function OrdersTable({ data }: { data: Order[] }) {
  const [sorting, setSorting] = useState<SortingState>([])

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: 'id',
      header: 'Nº Pedido',
      cell: ({ row }) => <span className="font-mono text-sm">{row.getValue('id')}</span>,
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
      accessorKey: 'items',
      header: 'Productos',
      cell: ({ row }) => {
        const items = row.getValue('items') as OrderItem[] | undefined
        return <span>{items?.length ?? 0}</span>
      },
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row }) => {
        const total = row.getValue('total') as number
        return <span>${total.toFixed(2)}</span>
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
        const order = row.original
        return <ActionCell order={order} />
      },
    },
  ]

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
                No se encontraron pedidos.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

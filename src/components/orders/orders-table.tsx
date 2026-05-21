'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
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

import { Order, OrderStatus, OrderItem, getAllowedTransitions, STATUS_LABELS } from '@/types/order'
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
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)
  const allowedTransitions = getAllowedTransitions(order.status)

  async function handleStatusChange(newStatus: OrderStatus) {
    setIsUpdating(true)
    try {
      await orderService.updateOrderStatus(order.id, newStatus)
      toast.success('Estado actualizado correctamente')
      router.refresh()
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
        <SelectTrigger className="h-8 w-[160px]">
          <SelectValue placeholder="Cambiar estado" />
        </SelectTrigger>
        <SelectContent>
          {allowedTransitions.map((status) => (
            <SelectItem key={status} value={status}>
              {STATUS_LABELS[status]}
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
      cell: ({ row }) => (
        <span className="font-mono text-xs">{(row.getValue('id') as string).slice(0, 8).toUpperCase()}</span>
      ),
    },
    {
      accessorKey: 'customerName',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 data-[state=open]:bg-accent"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Cliente
          <SortIcon sorted={column.getIsSorted()} />
        </Button>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
    },
    {
      accessorKey: 'deliveryAttempts',
      header: 'Intentos',
      cell: ({ row }) => {
        const attempts = row.getValue('deliveryAttempts') as number
        if (!attempts) return <span className="text-muted-foreground">—</span>
        return <span className="text-amber-600 font-medium">{attempts}/3</span>
      },
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
        return <span>${Number(total).toFixed(2)}</span>
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 data-[state=open]:bg-accent"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Creado
          <SortIcon sorted={column.getIsSorted()} />
        </Button>
      ),
      cell: ({ row }) => {
        const date = row.getValue('createdAt') as string
        return <span>{new Date(date).toLocaleDateString()}</span>
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => <ActionCell order={row.original} />,
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

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
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronRight, FileText } from 'lucide-react'
import { useState } from 'react'

import { Order, OrderStatus, OrderItem, getAllowedTransitions, STATUS_LABELS, ACTION_LABELS, INVOICE_STATUS_LABELS, InvoiceStatus } from '@/types/order'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
  // Facturar está disponible en todos los estados salvo cancelado.
  const canMarkInvoiced = order.invoiceStatus === 'REQUIRED' && order.status !== 'CANCELLED'

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

  async function handleMarkInvoiced() {
    setIsUpdating(true)
    try {
      await orderService.markAsInvoiced(order.id)
      toast.success('Pedido marcado como facturado')
      router.refresh()
    } catch (error: any) {
      toast.error(error?.message || 'Error al marcar como facturado')
    } finally {
      setIsUpdating(false)
    }
  }

  async function handleSelectChange(value: string) {
    if (value === '__MARK_INVOICED__') {
      await handleMarkInvoiced()
    } else {
      await handleStatusChange(value as OrderStatus)
    }
  }

  const hasActions = allowedTransitions.length > 0 || canMarkInvoiced

  return (
    <div className="flex items-center gap-2">
      {hasActions ? (
        <Select
          disabled={isUpdating}
          value=""
          onValueChange={handleSelectChange}
        >
          <SelectTrigger className="h-8 w-[180px]">
            <SelectValue placeholder="Acciones" />
          </SelectTrigger>
          <SelectContent>
            {allowedTransitions.map((status) => (
              <SelectItem key={status} value={status}>
                {ACTION_LABELS[status] ?? STATUS_LABELS[status]}
              </SelectItem>
            ))}
            {canMarkInvoiced && (
              <SelectItem value="__MARK_INVOICED__">
                Marcar como Facturado
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      ) : (
        <span className="inline-flex h-8 w-[180px] items-center rounded-md border border-dashed border-muted-foreground/30 px-3 text-xs text-muted-foreground">
          Sin acciones pendientes
        </span>
      )}
      <Link href={`/orders/${order.id}/fulfill`}>
        <Button variant="outline" size="sm">
          Ver
        </Button>
      </Link>
    </div>
  )
}

function InvoiceBadge({ status }: { status: InvoiceStatus }) {
  if (status === 'NONE') return <span className="text-muted-foreground">—</span>
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
        status === 'DONE'
          ? 'bg-status-delivered text-status-delivered-foreground'
          : 'bg-blue-100 text-blue-700'
      }`}
    >
      <FileText className="h-3 w-3" />
      {INVOICE_STATUS_LABELS[status]}
    </span>
  )
}

export function OrdersTable({ data }: { data: Order[] }) {
  const [sorting, setSorting] = useState<SortingState>([])

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: 'id',
      header: () => <span className="text-left">Nº Pedido</span>,
      size: 100,
      cell: ({ row }) => (
        <span className="font-mono text-xs">{(row.getValue('id') as string).slice(0, 8).toUpperCase()}</span>
      ),
    },
    {
      accessorKey: 'customerName',
      size: 150,
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
      header: () => <span className="text-center block">Estado</span>,
      size: 130,
      cell: ({ row }) => (
        <div className="text-center"><StatusBadge status={row.getValue('status')} /></div>
      ),
    },
    {
      accessorKey: 'invoiceStatus',
      header: () => <span className="text-center block">Factura</span>,
      size: 130,
      cell: ({ row }) => (
        <div className="text-center"><InvoiceBadge status={row.getValue('invoiceStatus') as InvoiceStatus} /></div>
      ),
    },
    {
      accessorKey: 'deliveryAttempts',
      header: () => <span className="text-center block">Intentos</span>,
      size: 80,
      cell: ({ row }) => {
        const attempts = row.getValue('deliveryAttempts') as number
        if (!attempts) return <div className="text-center text-muted-foreground">—</div>
        return <div className="text-center text-amber-600 font-medium">{attempts}/3</div>
      },
    },
    {
      accessorKey: 'items',
      header: () => <span className="text-center block">Productos</span>,
      size: 90,
      cell: ({ row }) => {
        const items = row.getValue('items') as OrderItem[] | undefined
        return <div className="text-center">{items?.length ?? 0}</div>
      },
    },
    {
      accessorKey: 'total',
      header: () => <span className="text-right block">Total</span>,
      size: 100,
      cell: ({ row }) => {
        const total = row.getValue('total') as number
        return <div className="text-right">${Number(total).toFixed(2)}</div>
      },
    },
    {
      accessorKey: 'createdAt',
      size: 110,
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
      size: 220,
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
    <>
      {/* Desktop Table */}
      <div className="hidden rounded-md border md:block">
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

      {/* Mobile Cards */}
      <div className="grid gap-3 md:hidden">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            const order = row.original
            return (
              <Link key={order.id} href={`/orders/${order.id}/fulfill`}>
                <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="space-y-1">
                      <p className="font-mono text-xs font-medium text-foreground">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={order.status} />
                        {order.invoiceStatus !== 'NONE' && (
                          <InvoiceBadge status={order.invoiceStatus} />
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            )
          })
        ) : (
          <div className="h-24 text-center text-sm text-muted-foreground">
            No se encontraron pedidos.
          </div>
        )}
      </div>
    </>
  )
}

'use client'

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
import { StatusBadge } from '@/components/shipments/status-badge'

function getIssueType(status: string): string {
  if (status.includes('REFUND')) return 'Reembolso'
  if (status === 'MISSING_STOCK') return 'Stock Faltante'
  return 'Otro'
}

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
    id: 'issueType',
    header: 'Tipo de Incidencia',
    accessorFn: (row) => getIssueType(row.status),
    cell: ({ row }) => {
      const type = getIssueType(row.original.status)
      return (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            type === 'Reembolso'
              ? 'bg-red-100 text-red-800'
              :               type === 'Stock Faltante'
              ? 'bg-gray-100 text-gray-800'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {type}
        </span>
      )
    },
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
]

function SortIcon({ sorted }: { sorted: false | 'asc' | 'desc' }) {
  if (!sorted) return <ArrowUpDown className="ml-2 h-4 w-4" />
  if (sorted === 'asc') return <ArrowUp className="ml-2 h-4 w-4" />
  return <ArrowDown className="ml-2 h-4 w-4" />
}

interface IssuesTableProps {
  data: Shipment[]
}

export function IssuesTable({ data }: IssuesTableProps) {
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
                No se encontraron incidencias.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

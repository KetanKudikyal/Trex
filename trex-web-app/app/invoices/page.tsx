'use client'

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowUpDown, Check, Copy } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { FillOrderModal } from '@/components/FillOrderModal'
import useSwapStateStore from '@/store'
import Link from 'next/link'

function useInvoices() {
  return useSwapStateStore((state) => state.invoices)
}

export type Payment = {
  id: string
  paymentRequest: string
  paymentHash: string
  transactionHash: string
  amount?: number
  description: string
}

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: 'description',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Citrea Lightning Hubs
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => <div>{row.getValue('description')}</div>,
  },
  {
    accessorKey: 'paymentHash',
    header: 'Invoice LN url',
    cell: ({ row }) => {
      const hash = row.getValue('paymentHash') as string
      return (
        <div className="font-mono text-sm truncate max-w-[200px] flex items-center gap-2">
          <span className="truncate">{hash}</span>
          <CopyButton text={hash} />
        </div>
      )
    },
  },
  {
    accessorKey: 'transactionHash',
    header: 'Transaction Hash',
    cell: ({ row }) => {
      const hash = row.getValue('transactionHash') as string
      return (
        <Link
          target="_blank"
          href={`https://explorer.testnet.citrea.xyz/tx/${hash}`}
        >
          <div className="font-mono hover:underline text-sm truncate max-w-[200px] flex items-center gap-2">
            <span className="truncate">{hash}</span>
            {hash !== '-' && <CopyButton text={hash} />}
          </div>
        </Link>
      )
    },
  },
  {
    accessorKey: 'amount',
    header: () => (
      <div className="text-left pl-3 min-w-[100px]  font-medium">Amount</div>
    ),
    cell: ({ row }) => {
      const amount = row.getValue('amount')

      if (typeof amount === 'undefined' || amount === null) {
        return (
          <div className="text-left pl-3 min-w-[100px]  font-medium">-</div>
        )
      }

      // Format the amount as sats
      return (
        <div className="text-left pl-3 min-w-[100px]  font-medium">
          {(amount as number).toLocaleString()}k sats
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const payment = row.original
      return payment.transactionHash !== '-' ? (
        '-'
      ) : (
        <FillOrderModal payment={payment} />
      )
    },
  },
]

function CopyButton({ text }: { text: string }) {
  const [isCopied, setIsCopied] = React.useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-4 w-4 -ml-2 hover:bg-transparent"
      onClick={handleCopy}
    >
      {isCopied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  )
}

function DataTableDemo() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const data = useInvoices()
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div className="w-full max-w-5xl mx-auto">
      <h1 className="mb-2  font-bold text-[40px]">Available Invoices</h1>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export default DataTableDemo

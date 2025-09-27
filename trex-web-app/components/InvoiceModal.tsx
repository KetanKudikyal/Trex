'use client'

import { Invoice, invoices as invoiceData } from '@/app/invoices/page'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import useWLNPayments from '@/hooks/useWLNPayments'
import { Check, Copy, Zap } from 'lucide-react'
import { useState } from 'react'

interface InvoiceModalProps {
  children: React.ReactNode
}

export default function InvoiceModal({ children }: InvoiceModalProps) {
  // Mock data - replace with your actual data source
  const [invoices, setInvoices] = useState<Invoice[]>(invoiceData)

  const [copied, setCopied] = useState<string | null>(null)
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null)

  const { mutateAsync: payWithWebLN } = useWLNPayments()
  const handleCopy = async (paymentRequest: string, id: string) => {
    await navigator.clipboard.writeText(paymentRequest)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handlePayWithWebLN = async (invoice: Invoice) => {
    if (!window.webln) return
    try {
      setPayingInvoiceId(invoice.id)
      const result = await payWithWebLN(invoice)

      // Update invoice status
      setInvoices(
        invoices.map((inv) =>
          inv.id === invoice.id
            ? {
                ...inv,
                status: result?.status === 'paid' ? 'paid' : 'failed',
              }
            : inv
        )
      )
    } catch (error) {
      console.error('Payment failed:', error)
      setInvoices(
        invoices.map((inv) =>
          inv.id === invoice.id ? { ...inv, status: 'failed' } : inv
        )
      )
    } finally {
      setPayingInvoiceId(null)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[600px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Lightning Invoices
          </DialogTitle>
          <DialogDescription>
            View and pay pending Lightning Network invoices
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="p-4 border rounded-lg space-y-3 bg-card"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="font-medium">{invoice.description}</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(invoice.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">
                    {invoice.amount} sats
                  </span>
                  {invoice.status === 'paid' && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                  {invoice.status === 'failed' && (
                    <span className="text-sm text-red-500">Failed</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 font-mono text-xs text-muted-foreground truncate">
                  {invoice.paymentRequest}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8"
                  onClick={() => handleCopy(invoice.paymentRequest, invoice.id)}
                >
                  {copied === invoice.id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {invoice.status === 'pending' && (
                <Button
                  className="w-full"
                  variant="default"
                  size="sm"
                  onClick={() => handlePayWithWebLN(invoice)}
                  disabled={payingInvoiceId === invoice.id}
                >
                  <Zap
                    className={`h-4 w-4 mr-2 ${
                      payingInvoiceId === invoice.id ? 'animate-pulse' : ''
                    }`}
                  />
                  {payingInvoiceId === invoice.id
                    ? 'Paying...'
                    : 'Pay with WebLN'}
                </Button>
              )}
            </div>
          ))}

          {invoices.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No invoices found
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

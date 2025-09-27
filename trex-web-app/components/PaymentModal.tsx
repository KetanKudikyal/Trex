'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Copy, Zap } from 'lucide-react'
import { useState } from 'react'
interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount?: string
  address?: string
  paymentRequest?: string
}

export default function PaymentModal({
  isOpen,
  onClose,
  amount = '0',
  address = '-',
  paymentRequest = '',
}: PaymentModalProps) {
  const [status, _setStatus] = useState<'waiting' | 'paid' | 'failed'>(
    'waiting'
  )
  const [copied, setCopied] = useState(false)

  const handleCopyPaymentRequest = async () => {
    try {
      await navigator.clipboard.writeText(paymentRequest)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy payment request:', err)
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'paid':
        return <div className="h-4 w-4 rounded-full bg-green-500" />
      case 'failed':
        return <div className="h-4 w-4 rounded-full bg-red-500" />
      default:
        return (
          <div className="h-4 w-4 rounded-full bg-yellow-500 animate-pulse" />
        )
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'paid':
        return 'Payment received!'
      case 'failed':
        return 'Payment failed'
      default:
        return 'Waiting for payment...'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Lightning Payment
          </DialogTitle>
          <DialogDescription>
            Complete your Lightning Network payment to proceed with the swap
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Info */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="font-semibold">{amount} sats</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">To:</span>
                <span className="font-mono text-sm">{address}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Request */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Payment Request</label>
            <textarea
              value={paymentRequest}
              readOnly
              rows={4}
              className="font-mono text-sm"
              placeholder="No payment request available"
            />
            <Button
              onClick={handleCopyPaymentRequest}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Copy className="h-4 w-4 mr-2" />
              {copied ? 'Copied!' : 'Copy Payment Request'}
            </Button>
          </div>

          {/* Payment Status */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                {getStatusIcon()}
                <span className="text-sm font-medium">{getStatusText()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Close
            </Button>
            <Button className="flex-1" disabled={status !== 'paid'}>
              Complete Swap
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { Payment } from '@/app/invoices/page'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import useSwapStateStore, { ActiveSwap } from '@/store'
import { Check, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { QRCodeCanvas } from 'qrcode.react'
import * as React from 'react'
import { toast } from 'sonner'
import { useAccount } from 'wagmi'

interface FillOrderModalProps {
  payment: Payment
}

export function FillOrderModal({ payment }: FillOrderModalProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [preimage, setPreimage] = React.useState<string | null>(null)
  const { updatePaymentTransaction } = useSwapStateStore()
  const { address } = useAccount()
  const txHash =
    payment.transactionHash !== '-' ? payment.transactionHash : null
  const isCompleted = !!txHash

  async function createPaymentProof({
    paymentHash,
    preimage,
    amount,
    lightningAddress,
  }: {
    paymentHash: string
    preimage: string
    amount: string
    lightningAddress: string
  }) {
    try {
      const requestBody = {
        paymentHash,
        preimage,
        amount,
        lightningAddress,
      }

      const response = await fetch(`/api/lightning`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to create payment proof:', error)
      throw error
    }
  }

  async function verifyPaymentProof({
    index,
    paymentHash,
    preimage,
    signature,
    publicKey,
    timestamp,
    amount,
    publicKeyXWithPrefix,
    msgHash,
    userAddress,
    lightningAddress,
  }: {
    index: number
    paymentHash: string
    preimage: string
    signature: string
    publicKey: string
    timestamp: number
    amount: string
    publicKeyXWithPrefix: string
    msgHash: string
    userAddress: string
    lightningAddress: string
  }) {
    try {
      const response = await fetch(`/api/oracle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentHash,
          preimage,
          signature,
          publicKey,
          timestamp,
          amount,
          lightningAddress,
          publicKeyXWithPrefix,
          msgHash,
          userAddress,
          shonurrIndex: index,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to verify payment proof:', error)
      throw error
    }
  }

  const handlePayWithWebLN = async ({ swap }: { swap: ActiveSwap }) => {
    if (!window.webln) return
    await window.webln.enable()

    if (!swap?.paymentRequest) {
      toast.error('Swap not available')
      return
    }

    const toastId = toast.loading('Enabling WebLN...')
    try {
      toast.loading('Processing payment...', { id: toastId })
      const paymentResult = await window.webln.sendPayment(swap.paymentRequest)
      setPreimage(paymentResult.preimage)

      // Extract preimage and paymentHash from payment result
      const preimage = paymentResult.preimage
      const paymentHash = paymentResult.paymentHash

      if (!preimage) {
        throw new Error('No preimage received from payment')
      }

      if (!paymentHash) {
        throw new Error('No paymentHash received from payment')
      }

      if (!swap.amount) {
        throw new Error('No amount received from payment')
      }

      toast.loading('Creating payment proof...', { id: toastId })
      const paymentProof = await createPaymentProof({
        paymentHash: paymentHash,
        preimage: preimage,
        amount: swap.amount,
        lightningAddress: swap.lightningAddress,
      })

      toast.loading('Verifying proof...', { id: toastId })
      const verificationResult = await verifyPaymentProof({
        index: Number(payment.id),
        paymentHash: paymentHash,
        preimage: preimage,
        signature: paymentProof.signature,
        publicKey: paymentProof.publicKey,
        timestamp: paymentProof.timestamp,
        amount: swap.amount,
        publicKeyXWithPrefix: paymentProof.publicKeyXWithPrefix,
        msgHash: paymentProof.msgHash,
        userAddress: address!,
        lightningAddress: swap.lightningAddress,
      })
      if (!verificationResult.success) {
        throw new Error('Payment proof verification failed')
      }
      if (verificationResult.hash && payment.paymentHash) {
        updatePaymentTransaction(payment.paymentHash, verificationResult.hash)
      }

      toast.success('Payment completed successfully!', { id: toastId })
    } catch (error) {
      toast.dismiss(toastId)
      console.error('Payment failed:', error)
      toast.error(error instanceof Error ? error.message : 'Payment failed')
    }
  }

  async function handleSubmit() {
    try {
      setIsLoading(true)
      console.log(payment)
      await handlePayWithWebLN({
        swap: {
          amount: payment?.amount?.toString() ?? '1',
          defiAction: {
            metadata: { description: '' },
            recipient: 'kk@wallet.yakihonne.com',
            type: 'release_tokens',
          },
          lightningAddress: 'kk@wallet.yakihonne.com',
          paymentRequest: payment.paymentRequest,
          preimage: preimage || undefined,
          paymentHash: payment.paymentHash,
        },
      })
      toast.success('Order filled successfully')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to fill order'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className="z-50 relative"
          style={{
            background:
              'linear-gradient(to left, rgba(250, 176, 5, 0.8) 0%, rgba(234, 86, 40, 0.8) 100%)',
          }}
        >
          Fill Order
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[290px] dark:bg-slate-950">
        <DialogHeader>
          <DialogTitle>Fill Order</DialogTitle>
          <DialogDescription>
            {isLoading
              ? 'Processing your payment...'
              : 'Scan the QR code or click the button below to fill the order.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center mx-auto items-center">
          {isCompleted ? (
            <div className="flex flex-col items-center gap-4">
              <div className="h-[200px] w-[200px] flex items-center justify-center bg-green-100/10 rounded-lg">
                <Check className="h-24 w-24 text-green-500" />
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="h-[200px] w-[200px] flex items-center justify-center bg-gradient-to-br from-blue-50/20 to-purple-50/20 rounded-lg border border-white/10">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Processing payment...
              </p>
            </div>
          ) : (
            <QRCodeCanvas size={200} level="M" value={payment.paymentRequest} />
          )}
        </div>
        <DialogFooter className="w-full mt-2">
          {isCompleted ? (
            <Link
              target="_blank"
              href={`https://explorer.testnet.citrea.xyz/tx/${txHash}`}
            >
              <Button
                style={{
                  background:
                    'linear-gradient(to left, rgba(250, 176, 5, 0.8) 0%, rgba(234, 86, 40, 0.8) 100%)',
                }}
                disabled={isLoading}
                className="z-50 w-[100%] cursor-pointer"
              >
                Schnorr Sig Txn {txHash?.slice(0, 2)}...{txHash?.slice(-4)}
              </Button>
            </Link>
          ) : (
            <Button
              style={{
                background:
                  'linear-gradient(to left, rgba(250, 176, 5, 0.8) 0%, rgba(234, 86, 40, 0.8) 100%)',
              }}
              onClick={handleSubmit}
              disabled={isLoading}
              className="z-50 w-[100%] cursor-pointer"
            >
              {isLoading ? 'Filling Order...' : 'Fill Order'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

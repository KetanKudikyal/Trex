'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import useSwapStateStore from '@/store'
import { PaymentProof } from '@/types'
import { Check, Coins, Copy, Zap } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface SwapModalProps {
  children: React.ReactNode
}

export default function CreateSwapModal({ children }: SwapModalProps) {
  const { activeSwap, setActiveSwap } = useSwapStateStore()
  const [lightningAddress, setLightningAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [copied, setCopied] = useState(false)
  const [txHash, setTransactionHash] = useState('')
  const [operationState, setOperationState] = useState<
    | 'idle'
    | 'enabling-webln'
    | 'creating-swap'
    | 'paying'
    | 'creating-proof'
    | 'verifying-proof'
    | 'success'
    | 'error'
  >('idle')
  const [preimage, setPreimage] = useState<string | null>(null)

  const handleCopy = async () => {
    if (!activeSwap?.paymentRequest) return
    await navigator.clipboard.writeText(activeSwap.paymentRequest)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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

  async function verifyPaymentProof(proof: PaymentProof) {
    try {
      const response = await fetch(`/api/oracle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proof,
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

  const handlePayWithWebLN = async () => {
    if (!window.webln || !activeSwap?.paymentRequest) return
    try {
      setOperationState('enabling-webln')
      await window.webln.enable()

      setOperationState('paying')
      const paymentResult = await window.webln.sendPayment(
        activeSwap.paymentRequest
      )
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

      if (!activeSwap.amount) {
        throw new Error('No amount received from payment')
      }

      setOperationState('creating-proof')
      const paymentProof = await createPaymentProof({
        paymentHash: paymentHash,
        preimage: preimage,
        amount: activeSwap.amount,
        lightningAddress: activeSwap.lightningAddress,
      })

      setOperationState('verifying-proof')
      const verificationResult = await verifyPaymentProof(paymentProof)
      if (!verificationResult.success) {
        throw new Error('Payment proof verification failed')
      }
      if (verificationResult.txHash) {
        setTransactionHash(verificationResult.txHash)
      }
      setOperationState('success')
    } catch (error) {
      console.error('Payment failed:', error)
      setOperationState('error')
    }
  }

  const handleSwap = async () => {
    try {
      if (!window.webln) return
      await window.webln.enable()

      const generateSwapId = (): string => {
        return `swap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
      const newInvoice = await window.webln.makeInvoice({
        amount: amount,
        defaultMemo: `Swap ${generateSwapId()}`,
      })

      setActiveSwap({
        amount: amount,
        lightningAddress: lightningAddress,
        defiAction: {
          type: 'release',
          recipient: lightningAddress,
          metadata: { description: description },
        },
        paymentRequest: newInvoice.paymentRequest,
      })
    } catch (error) {
      console.error('error', error)
      setActiveSwap(null)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[600px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Create Lightning Swap
          </DialogTitle>
          <DialogDescription>
            Exchange Lightning Network payments for Citrea tokens using Schnorr
            signatures
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!activeSwap ? (
            <>
              {/* Lightning Address */}
              <div className="space-y-2">
                <Label htmlFor="lightning-address">Lightning Address</Label>
                <Input
                  id="lightning-address"
                  type="text"
                  placeholder="recipient@lightning.address"
                  value={lightningAddress}
                  onChange={(e) => setLightningAddress(e.target.value)}
                  className="text-lg"
                />
              </div>

              {/* Amount in sats */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (sats)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="1000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-lg"
                />
              </div>

              {/* DeFi Action */}
              <div className="space-y-2">
                <Label htmlFor="defi-action">DeFi Action</Label>
                <select
                  id="defi-action"
                  className="w-full p-2 border rounded-md bg-background"
                  defaultValue="release"
                >
                  <option value="release">Release Tokens</option>
                  <option value="unlock_funds">Unlock Funds</option>
                  <option value="mint_nft">Mint NFT</option>
                  <option value="custom">Custom Action</option>
                </select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  type="text"
                  placeholder="Swap description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-lg"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleSwap}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={!lightningAddress || !amount}
                >
                  <Coins className="h-4 w-4 mr-2" />
                  Create Swap
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">Lightning Payment</h3>
                </div>

                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Amount:</span>
                  <span className="font-mono">{amount} sats</span>
                </div>

                <div className="flex justify-between items-center text-muted-foreground">
                  <span>To:</span>
                  <span className="font-mono">{lightningAddress}</span>
                </div>

                <div className="space-y-2">
                  <Label>Payment Request</Label>
                  <div className="p-4 bg-muted rounded-lg break-all font-mono text-sm h-[200px] overflow-y-auto">
                    {activeSwap.paymentRequest}
                  </div>
                  {operationState !== 'success' && (
                    <div className="flex gap-3">
                      <Button
                        variant="default"
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        onClick={handlePayWithWebLN}
                      >
                        <Zap
                          className={`h-4 w-4 mr-2 ${
                            operationState !== 'idle' ? 'animate-pulse' : ''
                          }`}
                        />
                        {operationState === 'enabling-webln'
                          ? 'Enabling WebLN...'
                          : operationState === 'paying'
                          ? 'Paying...'
                          : operationState === 'creating-proof'
                          ? 'Creating Proof...'
                          : operationState === 'verifying-proof'
                          ? 'Verifying...'
                          : 'Pay with WebLN'}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handleCopy}
                      >
                        {copied ? (
                          <Check className="h-4 w-4 mr-2" />
                        ) : (
                          <Copy className="h-4 w-4 mr-2" />
                        )}
                        {copied ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                  )}
                </div>

                {operationState === 'success' ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-500">
                      <Check className="h-5 w-5" />
                      <span className="font-medium">Payment Successful!</span>
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
                          <span>Payment Proof (Preimage)</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8"
                            onClick={() => {
                              if (preimage) {
                                navigator.clipboard.writeText(preimage)
                                setCopied(true)
                                setTimeout(() => setCopied(false), 2000)
                              }
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <code className="text-xs break-all">{preimage}</code>
                      </div>
                      {txHash && (
                        <div className="p-4 bg-muted rounded-lg">
                          <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
                            <span>Transaction Hash</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8"
                              onClick={() => {
                                navigator.clipboard.writeText(txHash)
                                setCopied(true)
                                setTimeout(() => setCopied(false), 2000)
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <Link
                            href={`https://explorer.citrea.xyz/tx/${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs break-all text-blue-500 hover:text-blue-600 underline"
                          >
                            {txHash}
                          </Link>
                        </div>
                      )}
                    </div>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => {
                        setActiveSwap(null)
                        setOperationState('idle')
                        setPreimage(null)
                      }}
                    >
                      Close
                    </Button>
                  </div>
                ) : operationState === 'error' ? (
                  <div className="flex items-center gap-2 text-red-500">
                    <span className="font-medium">
                      Payment failed. Please try again.
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span>
                      {operationState === 'idle'
                        ? 'Ready to pay via WebLN'
                        : operationState === 'enabling-webln'
                        ? 'Enabling WebLN...'
                        : operationState === 'paying'
                        ? 'Processing payment...'
                        : operationState === 'creating-proof'
                        ? 'Creating payment proof...'
                        : operationState === 'verifying-proof'
                        ? 'Verifying payment...'
                        : 'Processing...'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

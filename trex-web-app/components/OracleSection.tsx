'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle, XCircle } from 'lucide-react'
import { useState } from 'react'

export default function OracleSection() {
  const [oracleStatus, _setOracleStatus] = useState<
    'connecting' | 'connected' | 'disconnected'
  >('connecting')
  const [blockHeight, _setBlockHeight] = useState<string>('-')
  const [walletBalance, _setWalletBalance] = useState<string>('-')
  const [walletAddress, _setWalletAddress] = useState<string>('-')
  const [paymentHash, setPaymentHash] = useState('')
  const [verificationResult, setVerificationResult] = useState<string>('')

  const handleVerifyPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!paymentHash.trim()) return

    // TODO: Implement payment verification logic
    console.log('Verifying payment hash:', paymentHash)
    setVerificationResult('Payment verification in progress...')

    // Simulate verification
    setTimeout(() => {
      setVerificationResult('Payment verified successfully!')
    }, 2000)
  }

  const getStatusIcon = () => {
    switch (oracleStatus) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return (
          <div className="h-4 w-4 rounded-full bg-yellow-500 animate-pulse" />
        )
    }
  }

  const getStatusText = () => {
    switch (oracleStatus) {
      case 'connected':
        return 'Connected'
      case 'disconnected':
        return 'Disconnected'
      default:
        return 'Connecting...'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Oracle Status</h2>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-white">{getStatusText()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Block Height
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              {blockHeight}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Wallet Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              {walletBalance}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Wallet Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-mono text-gray-800 break-all">
              {walletAddress}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">Payment Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerifyPayment} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payment-hash">Payment Hash</Label>
              <Input
                id="payment-hash"
                type="text"
                placeholder="Enter payment hash"
                value={paymentHash}
                onChange={(e) => setPaymentHash(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              Verify Payment
            </Button>
          </form>
          {verificationResult && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">{verificationResult}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

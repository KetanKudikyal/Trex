'use client'
import CreateSwapModal from '@/components/CreateSwapModal'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { ArrowRight, Bolt, Coins, Shield } from 'lucide-react'
import { useAccount } from 'wagmi'

export default function Home() {
  const { openConnectModal } = useConnectModal()
  const { address } = useAccount()
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center space-y-8 max-w-4xl mx-auto mb-24">
        <h1 className="text-7xl font-extrabold tracking-tight text-white">
          Scriptless Atomic Swaps
        </h1>
        <p className="text-2xl text-white leading-relaxed">
          Exchange Lightning Network payments for Citrea tokens using
          <span className="text-yellow-300 font-semibold">
            Schnorr signatures
          </span>
        </p>

        <div className="flex gap-6 z-50 relative justify-center pt-8">
          <CreateSwapModal>
            <Button size="lg" variant="outline">
              Create Swap
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CreateSwapModal>
          {!address && (
            <Button size="lg" onClick={openConnectModal}>
              Connect Wallet
            </Button>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
        <Card className="bg-black/40 border-white/20 backdrop-blur-lg hover:bg-black/50 transition-all duration-300">
          <CardHeader>
            <Bolt className="h-12 w-12 text-yellow-300 mb-4" />
            <CardTitle className="text-xl text-white font-semibold">
              Lightning Fast
            </CardTitle>
            <CardDescription className="text-gray-200 text-base">
              Execute swaps instantly with Lightning Network's speed
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-black/40 border-white/20 backdrop-blur-lg hover:bg-black/50 transition-all duration-300">
          <CardHeader>
            <Shield className="h-12 w-12 text-yellow-300 mb-4" />
            <CardTitle className="text-xl text-white font-semibold">
              Secure by Design
            </CardTitle>
            <CardDescription className="text-gray-200 text-base">
              Trustless atomic swaps with Schnorr signatures
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-black/40 border-white/20 backdrop-blur-lg hover:bg-black/50 transition-all duration-300">
          <CardHeader>
            <Coins className="h-12 w-12 text-yellow-300 mb-4" />
            <CardTitle className="text-xl text-white font-semibold">
              Low Fees
            </CardTitle>
            <CardDescription className="text-gray-200 text-base">
              Minimal transaction costs on Lightning Network
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'TOTAL SWAPS', value: '0' },
          { title: 'COMPLETED', value: '0' },
          { title: 'PENDING', value: '0' },
          { title: 'SUCCESS RATE', value: '0%' },
        ].map((stat, index) => (
          <Card
            key={index}
            className="bg-black/40 border-white/20 backdrop-blur-lg hover:bg-black/50 transition-all duration-300 group"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-300">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

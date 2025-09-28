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
import {
  Activity,
  ArrowRight,
  Bolt,
  CheckCircle,
  Coins,
  DollarSign,
  Network,
  Shield,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import { useAccount } from 'wagmi'

export default function CitreaLightningHub() {
  const { openConnectModal } = useConnectModal()
  const { address } = useAccount()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center space-y-8 max-w-4xl mx-auto mb-24">
        <h1 className="text-7xl font-extrabold tracking-tight text-white">
          CLN Hub
        </h1>
        <p className="text-2xl text-white leading-relaxed">
          Manage your Lightning Network liquidity hub and earn rewards through
          <span className="text-yellow-300 font-semibold"> T-REX Protocol</span>
        </p>
        <p className="text-lg text-gray-300 leading-relaxed">
          Generate Lightning invoices, manage inbound liquidity, and earn cBTC
          rewards for providing routing capacity to the Lightning Network.
        </p>

        <div className="flex gap-6 z-50 relative justify-center pt-8">
          <CreateSwapModal>
            <Button
              style={{
                background:
                  'linear-gradient(to left, rgba(250, 176, 5, 0.8) 0%, rgba(234, 86, 40, 0.8) 100%)',
              }}
              size="lg"
              variant="outline"
            >
              Generate Invoice
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CreateSwapModal>
        </div>
      </div>

      {/* Hub Features Section */}
      <div className="mb-24">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          🏗️ Hub Capabilities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-black/40 border-white/20 backdrop-blur-lg hover:bg-black/50 transition-all duration-300">
            <CardHeader>
              <Network className="h-12 w-12 text-yellow-300 mb-4" />
              <CardTitle className="text-xl text-white font-semibold">
                Lightning Routing
              </CardTitle>
              <CardDescription className="text-gray-200 text-base">
                Route Lightning payments efficiently with increased inbound
                liquidity capacity
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-black/40 border-white/20 backdrop-blur-lg hover:bg-black/50 transition-all duration-300">
            <CardHeader>
              <Coins className="h-12 w-12 text-yellow-300 mb-4" />
              <CardTitle className="text-xl text-white font-semibold">
                Earn Rewards
              </CardTitle>
              <CardDescription className="text-gray-200 text-base">
                Generate Lightning invoices to receive inbound liquidity and
                earn cBTC rewards
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-black/40 border-white/20 backdrop-blur-lg hover:bg-black/50 transition-all duration-300">
            <CardHeader>
              <Shield className="h-12 w-12 text-yellow-300 mb-4" />
              <CardTitle className="text-xl text-white font-semibold">
                Privacy Protected
              </CardTitle>
              <CardDescription className="text-gray-200 text-base">
                Schnorr-Private-2.0 ensures Lightning invoice details remain
                off-chain
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Hub Management Section */}
      <div className="mb-24">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          ⚡ Hub Management
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-black/40 border-white/20 backdrop-blur-lg hover:bg-black/50 transition-all duration-300">
            <CardHeader>
              <Bolt className="h-12 w-12 text-yellow-300 mb-4" />
              <CardTitle className="text-xl text-white font-semibold">
                Lightning Invoice Generation
              </CardTitle>
              <CardDescription className="text-gray-200 text-base">
                Create Lightning invoices to attract inbound liquidity from
                users. Each paid invoice increases your hub's routing capacity
                and earns you rewards.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Generate invoices with custom amounts
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Automatic reward distribution
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Privacy-preserving verification
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/20 backdrop-blur-lg hover:bg-black/50 transition-all duration-300">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-yellow-300 mb-4" />
              <CardTitle className="text-xl text-white font-semibold">
                Liquidity Analytics
              </CardTitle>
              <CardDescription className="text-gray-200 text-base">
                Monitor your hub's performance, routing statistics, and reward
                earnings in real-time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Activity className="h-4 w-4 text-blue-400" />
                  Track routing volume and fees
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  Monitor cBTC rewards earned
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Users className="h-4 w-4 text-purple-400" />
                  View liquidity provider statistics
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hub Statistics */}
      <div className="mb-24">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          📊 Hub Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { title: 'INBOUND LIQUIDITY', value: '0 sats', icon: Zap },
            { title: 'ROUTING VOLUME', value: '0 sats', icon: Activity },
            { title: 'REWARDS EARNED', value: '0 cBTC', icon: Coins },
            { title: 'SUCCESS RATE', value: '0%', icon: CheckCircle },
          ].map((stat, index) => (
            <Card
              key={index}
              className="bg-black/40 border-white/20 backdrop-blur-lg hover:bg-black/50 transition-all duration-300 group"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <stat.icon className="h-5 w-5 text-yellow-300" />
                  <CardTitle className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                    {stat.title}
                  </CardTitle>
                </div>
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

      {/* How It Works Section */}
      <div className="mb-24">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          🔄 How Your Hub Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-black/40 border-white/20 backdrop-blur-lg hover:bg-black/50 transition-all duration-300">
            <CardHeader>
              <div className="text-2xl font-bold text-yellow-300 mb-2">1</div>
              <CardTitle className="text-xl text-white font-semibold">
                Generate Invoice
              </CardTitle>
              <CardDescription className="text-gray-200 text-base">
                Create Lightning invoices to request inbound liquidity from
                users. Set amounts and descriptions to attract liquidity
                providers.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-black/40 border-white/20 backdrop-blur-lg hover:bg-black/50 transition-all duration-300">
            <CardHeader>
              <div className="text-2xl font-bold text-yellow-300 mb-2">2</div>
              <CardTitle className="text-xl text-white font-semibold">
                Receive Liquidity
              </CardTitle>
              <CardDescription className="text-gray-200 text-base">
                Users pay your invoices, increasing your hub's inbound capacity.
                This enables you to route more Lightning payments efficiently.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-black/40 border-white/20 backdrop-blur-lg hover:bg-black/50 transition-all duration-300">
            <CardHeader>
              <div className="text-2xl font-bold text-yellow-300 mb-2">3</div>
              <CardTitle className="text-xl text-white font-semibold">
                Earn Rewards
              </CardTitle>
              <CardDescription className="text-gray-200 text-base">
                Get rewarded with cBTC tokens and protocol incentives for
                providing Lightning Network liquidity and routing capacity.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="text-center space-y-8 max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-white">🌟 Hub Benefits</h2>
        <p className="text-lg text-gray-300 leading-relaxed">
          As a Citrea Lightning Hub, you become a crucial part of the Lightning
          Network infrastructure. By providing routing capacity and liquidity,
          you earn rewards while supporting the growth of Bitcoin's Lightning
          Network and Citrea's DeFi ecosystem.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <div className="text-left">
            <h3 className="text-xl font-semibold text-white mb-4">
              For Your Hub:
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                Increased routing capacity and efficiency
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                Better Lightning Network participation
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                Enhanced Bitcoin-DeFi bridge capabilities
              </li>
            </ul>
          </div>
          <div className="text-left">
            <h3 className="text-xl font-semibold text-white mb-4">
              For the Ecosystem:
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                Improved Lightning Network liquidity distribution
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                Enhanced Bitcoin-DeFi interoperability
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                Scalable Lightning routing incentives
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

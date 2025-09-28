'use client'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Bolt,
  CheckCircle,
  Coins,
  ExternalLink,
  Lock,
  Network,
  Shield,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center space-y-8 max-w-4xl mx-auto mb-24">
        <h1 className="text-7xl font-extrabold tracking-tight text-white">
          T-REX Protocol
        </h1>
        <p className="text-2xl text-white leading-relaxed mb-4">
          Mining Lightning Liquidity for ZKRollup EVM (Citrea) Node Hubs
        </p>
        <p className="text-lg text-gray-300 leading-relaxed">
          A revolutionary protocol that enables secure, private, and
          gas-efficient cross-chain liquidity mining between the Lightning
          Network and Citrea EVM ZkRollups. Incentivize users to provide
          Lightning Network liquidity to Citrea node hubs.
        </p>
      </div>

      {/* Core Concept Section */}
      <div className="mb-24">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          🎯 Core Concept
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="bg-black/40 border-white/20 backdrop-blur-lg hover:bg-black/50 transition-all duration-300">
            <CardHeader>
              <Network className="h-12 w-12 text-yellow-300 mb-4" />
              <CardTitle className="text-xl text-white font-semibold">
                Citrea Node Hubs
              </CardTitle>
              <CardDescription className="text-gray-200 text-base">
                Need inbound Lightning liquidity to route payments efficiently
                and participate in Lightning Network routing
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-black/40 border-white/20 backdrop-blur-lg hover:bg-black/50 transition-all duration-300">
            <CardHeader>
              <Users className="h-12 w-12 text-yellow-300 mb-4" />
              <CardTitle className="text-xl text-white font-semibold">
                Liquidity Providers
              </CardTitle>
              <CardDescription className="text-gray-200 text-base">
                Provide Lightning liquidity by paying invoices, increasing node
                capacity and enabling more transactions
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-black/40 border-white/20 backdrop-blur-lg hover:bg-black/50 transition-all duration-300">
            <CardHeader>
              <Coins className="h-12 w-12 text-yellow-300 mb-4" />
              <CardTitle className="text-xl text-white font-semibold">
                Protocol Incentives
              </CardTitle>
              <CardDescription className="text-gray-200 text-base">
                Reward providers with cBTC tokens, reward tokens, and bonus
                multipliers for high contributions
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Privacy Section */}
      <div className="mb-24">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          🔒 Privacy-First Approach
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-black/40 border-white/20 backdrop-blur-lg hover:bg-black/50 transition-all duration-300">
            <CardHeader>
              <Lock className="h-12 w-12 text-yellow-300 mb-4" />
              <CardTitle className="text-xl text-white font-semibold">
                Schnorr-Private-2.0
              </CardTitle>
              <CardDescription className="text-gray-200 text-base">
                Keeps Lightning invoice details off-chain with arbitrary message
                hashes and trustless Schnorr signature verification
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-black/40 border-white/20 backdrop-blur-lg hover:bg-black/50 transition-all duration-300">
            <CardHeader>
              <Shield className="h-12 w-12 text-yellow-300 mb-4" />
              <CardTitle className="text-xl text-white font-semibold">
                Complete Privacy
              </CardTitle>
              <CardDescription className="text-gray-200 text-base">
                Lightning payment details never exposed on-chain while
                maintaining trustless verification
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Key Features Section */}
      <div className="mb-24">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          🚀 Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-black/40 border-white/20 backdrop-blur-lg hover:bg-black/50 transition-all duration-300">
            <CardHeader>
              <Bolt className="h-12 w-12 text-yellow-300 mb-4" />
              <CardTitle className="text-xl text-white font-semibold">
                Lightning Fast
              </CardTitle>
              <CardDescription className="text-gray-200 text-base">
                Execute swaps instantly with Lightning Network's speed and
                minimal fees
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-black/40 border-white/20 backdrop-blur-lg hover:bg-black/50 transition-all duration-300">
            <CardHeader>
              <Zap className="h-12 w-12 text-yellow-300 mb-4" />
              <CardTitle className="text-xl text-white font-semibold">
                Gas Efficient
              </CardTitle>
              <CardDescription className="text-gray-200 text-base">
                Optimized for Citrea's Schnorr precompile with minimal
                transaction costs
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-black/40 border-white/20 backdrop-blur-lg hover:bg-black/50 transition-all duration-300">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-yellow-300 mb-4" />
              <CardTitle className="text-xl text-white font-semibold">
                Scalable
              </CardTitle>
              <CardDescription className="text-gray-200 text-base">
                Supports high-volume Lightning routing with future PTLC
                compatibility
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Protocol Statistics */}
      <div className="mb-24">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          📊 Protocol Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { title: 'TOTAL cBTC ALLOCATED', value: '0' },
            { title: 'REWARD TOKENS DISTRIBUTED', value: '0' },
            { title: 'LIQUIDITY PROVIDERS', value: '0' },
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

      {/* Deployment Information */}
      <div className="mb-24">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          🚀 Live on Citrea Testnet
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-black/40 border-white/20 backdrop-blur-lg hover:bg-black/50 transition-all duration-300">
            <CardHeader>
              <CheckCircle className="h-12 w-12 text-green-400 mb-4" />
              <CardTitle className="text-xl text-white font-semibold">
                Core Contracts
              </CardTitle>
              <CardDescription className="text-gray-200 text-base space-y-2">
                <div className="flex items-center justify-between">
                  <span>TrexToken:</span>
                  <a
                    href="https://explorer.testnet.citrea.xyz/address/0x94c17DD37ED3Ca85764b35BfD4d1CCc543b1bE3E"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-300 hover:text-yellow-200 flex items-center gap-1"
                  >
                    0x94c1...1bE3E <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span>LightningOraclePrivate:</span>
                  <a
                    href="https://explorer.testnet.citrea.xyz/address/0xc36B6BFa0ce8C6bdD8efcCd23CeC2E425768f64a"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-300 hover:text-yellow-200 flex items-center gap-1"
                  >
                    0xc36B...8f64a <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span>DeFiContractPrivate:</span>
                  <a
                    href="https://explorer.testnet.citrea.xyz/address/0x90e97EF730B28B14b3F5f9214f47312796b6c10e"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-300 hover:text-yellow-200 flex items-center gap-1"
                  >
                    0x90e9...6c10e <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-black/40 border-white/20 backdrop-blur-lg hover:bg-black/50 transition-all duration-300">
            <CardHeader>
              <Network className="h-12 w-12 text-yellow-300 mb-4" />
              <CardTitle className="text-xl text-white font-semibold">
                Network Details
              </CardTitle>
              <CardDescription className="text-gray-200 text-base space-y-2">
                <div>
                  <span className="font-semibold">Chain ID:</span> 5115
                </div>
                <div>
                  <span className="font-semibold">RPC URL:</span>
                  <a
                    href="https://rpc.testnet.citrea.xyz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-300 hover:text-yellow-200 ml-2"
                  >
                    rpc.testnet.citrea.xyz
                  </a>
                </div>
                <div>
                  <span className="font-semibold">Explorer:</span>
                  <a
                    href="https://explorer.testnet.citrea.xyz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-300 hover:text-yellow-200 ml-2"
                  >
                    explorer.testnet.citrea.xyz
                  </a>
                </div>
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Vision Section */}
      <div className="text-center space-y-8 max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-white">🏆 Vision</h2>
        <p className="text-lg text-gray-300 leading-relaxed">
          T-REX envisions a future where Lightning Network liquidity seamlessly
          flows into DeFi ecosystems, creating a robust, private, and
          incentive-aligned bridge between Bitcoin's Lightning Network and
          Citrea's DeFi infrastructure. By mining liquidity from Lightning to
          Citrea node hubs, we're building the foundation for a truly
          decentralized and efficient Bitcoin-DeFi economy.
        </p>
        <div className="text-2xl font-bold text-yellow-300">
          ⚡🔗 Mining Lightning Liquidity for a Better DeFi Future
        </div>
      </div>
    </div>
  )
}

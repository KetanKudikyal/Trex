'use client'
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { citreaTestnet } from 'wagmi/chains'

const config = getDefaultConfig({
  appName: 'Lightning Client trex',
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
  chains: [citreaTestnet],
  ssr: false,
})

const queryClient = new QueryClient()

const Providers: React.FC<{ children: React.ReactNode }> = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default Providers

import { createPublicClient, http } from 'viem'
import { citreaTestnet } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: citreaTestnet,
  transport: http('https://rpc.testnet.citrea.xyz'),
})

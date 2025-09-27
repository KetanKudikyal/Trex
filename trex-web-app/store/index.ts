import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

type ActiveSwap = {
  lightningAddress: any
  amount: string
  defiAction: {
    type: any
    recipient: string
    metadata: {
      description: any
    }
  }
  paymentRequest?: string
  preimage?: string
  paymentHash?: string
} | null

interface SwapState {
  activeSwap: ActiveSwap
  setActiveSwap: (swap: ActiveSwap) => void
}

const useSwapStateStore = create<SwapState>()(
  devtools(
    persist(
      (set) => ({
        activeSwap: null,
        setActiveSwap: (swap) => set({ activeSwap: swap }),
      }),
      {
        name: 'trex-storage',
      }
    )
  )
)

export default useSwapStateStore

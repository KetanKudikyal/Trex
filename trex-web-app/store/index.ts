import { defaultInvoices } from '@/hooks/defaultInvoices'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface Payment {
  id: string
  paymentRequest: string
  paymentHash: string
  transactionHash: string
  amount: number
  description: string
}

export type ActiveSwap = {
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
  invoices: Payment[]
  setActiveSwap: (swap: ActiveSwap) => void
  updatePaymentTransaction: (paymentHash: string, txHash: string) => void
}

const useSwapStateStore = create<SwapState>()(
  devtools(
    persist(
      (set) => ({
        activeSwap: null,
        invoices: defaultInvoices,
        setActiveSwap: (swap) => set({ activeSwap: swap }),
        updatePaymentTransaction: (paymentHash, txHash) =>
          set((state) => ({
            invoices: state.invoices.map((invoice) =>
              invoice.paymentHash === paymentHash
                ? { ...invoice, transactionHash: txHash }
                : invoice
            ),
          })),
      }),
      {
        name: 'trex-storage',
      }
    )
  )
)

export default useSwapStateStore

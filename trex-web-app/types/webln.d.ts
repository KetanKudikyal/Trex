interface WebLNProvider {
  enable: () => Promise<void>
  makeInvoice: (args: {
    amount: string
    defaultMemo?: string
  }) => Promise<{ paymentRequest: string; paymentHash: string }>
  sendPayment: (
    paymentRequest: string
  ) => Promise<{ preimage: string; paymentHash: string }>
}

interface Window {
  webln?: WebLNProvider
}

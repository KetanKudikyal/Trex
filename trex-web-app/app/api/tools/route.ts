import { LightningAddress } from '@getalby/lightning-tools/lnurl'

export const GET = async (request: Request) => {
  const ln = new LightningAddress('kk@wallet.yakihonne.com')

  await ln.fetch()

  for (let i = 0; i < 3; i++) {
    const invoice = await ln.requestInvoice({ satoshi: 10 })

    console.log({
      [i]: {
        paymentRequest: invoice.paymentRequest,
        paymentHash: invoice.paymentHash,
      },
    })
  }

  return new Response('Hello, world!')
}

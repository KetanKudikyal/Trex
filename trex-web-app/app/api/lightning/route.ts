import { SchnorrUtils } from '@/utils/schnorr'
import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

export const POST = async (req: Request) => {
  try {
    const { paymentHash, preimage, amount, lightningAddress } = await req.json()
    console.log('🔐 Extracted parameters:', {
      paymentHash,
      preimage,
      amount,
      lightningAddress,
    })

    if (!paymentHash || !preimage || !amount || !lightningAddress) {
      console.log('❌ Missing required parameters:', {
        hasPaymentHash: !!paymentHash,
        hasPreimage: !!preimage,
        hasAmount: !!amount,
        hasLightningAddress: !!lightningAddress,
      })
      return NextResponse.json(
        {
          error:
            'Payment hash, preimage, amount, and Lightning address are required',
        },
        { status: 400 }
      )
    }

    const storedKey = await kv.get(lightningAddress)
    let privateKey: Uint8Array | null = null

    if (
      storedKey &&
      typeof storedKey === 'object' &&
      'type' in storedKey &&
      storedKey.type === 'Buffer' &&
      'data' in storedKey &&
      Array.isArray(storedKey.data)
    ) {
      privateKey = new Uint8Array(storedKey.data)
    }

    if (!privateKey) {
      console.log(
        '🔐 Generating new private key for address:',
        lightningAddress
      )
      privateKey = SchnorrUtils.generatePrivateKey()
      console.log(
        '🔐 Generated new private key for address:',
        JSON.stringify(privateKey)
      )
      // Store private key as a Buffer object
      await kv.set(lightningAddress, {
        type: 'Buffer',
        data: Array.from(privateKey),
      })
    } else {
      console.log(
        '🔐 Using existing private key for address:',
        lightningAddress,
        privateKey
      )
    }

    const proof = SchnorrUtils.createPaymentProof(
      paymentHash,
      preimage,
      amount,
      privateKey
    )

    return NextResponse.json(proof)
  } catch (error) {
    console.log('error', error)
    return NextResponse.json(
      { error: 'Failed to create payment proof' },
      { status: 500 }
    )
  }
}

import { SchnorrUtils } from '@/utils/schnorr'
import { kv } from '@vercel/kv'
import { ethers } from 'ethers'
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
    await kv.del(lightningAddress)
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

    console.log('🔐 Creating payment proof with parameters:', {
      paymentHash,
      preimage,
      amount,
      privateKeyLength: privateKey.length,
    })

    const proof = SchnorrUtils.createPaymentProof(
      paymentHash,
      preimage,
      amount,
      privateKey
    )

    console.log('🔐 Payment proof created successfully:', {
      hasSignature: !!proof.signature,
      hasPublicKey: !!proof.publicKey,
      timestamp: proof.timestamp,
    })

    const publicKeyX = proof.publicKey.slice(2, 66)
    const publicKeyXWithPrefix = `0x${publicKeyX}`
    const timestamp = Math.floor(Date.now() / 1000)
    const message = `lightning_payment:${paymentHash}:${preimage}:${amount}:${timestamp}`
    const msgHash = ethers.keccak256(ethers.toUtf8Bytes(message))

    return NextResponse.json({
      proof,
      publicKeyXWithPrefix,
      msgHash,
    })
  } catch (error) {
    console.log('error', error)
    return NextResponse.json(
      { error: 'Failed to create payment proof' },
      { status: 500 }
    )
  }
}

import { OracleManagerPrivate } from '@/utils/OracleManagerPrivate'
import { OracleServicePrivate } from '@/utils/OracleService'
import { SchnorrUtils } from '@/utils/schnorr'
import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

export const POST = async (req: Request) => {
  try {
    const {
      paymentHash,
      preimage,
      signature,
      publicKey,
      timestamp,
      amount,
      publicKeyXWithPrefix,
      msgHash,
      userAddress,
      lightningAddress,
    } = await req.json()
    const oracleServicePrivate = new OracleServicePrivate()
    const oracleManagerPrivate = new OracleManagerPrivate()
    const proof = {
      paymentHash,
      preimage,
      signature,
      publicKey,
      timestamp,
      amount,
      msgHash,
      userAddress,
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

    if (!proof) {
      return NextResponse.json({ error: 'Proof is required' }, { status: 400 })
    }

    // const res  = await oracleManagerPrivate.completePrivateVerificationFlow({
    //   paymentHash: proof.paymentHash,
    //   preimage: proof.preimage,
    //   privateKey: privateKey,
    //   publicKeyX: publicKeyXWithPrefix,
    //   userAddress: userAddress,
    //   invoiceAmount: amount.toString(),
    // })

    const result = await oracleServicePrivate.emergencyVerifyMessage(
      msgHash,
      publicKeyXWithPrefix,
      userAddress,
      amount.toString()
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('error', error)
    return NextResponse.json(
      { error: 'Failed to create payment proof' },
      { status: 500 }
    )
  }
}

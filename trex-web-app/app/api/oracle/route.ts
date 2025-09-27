import { OracleService } from '@/utils/OracleService'
import { NextResponse } from 'next/server'

export const POST = async (req: Request) => {
  try {
    const { proof } = await req.json()
    const oracleService = new OracleService()
    if (!proof) {
      return NextResponse.json({ error: 'Proof is required' }, { status: 400 })
    }

    const result = await oracleService.verifyPaymentProof(proof)
    return NextResponse.json(result)
  } catch (error) {
    console.error('error', error)
    return NextResponse.json(
      { error: 'Failed to create payment proof' },
      { status: 500 }
    )
  }
}

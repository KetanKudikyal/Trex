import { OracleServicePrivate } from '@/utils/OracleService'
import { NextResponse } from 'next/server'

export const POST = async (req: Request) => {
  try {
    const { amount, userAddress, shonurrIndex } = await req.json()
    const oracleServicePrivate = new OracleServicePrivate()

    const result = await oracleServicePrivate.emergencyVerifyMessage(
      userAddress,
      amount.toString(),
      shonurrIndex
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

'use server'

import {
  GenerateAuthenticationOptionsOpts,
  GenerateRegistrationOptionsOpts,
  VerifyAuthenticationResponseOpts,
  VerifyRegistrationResponseOpts,
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server'
import { isoBase64URL } from '@simplewebauthn/server/helpers'
import {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/typescript-types'
import * as cbor from 'cbor'
import { origin, rpId } from './constants'
import {
  UserDevice,
  createUser,
  findUser,
  getCurrentSession,
  updateCurrentSession,
} from './user'

export const generateWebAuthnRegistrationOptions = async (email: string) => {
  const user = await findUser(email)

  if (user) {
    return {
      success: false,
      message: 'User already exists',
    }
  }

  const opts: GenerateRegistrationOptionsOpts = {
    rpName: 'SimpleWebAuthn Example',
    rpID: rpId,
    userID: email,
    userName: email,
    timeout: 60000,
    attestationType: 'none',
    excludeCredentials: [],
    authenticatorSelection: {
      residentKey: 'discouraged',
    },
    /**
     * Support the two most common algorithms: ES256, and RS256
     */
    supportedAlgorithmIDs: [-7, -257],
  }

  const options = await generateRegistrationOptions(opts)

  await updateCurrentSession({ currentChallenge: options.challenge, email })

  return {
    success: true,
    data: options,
  }
}

export const verifyWebAuthnRegistration = async (
  data: RegistrationResponseJSON
) => {
  const {
    data: { email, currentChallenge },
  } = await getCurrentSession()

  if (!email || !currentChallenge) {
    return {
      success: false,
      message: 'Session expired',
    }
  }

  const expectedChallenge = currentChallenge

  const opts: VerifyRegistrationResponseOpts = {
    response: data,
    expectedChallenge: `${expectedChallenge}`,
    expectedOrigin: origin,
    expectedRPID: rpId,
    requireUserVerification: false,
  }
  const verification = await verifyRegistrationResponse(opts)

  const { verified, registrationInfo } = verification

  if (!verified || !registrationInfo) {
    return {
      success: false,
      message: 'Registration failed',
    }
  }

  const { credentialPublicKey, credentialID, counter } = registrationInfo

  /**
   * Add the returned device to the user's list of devices
   */
  const newDevice: UserDevice = {
    credentialPublicKey: isoBase64URL.fromBuffer(credentialPublicKey),
    credentialID: isoBase64URL.fromBuffer(credentialID),
    counter,
    transports: data.response.transports,
  }

  await updateCurrentSession({})

  try {
    await createUser(email, [newDevice])
  } catch {
    return {
      success: false,
      message: 'User already exists',
    }
  }

  return {
    success: true,
  }
}

export const generateWebAuthnLoginOptions = async (email: string) => {
  const user = await findUser(email)

  if (!user) {
    return {
      success: false,
      message: 'User does not exist',
    }
  }

  const opts: GenerateAuthenticationOptionsOpts = {
    timeout: 60000,
    allowCredentials: user.devices.map((dev) => ({
      id: isoBase64URL.toBuffer(dev.credentialID),
      type: 'public-key',
      transports: dev.transports,
    })),
    userVerification: 'required',
    rpID: rpId,
  }
  const options = await generateAuthenticationOptions(opts)

  await updateCurrentSession({ currentChallenge: options.challenge, email })

  return {
    success: true,
    data: options,
  }
}

export const verifyWebAuthnLogin = async (data: AuthenticationResponseJSON) => {
  const {
    data: { email, currentChallenge },
  } = await getCurrentSession()

  if (!email || !currentChallenge) {
    return {
      success: false,
      message: 'Session expired',
    }
  }

  const user = await findUser(email)

  if (!user) {
    return {
      success: false,
      message: 'User does not exist',
    }
  }

  const dbAuthenticator = user.devices.find(
    (dev) => dev.credentialID === data.rawId
  )

  if (!dbAuthenticator) {
    return {
      success: false,
      message: 'Authenticator is not registered with this site',
    }
  }

  const opts: VerifyAuthenticationResponseOpts = {
    response: data,
    expectedChallenge: `${currentChallenge}`,
    expectedOrigin: origin,
    expectedRPID: rpId,
    authenticator: {
      ...dbAuthenticator,
      credentialID: isoBase64URL.toBuffer(dbAuthenticator.credentialID),
      credentialPublicKey: isoBase64URL.toBuffer(
        dbAuthenticator.credentialPublicKey
      ),
    },
    requireUserVerification: true,
  }
  const verification = await verifyAuthenticationResponse(opts)

  await updateCurrentSession({})

  if (!verification.verified) {
    return {
      success: false,
      message: 'Authentication failed',
    }
  }

  // Extract signature data from WebAuthn response
  const signature = isoBase64URL.toBuffer(data.response.signature)
  const clientDataJSON = JSON.parse(
    new TextDecoder().decode(
      isoBase64URL.toBuffer(data.response.clientDataJSON)
    )
  )

  // Create message hash from clientDataJSON
  const clientDataHash = new Uint8Array(
    await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(JSON.stringify(clientDataJSON))
    )
  )

  // Combine authenticatorData and clientDataHash for the message
  const authenticatorData = isoBase64URL.toBuffer(
    data.response.authenticatorData
  )
  const messageHash = new Uint8Array(
    authenticatorData.length + clientDataHash.length
  )
  messageHash.set(authenticatorData, 0)
  messageHash.set(clientDataHash, authenticatorData.length)

  // Hash the combined data
  const finalMessageHash = await crypto.subtle.digest('SHA-256', messageHash)

  // Extract r and s from the signature (DER format)
  // WebAuthn signatures are in DER format, we need to extract r and s
  const signatureArray = new Uint8Array(signature)

  // Parse DER signature to extract r and s
  // DER format: 0x30 [length] 0x02 [r_length] [r] 0x02 [s_length] [s]
  let offset = 0

  // Skip DER header
  if (signatureArray[offset] !== 0x30) {
    return {
      success: false,
      message: 'Invalid signature format',
    }
  }
  offset += 2 // Skip 0x30 and length byte

  // Extract r
  if (signatureArray[offset] !== 0x02) {
    return {
      success: false,
      message: 'Invalid signature format',
    }
  }
  const rLength = signatureArray[offset + 1]
  offset += 2
  const r = signatureArray.slice(offset, offset + rLength)
  offset += rLength

  // Extract s
  if (signatureArray[offset] !== 0x02) {
    return {
      success: false,
      message: 'Invalid signature format',
    }
  }
  const sLength = signatureArray[offset + 1]
  offset += 2
  const s = signatureArray.slice(offset, offset + sLength)

  // Extract public key components from credentialPublicKey (COSE format)
  const credentialPublicKey = isoBase64URL.toBuffer(
    dbAuthenticator.credentialPublicKey
  )

  // Parse COSE key to extract x and y coordinates
  // COSE format for ES256: {1: 2, -1: 1, -2: x, -3: y}
  let pubKeyX: Uint8Array
  let pubKeyY: Uint8Array

  try {
    // Parse the COSE key using CBOR
    const coseKey = cbor.decode(credentialPublicKey)

    console.log('COSE Key structure:', coseKey)
    console.log('Available keys:', Array.from(coseKey.keys()))

    // COSE key structure can vary, let's check multiple possible formats
    // Standard COSE: {1: 2, -1: 1, -2: x, -3: y} or {1: 2, -1: 1, -2: x, -4: y}
    // Some implementations use different key numbers

    let xCoord: Uint8Array | null = null
    let yCoord: Uint8Array | null = null

    // Try different possible key combinations
    const possibleXKeys = [-2, -3, 2, 3]
    const possibleYKeys = [-3, -4, 3, 4]

    for (const xKey of possibleXKeys) {
      if (coseKey.get(xKey)) {
        const coord = coseKey.get(xKey)
        console.log(`Found potential x coordinate at key ${xKey}:`, coord)
        if (coord && coord.length === 32) {
          xCoord = new Uint8Array(coord)
          console.log('Using x coordinate from key:', xKey)
          break
        }
      }
    }

    for (const yKey of possibleYKeys) {
      if (coseKey.get(yKey)) {
        const coord = coseKey.get(yKey)
        console.log(`Found potential y coordinate at key ${yKey}:`, coord)
        if (coord && coord.length === 32) {
          yCoord = new Uint8Array(coord)
          console.log('Using y coordinate from key:', yKey)
          break
        }
      }
    }

    if (xCoord && yCoord) {
      pubKeyX = xCoord
      pubKeyY = yCoord

      console.log('Extracted pubKeyX length:', pubKeyX.length)
      console.log('Extracted pubKeyY length:', pubKeyY.length)

      // Validate that we have 32-byte coordinates for P-256
      if (pubKeyX.length !== 32 || pubKeyY.length !== 32) {
        return {
          success: false,
          message: 'Invalid public key coordinate length',
        }
      }
    } else {
      // Log all key-value pairs for debugging
      console.log('All COSE key entries:')
      for (const [key, value] of coseKey.entries()) {
        console.log(
          `Key ${key}:`,
          value,
          typeof value,
          Array.isArray(value) ? value.length : 'not array'
        )
      }

      return {
        success: false,
        message:
          'Could not find x and y coordinates in COSE key. Available keys: ' +
          Array.from(coseKey.keys()).join(', '),
      }
    }
  } catch (error) {
    return {
      success: false,
      message:
        'Failed to parse COSE public key: ' +
        (error instanceof Error ? error.message : String(error)),
    }
  }

  // Convert to hex strings and pad to 32 bytes (64 hex chars)
  const messageHashHex = Array.from(new Uint8Array(finalMessageHash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .padStart(64, '0')
    .slice(-64)

  const rHex = Array.from(r)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .padStart(64, '0')
    .slice(-64)

  const sHex = Array.from(s)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .padStart(64, '0')
    .slice(-64)

  const pubKeyXHex = Array.from(pubKeyX)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .padStart(64, '0')
    .slice(-64)

  const pubKeyYHex = Array.from(pubKeyY)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .padStart(64, '0')
    .slice(-64)

  return {
    success: true,
    data: {
      messageHash: `0x${messageHashHex}`,
      r: `0x${rHex}`,
      s: `0x${sHex}`,
      pubKeyX: `0x${pubKeyXHex}`,
      pubKeyY: `0x${pubKeyYHex}`,
    },
  }
}

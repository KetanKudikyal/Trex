'use client'

import { VerifierCallAbi } from '@/abi/VerifierCallAbi'
import { publicClient } from '@/libraries/viem'
import {
  generateWebAuthnLoginOptions,
  generateWebAuthnRegistrationOptions,
  verifyWebAuthnLogin,
  verifyWebAuthnRegistration,
} from '@/libraries/webauthn'
import { startAuthentication, startRegistration } from '@simplewebauthn/browser'
import styles from './page.module.css'

export const VerifierCallAddress = '0x37B49Ce12161043dAF8f722B9D7964F1b5b3919e'

export default function Home() {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email')?.toString()
    const type = formData.get('type')?.toString()

    if (!email) {
      return
    }

    if (type === 'register') {
      const response = await generateWebAuthnRegistrationOptions(email)

      if (!response.success || !response.data) {
        alert(response.message ?? 'Something went wrong!')
        return
      }

      const localResponse = await startRegistration(response.data)
      console.log('localResponse', localResponse)
      const verifyResponse = await verifyWebAuthnRegistration(localResponse)
      console.log('verifyResponse', verifyResponse)

      if (!verifyResponse.success) {
        alert(verifyResponse.message ?? 'Something went wrong!')
        return
      }

      alert('Registration successful!')
    } else {
      const response = await generateWebAuthnLoginOptions(email)

      if (!response.success || !response.data) {
        alert(response.message ?? 'Something went wrong!')
        return
      }

      const localResponse = await startAuthentication(response.data)
      console.log('localResponse', localResponse)

      const verifyResponse = await verifyWebAuthnLogin(localResponse)
      console.log('verifyResponse', verifyResponse)

      if (!verifyResponse.success || !verifyResponse.data) {
        alert(verifyResponse.message ?? 'Something went wrong!')
        return
      }

      const isVerfied = await publicClient.readContract({
        abi: VerifierCallAbi,
        address: VerifierCallAddress,
        functionName: 'callP256R1Verify',
        args: [
          verifyResponse.data.messageHash as `0x${string}`,
          verifyResponse.data.r as `0x${string}`,
          verifyResponse.data.s as `0x${string}`,
          verifyResponse.data.pubKeyX as `0x${string}`,
          verifyResponse.data.pubKeyY as `0x${string}`,
        ],
      })
      console.log('isVerfied', isVerfied)

      alert('Login successful!')
    }
  }

  return (
    <main className={styles.main}>
      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          className={styles.inputField}
        />

        <div className={styles.radioGroup}>
          <label className={styles.label}>
            <input
              type="radio"
              name="type"
              value="register"
              defaultChecked
              className={styles.radioInput}
            />
            Register
          </label>

          <label className={styles.label}>
            <input
              type="radio"
              name="type"
              value="login"
              className={styles.radioInput}
            />
            Login
          </label>
        </div>

        <input type="submit" value="Submit" className={styles.submitButton} />
      </form>
    </main>
  )
}

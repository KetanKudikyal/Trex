import { Invoice, LightningAddress } from '@getalby/lightning-tools'
import * as crypto from 'crypto'
import { LightningAddressData, LightningInvoice } from '../types/index'
import { WebLNUtils } from './webln.js'

/**
 * Lightning Network utilities using @getalby/lightning-tools
 */

export class LightningUtils {
  /**
   * Create a Lightning address instance
   */
  static createLightningAddress(address: string): LightningAddress {
    return new LightningAddress(address)
  }

  /**
   * Fetch Lightning address data
   */
  static async fetchLightningAddressData(
    address: string
  ): Promise<LightningAddressData> {
    try {
      const ln = new LightningAddress(address)
      await ln.fetch()

      return {
        address,
        lnurlpData: ln.lnurlpData,
        keysendData: ln.keysendData,
        isSupported: !!(ln.lnurlpData || ln.keysendData),
      }
    } catch (error) {
      console.error('Failed to fetch Lightning address data:', error)
      return {
        address,
        isSupported: false,
      }
    }
  }

  /**
   * Request an invoice from a Lightning address
   */
  static async requestInvoice(
    address: string,
    amount: number,
    description?: string
  ): Promise<LightningInvoice> {
    try {
      const ln = new LightningAddress(address)
      await ln.fetch()

      const invoice = await ln.requestInvoice({
        satoshi: amount,
        comment: description,
      })

      return {
        paymentRequest: invoice.paymentRequest,
        paymentHash: invoice.paymentHash,
        amount,
        description,
        timestamp: Date.now(),
        expiry: 3600, // 1 hour default expiry
      }
    } catch (error) {
      console.error('Failed to request invoice:', error)
      throw new Error(
        `Failed to request invoice: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  }

  /**
   * Verify if an invoice has been paid
   */
  static async verifyPayment(invoice: LightningInvoice): Promise<boolean> {
    try {
      console.log(
        '🔍 Verifying Lightning payment for invoice:',
        invoice.paymentHash
      )

      // Try WebLN verification first (most reliable)
      if (WebLNUtils.isAvailable()) {
        console.log('🔍 Trying WebLN verification...')
        try {
          const weblnResult = await WebLNUtils.verifyPayment(
            invoice.paymentRequest
          )
          if (weblnResult.isPaid) {
            console.log('✅ WebLN verification successful')
            return true
          }
          console.log('⚠️ WebLN verification: payment not found')
        } catch (weblnError) {
          console.log('⚠️ WebLN verification failed:', weblnError)
        }
      }

      // Fallback to LNURL verification
      console.log('🔍 Falling back to LNURL verification...')
      const invoiceInstance = new Invoice({
        pr: invoice.paymentRequest,
      })

      try {
        const isPaid = await invoiceInstance.isPaid()
        console.log('✅ LNURL verification result:', isPaid)

        if (isPaid === undefined || isPaid === null) {
          console.log("⚠️ LNURL provider doesn't support payment verification")
          return false
        }

        return isPaid
      } catch (networkError) {
        console.log(
          '⚠️ LNURL verification failed:',
          networkError instanceof Error ? networkError.message : 'Unknown error'
        )

        // Try alternative verification method: check if we can get a preimage
        try {
          console.log(
            '🔍 Trying alternative verification via preimage check...'
          )
          const preimage = await this.getPaymentPreimage(invoice)
          if (preimage && preimage.length > 0) {
            console.log('✅ Payment verified via preimage detection')
            return true
          }
        } catch (preimageError) {
          console.log(
            '⚠️ Preimage verification also failed:',
            preimageError instanceof Error
              ? preimageError.message
              : 'Unknown error'
          )
        }

        console.log('⚠️ Payment verification not available - will retry later')
        return false
      }
    } catch (error) {
      console.error('Failed to verify payment:', error)
      return false
    }
  }

  /**
   * Get payment preimage if available
   */
  static async getPaymentPreimage(
    invoice: LightningInvoice
  ): Promise<string | null> {
    try {
      console.log(
        '🔍 Getting preimage for Lightning payment:',
        invoice.paymentHash
      )

      // Try WebLN first (most reliable)
      if (WebLNUtils.isAvailable()) {
        console.log('🔍 Trying WebLN preimage retrieval...')
        try {
          const preimage = await WebLNUtils.getPaymentPreimage(
            invoice.paymentRequest
          )
          if (preimage) {
            console.log('✅ WebLN preimage found:', preimage)
            return preimage
          }
        } catch (weblnError) {
          console.log('⚠️ WebLN preimage retrieval failed:', weblnError)
        }
      }

      // Fallback to LNURL
      console.log('🔍 Falling back to LNURL preimage retrieval...')
      const invoiceInstance = new Invoice({
        pr: invoice.paymentRequest,
      })

      try {
        const isPaid = await invoiceInstance.isPaid()
        if (isPaid && invoiceInstance.preimage) {
          console.log('✅ LNURL preimage found:', invoiceInstance.preimage)
          return invoiceInstance.preimage
        }
        console.log('⚠️ Payment not found or no preimage available')
        return null
      } catch (networkError) {
        console.log(
          '⚠️ LNURL preimage retrieval failed:',
          networkError instanceof Error ? networkError.message : 'Unknown error'
        )

        console.log('⚠️ No preimage available - payment not verified')
        return null
      }
    } catch (error) {
      console.error('Failed to get payment preimage:', error)
      return null
    }
  }

  /**
   * Validate a payment preimage against an invoice
   */
  static async validatePreimage(
    invoice: LightningInvoice,
    preimage: string
  ): Promise<boolean> {
    try {
      console.log(
        '🔍 Validating preimage for real Lightning payment:',
        invoice.paymentHash
      )

      const invoiceInstance = new Invoice({
        pr: invoice.paymentRequest,
        preimage,
      })

      // Try real Lightning Network validation first
      try {
        const isValid = invoiceInstance.validatePreimage(preimage)
        console.log('✅ Real Lightning preimage validation result:', isValid)
        return isValid
      } catch (networkError) {
        console.log(
          '⚠️ Real Lightning validation failed, using basic validation:',
          networkError instanceof Error ? networkError.message : 'Unknown error'
        )

        // Fallback to proper preimage validation using payment hash
        // The preimage should hash to the payment hash
        const preimageHash = crypto
          .createHash('sha256')
          .update(Buffer.from(preimage, 'hex'))
          .digest('hex')
        const isValid = preimageHash === invoice.paymentHash
        console.log('🔍 Preimage validation:', {
          preimage,
          preimageHash,
          paymentHash: invoice.paymentHash,
          isValid,
        })
        return isValid
      }
    } catch (error) {
      console.error('Failed to validate preimage:', error)
      return false
    }
  }

  /**
   * Create a boost payment (value-for-value)
   */
  static async createBoost(
    address: string,
    amount: number,
    metadata: {
      app_name?: string
      app_version?: string
      feedId?: string
      podcast?: string
      episode?: string
      name?: string
      sender_name?: string
    } = {}
  ): Promise<{ preimage: string }> {
    try {
      const ln = new LightningAddress(address)
      await ln.fetch()

      const boost = {
        action: 'boost',
        value_msat: amount * 1000, // Convert to millisatoshis
        value_msat_total: amount * 1000,
        ts: Math.floor(Date.now() / 1000),
        app_name: metadata.app_name || 'Lightning Client',
        app_version: metadata.app_version || '1.0.0',
        feedId: metadata.feedId || '',
        podcast: metadata.podcast || '',
        episode: metadata.episode || '',
        name: metadata.name || '',
        sender_name: metadata.sender_name || '',
      }

      return await ln.boost(boost)
    } catch (error) {
      console.error('Failed to create boost:', error)
      throw new Error(
        `Failed to create boost: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  }

  /**
   * Create a zap payment (Nostr integration)
   */
  static async createZap(
    address: string,
    amount: number,
    options: {
      comment?: string
      relays?: string[]
      e?: string // Event ID
      p?: string // Pubkey
    } = {}
  ): Promise<{ preimage: string }> {
    try {
      const ln = new LightningAddress(address)
      await ln.fetch()

      const result = await ln.zap({
        satoshi: amount,
        comment: options.comment,
        relays: options.relays || ['wss://relay.damus.io'],
        e: options.e,
        p: options.p,
      })

      return { preimage: result.preimage || '' }
    } catch (error) {
      console.error('Failed to create zap:', error)
      throw new Error(
        `Failed to create zap: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  }

  /**
   * Decode a Lightning invoice
   */
  static decodeInvoice(paymentRequest: string): LightningInvoice {
    try {
      const invoice = new Invoice({ pr: paymentRequest })

      return {
        paymentRequest,
        paymentHash: invoice.paymentHash,
        amount: invoice.satoshi || 0,
        description: invoice.description || undefined,
        timestamp: invoice.createdDate
          ? invoice.createdDate.getTime()
          : Date.now(),
        expiry: invoice.expiryDate
          ? Math.floor((invoice.expiryDate.getTime() - Date.now()) / 1000)
          : 3600,
      }
    } catch (error) {
      console.error('Failed to decode invoice:', error)
      throw new Error(
        `Failed to decode invoice: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  }
}

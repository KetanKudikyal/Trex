import { LightningInvoice } from "../types/index.js";

/**
 * WebLN utilities for Lightning Network interactions
 * Provides better payment verification and preimage access
 */

export class WebLNUtils {
  private static webln: any = null;

  /**
   * Check if WebLN is available
   */
  static isAvailable(): boolean {
    return typeof window !== "undefined" && window.webln !== undefined;
  }

  /**
   * Enable WebLN
   */
  static async enable(): Promise<boolean> {
    try {
      if (!this.isAvailable()) {
        console.log("⚠️ WebLN not available");
        return false;
      }

      this.webln = window.webln;
      await this.webln.enable();
      console.log("✅ WebLN enabled successfully");
      return true;
    } catch (error) {
      console.error("❌ Failed to enable WebLN:", error);
      return false;
    }
  }

  /**
   * Request an invoice using WebLN
   */
  static async requestInvoice(
    amount: number,
    description?: string
  ): Promise<LightningInvoice | null> {
    try {
      if (!this.webln) {
        const enabled = await this.enable();
        if (!enabled) {
          throw new Error("WebLN not available");
        }
      }

      const invoice = await this.webln.makeInvoice({
        amount: amount, // Use sats directly (WebLN handles conversion)
        defaultMemo: description || "Lightning payment",
      });

      return {
        paymentRequest: invoice.paymentRequest,
        paymentHash: invoice.paymentHash,
        amount: amount,
        description: description || "",
        timestamp: Date.now(),
        expiry: 3600, // 1 hour default
      };
    } catch (error) {
      console.error("Failed to request invoice via WebLN:", error);
      return null;
    }
  }

  /**
   * Send a payment using WebLN
   */
  static async sendPayment(paymentRequest: string): Promise<{
    preimage: string;
    paymentHash: string;
  } | null> {
    try {
      if (!this.webln) {
        const enabled = await this.enable();
        if (!enabled) {
          throw new Error("WebLN not available");
        }
      }

      const result = await this.webln.sendPayment(paymentRequest);

      return {
        preimage: result.preimage,
        paymentHash: result.paymentHash,
      };
    } catch (error) {
      console.error("Failed to send payment via WebLN:", error);
      return null;
    }
  }

  /**
   * Verify if a payment was made using WebLN
   * This is more reliable than LNURL verification
   */
  static async verifyPayment(paymentRequest: string): Promise<{
    isPaid: boolean;
    preimage?: string;
  }> {
    try {
      if (!this.webln) {
        const enabled = await this.enable();
        if (!enabled) {
          return { isPaid: false };
        }
      }

      // Try to get payment details
      const paymentDetails = await this.webln.getPaymentDetails(paymentRequest);

      if (paymentDetails && paymentDetails.status === "paid") {
        return {
          isPaid: true,
          preimage: paymentDetails.preimage,
        };
      }

      return { isPaid: false };
    } catch (error) {
      console.log("WebLN payment verification failed:", error);
      return { isPaid: false };
    }
  }

  /**
   * Get payment preimage using WebLN
   */
  static async getPaymentPreimage(
    paymentRequest: string
  ): Promise<string | null> {
    try {
      if (!this.webln) {
        const enabled = await this.enable();
        if (!enabled) {
          return null;
        }
      }

      const paymentDetails = await this.webln.getPaymentDetails(paymentRequest);
      return paymentDetails?.preimage || null;
    } catch (error) {
      console.error("Failed to get preimage via WebLN:", error);
      return null;
    }
  }

  /**
   * Check if user has a Lightning wallet connected
   */
  static async isConnected(): Promise<boolean> {
    try {
      if (!this.isAvailable()) {
        return false;
      }

      this.webln = window.webln;
      return await this.webln.isEnabled();
    } catch (error) {
      return false;
    }
  }

  /**
   * Get wallet info
   */
  static async getWalletInfo(): Promise<{
    alias: string;
    pubkey: string;
    color: string;
  } | null> {
    try {
      if (!this.webln) {
        const enabled = await this.enable();
        if (!enabled) {
          return null;
        }
      }

      return await this.webln.getInfo();
    } catch (error) {
      console.error("Failed to get wallet info:", error);
      return null;
    }
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    webln: any;
  }
}

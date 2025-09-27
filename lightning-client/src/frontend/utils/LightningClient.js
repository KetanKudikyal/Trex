/**
 * Lightning Client utility for interacting with Lightning Network
 */
export class LightningClient {
  constructor() {
    this.baseUrl = "http://localhost:3001/api/lightning";
  }

  async init() {
    console.log("Initializing Lightning Client...");
    // Any initialization logic here
  }

  /**
   * Fetch Lightning address data
   */
  async fetchLightningAddress(address) {
    try {
      const response = await fetch(
        `${this.baseUrl}/address/${encodeURIComponent(address)}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch Lightning address:", error);
      throw error;
    }
  }

  /**
   * Request an invoice from a Lightning address
   */
  async requestInvoice(address, amount, description) {
    try {
      const requestData = {
        address,
        amount,
        description,
      };

      console.log("🔍 Requesting invoice with data:", requestData);

      const response = await fetch(`${this.baseUrl}/invoice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Invoice request failed:", response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Invoice created successfully:", result);
      return result;
    } catch (error) {
      console.error("Failed to request invoice:", error);
      throw error;
    }
  }

  /**
   * Verify if an invoice has been paid
   */
  async verifyPayment(invoice) {
    try {
      console.log(
        "🔍 Frontend: Verifying payment for invoice:",
        invoice.paymentHash
      );

      const response = await fetch(`${this.baseUrl}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentRequest: invoice.paymentRequest,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "❌ Frontend: Payment verification failed:",
          response.status,
          errorText
        );
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("🔍 Frontend: Verification result:", result);
      console.log("🔍 Frontend: isPaid:", result.isPaid);

      return result.isPaid;
    } catch (error) {
      console.error("Failed to verify payment:", error);
      return false;
    }
  }

  /**
   * Get payment preimage
   */
  async getPaymentPreimage(invoice) {
    try {
      const response = await fetch(`${this.baseUrl}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentRequest: invoice.paymentRequest,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.preimage;
    } catch (error) {
      console.error("Failed to get payment preimage:", error);
      return null;
    }
  }

  /**
   * Manually verify payment with preimage (for when LNURL verification fails)
   */
  async verifyPaymentManual(invoice, preimage) {
    try {
      console.log("🔍 Frontend: Manual verification with preimage:", preimage);

      const response = await fetch(`${this.baseUrl}/verify-manual`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentRequest: invoice.paymentRequest,
          preimage: preimage,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "❌ Frontend: Manual verification failed:",
          response.status,
          errorText
        );
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("🔍 Frontend: Manual verification result:", result);

      return result.isPaid && result.verified;
    } catch (error) {
      console.error("Failed to manually verify payment:", error);
      return false;
    }
  }

  /**
   * Decode a Lightning invoice
   */
  async decodeInvoice(paymentRequest) {
    try {
      const response = await fetch(`${this.baseUrl}/decode`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentRequest,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to decode invoice:", error);
      throw error;
    }
  }

  /**
   * Create a boost payment
   */
  async createBoost(address, amount, metadata = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/boost`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
          amount,
          metadata,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to create boost:", error);
      throw error;
    }
  }

  /**
   * Create a zap payment
   */
  async createZap(address, amount, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/zap`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
          amount,
          options,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to create zap:", error);
      throw error;
    }
  }

  /**
   * Create a payment proof
   */
  async createPaymentProof(paymentHash, preimage, amount, lightningAddress) {
    try {
      const requestBody = {
        paymentHash,
        preimage,
        amount,
        lightningAddress,
      };

      console.log("🔐 Frontend: Creating payment proof with:", requestBody);

      const response = await fetch(`${this.baseUrl}/proof`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to create payment proof:", error);
      throw error;
    }
  }

  /**
   * Verify a payment proof
   */
  async verifyPaymentProof(proof) {
    try {
      const response = await fetch(`${this.baseUrl}/verify-proof`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          proof,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.isValid;
    } catch (error) {
      console.error("Failed to verify payment proof:", error);
      return false;
    }
  }
}

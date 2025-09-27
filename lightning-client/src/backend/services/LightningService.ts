import { LightningUtils } from "../../shared/utils/lightning.js";
import { SchnorrUtils } from "../../shared/utils/schnorr.js";
import {
  LightningInvoice,
  PaymentProof,
  LightningAddressData,
} from "../../shared/types/index.js";

/**
 * Lightning Network service for handling Lightning payments and address operations
 */
export class LightningService {
  private isConnectedFlag = false;
  private privateKeys = new Map<string, Uint8Array>(); // Store private keys for each address

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      // Initialize Lightning service
      this.isConnectedFlag = true;
      console.log("✅ Lightning service initialized");
    } catch (error) {
      console.error("❌ Failed to initialize Lightning service:", error);
      this.isConnectedFlag = false;
    }
  }

  /**
   * Check if Lightning service is connected
   */
  isConnected(): boolean {
    return this.isConnectedFlag;
  }

  /**
   * Fetch Lightning address data
   */
  async fetchLightningAddress(address: string): Promise<LightningAddressData> {
    try {
      return await LightningUtils.fetchLightningAddressData(address);
    } catch (error) {
      console.error("Failed to fetch Lightning address:", error);
      throw new Error(
        `Failed to fetch Lightning address: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Request an invoice from a Lightning address
   */
  async requestInvoice(
    address: string,
    amount: number,
    description?: string
  ): Promise<LightningInvoice> {
    try {
      return await LightningUtils.requestInvoice(address, amount, description);
    } catch (error) {
      console.error("Failed to request invoice:", error);
      throw new Error(
        `Failed to request invoice: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Verify if an invoice has been paid
   */
  async verifyPayment(invoice: LightningInvoice): Promise<boolean> {
    try {
      return await LightningUtils.verifyPayment(invoice);
    } catch (error) {
      console.error("Failed to verify payment:", error);
      return false;
    }
  }

  /**
   * Get payment preimage if available
   */
  async getPaymentPreimage(invoice: LightningInvoice): Promise<string | null> {
    try {
      return await LightningUtils.getPaymentPreimage(invoice);
    } catch (error) {
      console.error("Failed to get payment preimage:", error);
      return null;
    }
  }

  /**
   * Validate a payment preimage against an invoice
   */
  async validatePreimage(
    invoice: LightningInvoice,
    preimage: string
  ): Promise<boolean> {
    try {
      return await LightningUtils.validatePreimage(invoice, preimage);
    } catch (error) {
      console.error("Failed to validate preimage:", error);
      return false;
    }
  }

  /**
   * Create a payment proof with Schnorr signature
   */
  async createPaymentProof(
    paymentHash: string,
    preimage: string,
    amount: number,
    lightningAddress: string
  ): Promise<PaymentProof> {
    try {
      console.log("🔐 Creating payment proof with params:", {
        paymentHash,
        preimage,
        amount,
        lightningAddress,
      });

      // Get or generate private key for this address
      let privateKey = this.privateKeys.get(lightningAddress);
      if (!privateKey) {
        console.log(
          "🔐 Generating new private key for address:",
          lightningAddress
        );
        privateKey = SchnorrUtils.generatePrivateKey();
        this.privateKeys.set(lightningAddress, privateKey);
      } else {
        console.log(
          "🔐 Using existing private key for address:",
          lightningAddress
        );
      }

      const proof = SchnorrUtils.createPaymentProof(
        paymentHash,
        preimage,
        amount,
        privateKey
      );

      console.log("✅ Payment proof created successfully:", proof);
      return proof;
    } catch (error) {
      console.error("❌ Failed to create payment proof:", error);
      throw new Error(
        `Failed to create payment proof: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Verify a payment proof
   */
  verifyPaymentProof(proof: PaymentProof): boolean {
    try {
      return SchnorrUtils.verifyPaymentProof(proof);
    } catch (error) {
      console.error("Failed to verify payment proof:", error);
      return false;
    }
  }

  /**
   * Create a boost payment
   */
  async createBoost(
    address: string,
    amount: number,
    metadata: {
      app_name?: string;
      app_version?: string;
      feedId?: string;
      podcast?: string;
      episode?: string;
      name?: string;
      sender_name?: string;
    } = {}
  ): Promise<{ preimage: string }> {
    try {
      return await LightningUtils.createBoost(address, amount, metadata);
    } catch (error) {
      console.error("Failed to create boost:", error);
      throw new Error(
        `Failed to create boost: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Create a zap payment
   */
  async createZap(
    address: string,
    amount: number,
    options: {
      comment?: string;
      relays?: string[];
      e?: string;
      p?: string;
    } = {}
  ): Promise<{ preimage: string }> {
    try {
      return await LightningUtils.createZap(address, amount, options);
    } catch (error) {
      console.error("Failed to create zap:", error);
      throw new Error(
        `Failed to create zap: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Decode a Lightning invoice
   */
  decodeInvoice(paymentRequest: string): LightningInvoice {
    try {
      return LightningUtils.decodeInvoice(paymentRequest);
    } catch (error) {
      console.error("Failed to decode invoice:", error);
      throw new Error(
        `Failed to decode invoice: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get private key for a Lightning address (for testing purposes)
   */
  getPrivateKey(lightningAddress: string): Uint8Array | null {
    return this.privateKeys.get(lightningAddress) || null;
  }

  /**
   * Set private key for a Lightning address (for testing purposes)
   */
  setPrivateKey(lightningAddress: string, privateKey: Uint8Array): void {
    this.privateKeys.set(lightningAddress, privateKey);
  }
}

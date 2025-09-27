/**
 * Oracle Manager Private - Frontend utility for Schnorr-Private-2.0 integration
 * Handles privacy-preserving Lightning payment verification
 */

import { ethers } from "ethers";

export class OracleManagerPrivate {
  constructor(apiBaseUrl = "http://localhost:3001") {
    this.apiBaseUrl = apiBaseUrl;
    this.baseUrl = `${apiBaseUrl}/api/oracle-private`;
  }

  /**
   * Create a private message hash from Lightning payment details
   * This preserves privacy by keeping Lightning invoice details off-chain
   * @param {string} paymentHash - Lightning payment hash
   * @param {string} preimage - Lightning payment preimage
   * @param {string} userAddress - User's address (optional)
   * @param {number} timestamp - Timestamp (optional)
   * @returns {Promise<string>} Private message hash
   */
  async createPrivateMessageHash(
    paymentHash,
    preimage,
    amount,
    userAddress = null,
    timestamp = null
  ) {
    try {
      // Ensure hex values have 0x prefix for Ethereum compatibility
      const formattedPaymentHash = paymentHash.startsWith("0x")
        ? paymentHash
        : `0x${paymentHash}`;
      const formattedPreimage = preimage.startsWith("0x")
        ? preimage
        : `0x${preimage}`;

      const response = await fetch(`${this.baseUrl}/create-msg-hash`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentHash: formattedPaymentHash,
          preimage: formattedPreimage,
          amount,
          userAddress,
          timestamp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create private message hash");
      }

      return data.msgHash;
    } catch (error) {
      console.error("Error creating private message hash:", error);
      throw error;
    }
  }

  /**
   * Generate a Schnorr signature for a message hash
   * @param {string} privateKey - Private key for signing
   * @param {string} msgHash - Message hash to sign
   * @returns {Promise<string>} Schnorr signature
   */
  async generateSchnorrSignature(privateKey, msgHash) {
    try {
      const response = await fetch(`${this.baseUrl}/generate-signature`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          privateKey,
          msgHash,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate Schnorr signature");
      }

      return data.signature;
    } catch (error) {
      console.error("Error generating Schnorr signature:", error);
      throw error;
    }
  }

  /**
   * Verify a payment proof using private approach (Schnorr-Private-2.0)
   * @param {Object} proof - Payment proof object
   * @param {string} proof.msgHash - Private message hash
   * @param {string} proof.publicKeyX - Public key X coordinate
   * @param {string} proof.signature - Schnorr signature
   * @param {string} proof.userAddress - User's address (required for rewards)
   * @returns {Promise<Object>} Verification result
   */
  async verifyPaymentProof(proof) {
    try {
      const response = await fetch(`${this.baseUrl}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(proof),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify payment proof");
      }

      return data;
    } catch (error) {
      console.error("Error verifying payment proof:", error);
      throw error;
    }
  }

  /**
   * Complete flow: Create msgHash, generate signature, and verify payment proof
   * @param {Object} params - Parameters for the complete flow
   * @param {string} params.paymentHash - Lightning payment hash
   * @param {string} params.preimage - Lightning payment preimage
   * @param {string} params.privateKey - Private key for signing
   * @param {string} params.publicKeyX - Public key X coordinate
   * @param {string} params.userAddress - User's address (optional)
   * @returns {Promise<Object>} Complete verification result
   */
  async completePrivateVerificationFlow(params) {
    try {
      console.log("Starting complete private verification flow...");

      // Step 1: Create private message hash
      console.log("Step 1: Creating private message hash...");
      const msgHash = await this.createPrivateMessageHash(
        params.paymentHash,
        params.preimage,
        params.invoiceAmount,
        params.userAddress
      );
      console.log("Private message hash created:", msgHash);

      // Step 2: Generate Schnorr signature
      console.log("Step 2: Generating Schnorr signature...");
      const signature = await this.generateSchnorrSignature(
        params.privateKey,
        msgHash
      );
      console.log("Schnorr signature generated");

      // Step 3: Verify payment proof
      console.log("Step 3: Verifying payment proof...");
      console.log(
        "🔐 OracleManagerPrivate - Parameters being sent to backend:"
      );
      console.log("🔐 msgHash:", msgHash);
      console.log("🔐 publicKeyX:", params.publicKeyX);
      console.log(
        "🔐 publicKeyX length:",
        params.publicKeyX ? params.publicKeyX.length : "undefined"
      );
      console.log("🔐 signature:", signature);
      console.log("🔐 userAddress:", params.userAddress);
      console.log("🔐 invoiceAmount:", params.invoiceAmount);

      const verificationResult = await this.verifyPaymentProof({
        msgHash,
        publicKeyX: params.publicKeyX,
        signature,
        userAddress: params.userAddress,
        invoiceAmount: params.invoiceAmount,
      });

      console.log("Complete private verification flow successful!");
      return {
        success: true,
        msgHash,
        signature,
        verificationResult,
        message: "Private verification flow completed successfully",
      };
    } catch (error) {
      console.error("Error in complete private verification flow:", error);
      return {
        success: false,
        error: error.message,
        message: "Private verification flow failed",
      };
    }
  }

  /**
   * Check if a message has been verified
   * @param {string} msgHash - Message hash to check
   * @returns {Promise<boolean>} True if verified
   */
  async isMessageVerified(msgHash) {
    try {
      const response = await fetch(
        `${this.baseUrl}/message/${msgHash}/verified`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to check message verification status"
        );
      }

      return data.isVerified;
    } catch (error) {
      console.error("Error checking message verification:", error);
      throw error;
    }
  }

  /**
   * Get message details
   * @param {string} msgHash - Message hash
   * @returns {Promise<Object>} Message details
   */
  async getMessageDetails(msgHash) {
    try {
      const response = await fetch(
        `${this.baseUrl}/message/${msgHash}/details`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get message details");
      }

      return data;
    } catch (error) {
      console.error("Error getting message details:", error);
      throw error;
    }
  }

  /**
   * Get user's cBTC balance
   * @param {string} userAddress - User's address
   * @returns {Promise<string>} cBTC balance
   */
  async getCBTCBalance(userAddress) {
    try {
      const response = await fetch(
        `${this.baseUrl}/user/${userAddress}/cbtc-balance`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get cBTC balance");
      }

      return data.cbtcBalance;
    } catch (error) {
      console.error("Error getting cBTC balance:", error);
      throw error;
    }
  }

  /**
   * Get user's reward token balance
   * @param {string} userAddress - User's address
   * @returns {Promise<string>} Reward token balance
   */
  async getRewardBalance(userAddress) {
    try {
      const response = await fetch(
        `${this.baseUrl}/user/${userAddress}/reward-balance`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get reward balance");
      }

      return data.rewardBalance;
    } catch (error) {
      console.error("Error getting reward balance:", error);
      throw error;
    }
  }

  /**
   * Get total liquidity provided by user
   * @param {string} userAddress - User's address
   * @returns {Promise<string>} Total liquidity provided
   */
  async getTotalLiquidityProvided(userAddress) {
    try {
      const response = await fetch(
        `${this.baseUrl}/user/${userAddress}/liquidity`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get total liquidity provided");
      }

      return data.totalLiquidityProvided;
    } catch (error) {
      console.error("Error getting total liquidity provided:", error);
      throw error;
    }
  }

  /**
   * Get comprehensive user statistics
   * @param {string} userAddress - User's address
   * @returns {Promise<Object>} User statistics
   */
  async getUserStats(userAddress) {
    try {
      const response = await fetch(`${this.baseUrl}/user/${userAddress}/stats`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get user statistics");
      }

      return data;
    } catch (error) {
      console.error("Error getting user statistics:", error);
      throw error;
    }
  }

  /**
   * Get protocol statistics
   * @returns {Promise<Object>} Protocol statistics
   */
  async getProtocolStats() {
    try {
      const response = await fetch(`${this.baseUrl}/protocol/stats`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get protocol statistics");
      }

      return data;
    } catch (error) {
      console.error("Error getting protocol statistics:", error);
      throw error;
    }
  }

  /**
   * Get contract addresses
   * @returns {Promise<Object>} Contract addresses
   */
  async getContractAddresses() {
    try {
      const response = await fetch(`${this.baseUrl}/contracts`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get contract addresses");
      }

      return data.contracts;
    } catch (error) {
      console.error("Error getting contract addresses:", error);
      throw error;
    }
  }

  /**
   * Check if the private oracle service is connected
   * @returns {Promise<Object>} Service status
   */
  async getServiceStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/status`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get service status");
      }

      return data;
    } catch (error) {
      console.error("Error getting service status:", error);
      throw error;
    }
  }

  /**
   * Emergency function to verify a message (for testing only)
   * @param {string} msgHash - Message hash
   * @param {string} publicKeyX - Public key X coordinate
   * @param {string} userAddress - User address
   * @param {string} invoiceAmount - Invoice amount
   * @returns {Promise<Object>} Emergency verification result
   */
  async emergencyVerifyMessage(
    msgHash,
    publicKeyX,
    userAddress,
    invoiceAmount
  ) {
    try {
      const response = await fetch(`${this.baseUrl}/emergency-verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          msgHash,
          publicKeyX,
          userAddress,
          invoiceAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to emergency verify message");
      }

      return data;
    } catch (error) {
      console.error("Error in emergency message verification:", error);
      throw error;
    }
  }

  // Compatibility methods for main.js integration

  /**
   * Initialize the oracle manager (compatibility method)
   * @returns {Promise<void>}
   */
  async init() {
    // No initialization needed for private oracle
    console.log("OracleManagerPrivate initialized");
  }

  /**
   * Get oracle status (compatibility method)
   * @returns {Promise<Object>} Oracle status
   */
  async getStatus() {
    return await this.getServiceStatus();
  }

  /**
   * Load contract info (compatibility method)
   * @returns {Promise<Object>} Contract information
   */
  async loadContractInfo() {
    return await this.getContractAddresses();
  }

  /**
   * Load token info (compatibility method)
   * @param {string} userAddress - User address (optional)
   * @returns {Promise<Object>} Token information
   */
  async loadTokenInfo(userAddress = null) {
    try {
      const contracts = await this.getContractAddresses();
      const stats = await this.getProtocolStats();

      return {
        contracts,
        stats,
        userAddress:
          userAddress || "0x0000000000000000000000000000000000000000",
      };
    } catch (error) {
      console.error("Error loading token info:", error);
      throw error;
    }
  }
}

// Export for use in other modules
export default OracleManagerPrivate;

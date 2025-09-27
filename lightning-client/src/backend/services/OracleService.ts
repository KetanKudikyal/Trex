import { ethers } from "ethers";
import {
  PaymentProof,
  OracleVerificationResult,
  CitreaTransaction,
} from "../../shared/types/index.js";
import { SchnorrUtils } from "../../shared/utils/schnorr.js";

/**
 * Oracle service for interacting with Citrea Lightning Oracle contract
 */
export class OracleService {
  private provider: ethers.Provider | null = null;
  private wallet: ethers.Wallet | null = null;
  private oracleContract: ethers.Contract | null = null;
  private isConnectedFlag = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      // Initialize Citrea provider
      const rpcUrl = process.env.CITREA_RPC_URL;
      const privateKey = process.env.CITREA_PRIVATE_KEY;
      const oracleAddress = process.env.ORACLE_CONTRACT_ADDRESS;

      if (!rpcUrl || !privateKey) {
        throw new Error(
          "Missing required environment variables for Citrea connection"
        );
      }

      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      this.wallet = new ethers.Wallet(privateKey, this.provider);

      // Oracle contract ABI (simplified)
      const oracleABI = [
        "function verifyPaymentProof(bytes32 paymentHash, bytes32 preimage, uint256 amount, bytes32 publicKeyX, bytes calldata signature) external returns (bool)",
        "function isPaymentVerified(bytes32 paymentHash) external view returns (bool)",
        "function getPaymentDetails(bytes32 paymentHash) external view returns (uint256 amount, uint256 timestamp, bool verified)",
        "event PaymentVerified(bytes32 indexed paymentHash, address indexed verifier, uint256 amount, uint256 timestamp)",
        "event PaymentRejected(bytes32 indexed paymentHash, string reason)",
      ];

      // Only initialize contract if address is provided
      if (oracleAddress) {
        this.oracleContract = new ethers.Contract(
          oracleAddress,
          oracleABI,
          this.wallet
        );
        console.log(`🔗 Oracle contract: ${oracleAddress}`);
      } else {
        console.log(
          "⚠️  Oracle contract not deployed - running in simulation mode"
        );
      }

      this.isConnectedFlag = true;
      console.log("✅ Oracle service initialized");
      console.log(`📡 Connected to Citrea at ${rpcUrl}`);
    } catch (error) {
      console.error("❌ Failed to initialize Oracle service:", error);
      this.isConnectedFlag = false;
    }
  }

  /**
   * Check if Oracle service is connected
   */
  isConnected(): boolean {
    return this.isConnectedFlag;
  }

  /**
   * Verify a payment proof on-chain
   */
  async verifyPaymentProof(
    proof: PaymentProof
  ): Promise<OracleVerificationResult> {
    if (!this.oracleContract) {
      // Simulation mode - verify signature locally
      console.log(
        "🔍 Running in simulation mode - verifying signature locally"
      );

      try {
        // Verify the payment proof locally using imported SchnorrUtils
        const isValid = SchnorrUtils.verifyPaymentProof(proof);

        return {
          isValid,
          paymentHash: proof.paymentHash,
          amount: proof.amount,
          timestamp: proof.timestamp,
          error: isValid ? undefined : "Local signature verification failed",
        };
      } catch (error) {
        return {
          isValid: false,
          paymentHash: proof.paymentHash,
          amount: proof.amount,
          timestamp: proof.timestamp,
          error: `Simulation verification failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        };
      }
    }

    try {
      // Convert signature to the format expected by the contract
      const signature = Buffer.from(proof.signature, "hex");

      // Extract public key X coordinate (first 32 bytes)
      const publicKey = Buffer.from(proof.publicKey, "hex");
      const publicKeyX = publicKey.slice(0, 32);

      // Call the oracle contract
      const tx = await this.oracleContract.verifyPaymentProof(
        proof.paymentHash,
        proof.preimage,
        proof.amount,
        publicKeyX,
        signature
      );

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        return {
          isValid: true,
          paymentHash: proof.paymentHash,
          amount: proof.amount,
          timestamp: proof.timestamp,
        };
      } else {
        return {
          isValid: false,
          paymentHash: proof.paymentHash,
          amount: proof.amount,
          timestamp: proof.timestamp,
          error: "Transaction failed",
        };
      }
    } catch (error) {
      console.error("Failed to verify payment proof on-chain:", error);
      return {
        isValid: false,
        paymentHash: proof.paymentHash,
        amount: proof.amount,
        timestamp: proof.timestamp,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Check if a payment has been verified on-chain
   */
  async isPaymentVerified(paymentHash: string): Promise<boolean> {
    if (!this.oracleContract) {
      return false;
    }

    try {
      return await this.oracleContract.isPaymentVerified(paymentHash);
    } catch (error) {
      console.error("Failed to check payment verification status:", error);
      return false;
    }
  }

  /**
   * Get payment details from the oracle contract
   */
  async getPaymentDetails(paymentHash: string): Promise<{
    amount: number;
    timestamp: number;
    verified: boolean;
  } | null> {
    if (!this.oracleContract) {
      return null;
    }

    try {
      const [amount, timestamp, verified] =
        await this.oracleContract.getPaymentDetails(paymentHash);
      return {
        amount: Number(amount),
        timestamp: Number(timestamp),
        verified,
      };
    } catch (error) {
      console.error("Failed to get payment details:", error);
      return null;
    }
  }

  /**
   * Listen for payment verification events
   */
  async listenForPaymentEvents(callback: (event: any) => void): Promise<void> {
    if (!this.oracleContract) {
      console.log(
        "⚠️  Oracle contract not initialized - skipping event listening"
      );
      return;
    }

    try {
      // Listen for PaymentVerified events
      this.oracleContract.on(
        "PaymentVerified",
        (paymentHash, verifier, amount, timestamp, event) => {
          callback({
            type: "PaymentVerified",
            paymentHash,
            verifier,
            amount: Number(amount),
            timestamp: Number(timestamp),
            transactionHash: event.transactionHash,
          });
        }
      );

      // Listen for PaymentRejected events
      this.oracleContract.on(
        "PaymentRejected",
        (paymentHash, reason, event) => {
          callback({
            type: "PaymentRejected",
            paymentHash,
            reason,
            transactionHash: event.transactionHash,
          });
        }
      );

      console.log("👂 Listening for payment verification events");
    } catch (error) {
      console.error("Failed to set up event listeners:", error);
      throw error;
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(txHash: string): Promise<CitreaTransaction | null> {
    if (!this.provider) {
      return null;
    }

    try {
      const tx = await this.provider.getTransaction(txHash);
      const receipt = await this.provider.getTransactionReceipt(txHash);

      if (!tx || !receipt) {
        return null;
      }

      return {
        hash: txHash,
        from: tx.from,
        to: tx.to || "",
        value: tx.value.toString(),
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status === 1 ? "confirmed" : "failed",
        blockNumber: receipt.blockNumber,
        timestamp: Date.now(), // Note: In production, get actual block timestamp
      };
    } catch (error) {
      console.error("Failed to get transaction details:", error);
      return null;
    }
  }

  /**
   * Get current block number
   */
  async getCurrentBlockNumber(): Promise<number> {
    if (!this.provider) {
      return 0;
    }

    try {
      return await this.provider.getBlockNumber();
    } catch (error) {
      console.error("Failed to get current block number:", error);
      return 0;
    }
  }

  /**
   * Get wallet address
   */
  getWalletAddress(): string | null {
    return this.wallet?.address || null;
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(): Promise<string> {
    if (!this.wallet || !this.provider) {
      return "0";
    }

    try {
      const balance = await this.provider.getBalance(this.wallet.address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error("Failed to get wallet balance:", error);
      return "0";
    }
  }
}

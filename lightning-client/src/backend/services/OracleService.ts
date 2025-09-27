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
  private defiContract: ethers.Contract | null = null;
  private tokenContract: ethers.Contract | null = null;
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
      const defiAddress = process.env.DEFI_CONTRACT_ADDRESS;
      const tokenAddress = process.env.TOKEN_CONTRACT_ADDRESS;

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
        "function emergencyVerifyPayment(bytes32 paymentHash, uint256 amount) external",
        "event PaymentVerified(bytes32 indexed paymentHash, address indexed verifier, uint256 amount, uint256 timestamp)",
        "event PaymentRejected(bytes32 indexed paymentHash, string reason)",
      ];

      // DeFi contract ABI
      const defiABI = [
        "function getBalance(address user) external view returns (uint256)",
        "function isPaymentProcessed(bytes32 paymentHash) external view returns (bool)",
        "function onPaymentVerified(bytes32 paymentHash, uint256 amount, bytes32 preimage) external",
      ];

      // Token contract ABI
      const tokenABI = [
        "function balanceOf(address account) external view returns (uint256)",
        "function totalSupply() external view returns (uint256)",
        "function mint(address to, uint256 amount) external",
        "function name() external view returns (string)",
        "function symbol() external view returns (string)",
      ];

      // Initialize contracts if addresses are provided
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

      if (defiAddress) {
        this.defiContract = new ethers.Contract(
          defiAddress,
          defiABI,
          this.wallet
        );
        console.log(`🔗 DeFi contract: ${defiAddress}`);
      }

      if (tokenAddress) {
        this.tokenContract = new ethers.Contract(
          tokenAddress,
          tokenABI,
          this.wallet
        );
        console.log(`🔗 Token contract: ${tokenAddress}`);
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
      // Add 0x prefix if not present and convert hex strings to bytes32 format
      const paymentHashHex = proof.paymentHash.startsWith("0x")
        ? proof.paymentHash
        : "0x" + proof.paymentHash;
      const preimageHex = proof.preimage.startsWith("0x")
        ? proof.preimage
        : "0x" + proof.preimage;
      const signatureHex = proof.signature.startsWith("0x")
        ? proof.signature
        : "0x" + proof.signature;
      const publicKeyHex = proof.publicKey.startsWith("0x")
        ? proof.publicKey
        : "0x" + proof.publicKey;

      const paymentHashBytes32 = ethers.getBytes(paymentHashHex);
      const preimageBytes32 = ethers.getBytes(preimageHex);

      // Convert signature to the format expected by the contract
      const signature = ethers.getBytes(signatureHex);

      // Extract public key X coordinate (first 32 bytes)
      const publicKey = ethers.getBytes(publicKeyHex);
      const publicKeyX = publicKey.slice(0, 32);

      console.log("🔍 Contract verification parameters:", {
        paymentHash: proof.paymentHash,
        preimage: proof.preimage,
        amount: proof.amount,
        publicKeyX: ethers.hexlify(publicKeyX),
        signatureLength: signature.length,
      });

      // Call the oracle contract
      const tx = await this.oracleContract.verifyPaymentProof(
        paymentHashBytes32,
        preimageBytes32,
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
   * Note: Disabled for Citrea testnet due to eth_newFilter not being supported
   */
  async listenForPaymentEvents(callback: (event: any) => void): Promise<void> {
    if (!this.oracleContract) {
      console.log(
        "⚠️  Oracle contract not initialized - skipping event listening"
      );
      return;
    }

    try {
      console.log(
        "⚠️  Event listening disabled for Citrea testnet - using polling instead"
      );
      // Note: Event listening is disabled because Citrea testnet doesn't support eth_newFilter
      // We'll use polling-based verification instead
    } catch (error) {
      console.error("Failed to set up event listeners:", error);
      // Don't throw error, just log it since we're not using event listeners
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

  /**
   * Get token balance for a user
   */
  async getTokenBalance(userAddress: string): Promise<number> {
    if (!this.tokenContract) {
      throw new Error("Token contract not initialized");
    }
    try {
      const balance = await this.tokenContract.balanceOf(userAddress);
      return Number(balance.toString());
    } catch (error) {
      console.error("Failed to get token balance:", error);
      return 0;
    }
  }

  /**
   * Get total token supply
   */
  async getTotalTokenSupply(): Promise<number> {
    if (!this.tokenContract) {
      throw new Error("Token contract not initialized");
    }
    try {
      const supply = await this.tokenContract.totalSupply();
      return Number(supply.toString());
    } catch (error) {
      console.error("Failed to get total supply:", error);
      return 0;
    }
  }

  /**
   * Get DeFi contract balance for a user
   */
  async getDeFiBalance(userAddress: string): Promise<number> {
    if (!this.defiContract) {
      throw new Error("DeFi contract not initialized");
    }
    try {
      const balance = await this.defiContract.getBalance(userAddress);
      return Number(balance.toString());
    } catch (error) {
      console.error("Failed to get DeFi balance:", error);
      return 0;
    }
  }

  /**
   * Check if payment has been processed in DeFi contract
   */
  async isPaymentProcessed(paymentHash: string): Promise<boolean> {
    if (!this.defiContract) {
      throw new Error("DeFi contract not initialized");
    }
    try {
      return await this.defiContract.isPaymentProcessed(paymentHash);
    } catch (error) {
      console.error("Failed to check payment processing status:", error);
      return false;
    }
  }

  /**
   * Get contract information
   */
  async getContractInfo(): Promise<{
    oracle: string | null;
    defi: string | null;
    token: string | null;
    connected: boolean;
  }> {
    return {
      oracle: this.oracleContract?.target?.toString() || null,
      defi: this.defiContract?.target?.toString() || null,
      token: this.tokenContract?.target?.toString() || null,
      connected: this.isConnectedFlag,
    };
  }

  /**
   * Emergency verify payment (for testing)
   */
  async emergencyVerifyPayment(
    paymentHash: string,
    amount: number
  ): Promise<{
    isValid: boolean;
    paymentHash: string;
    amount: number;
    error?: string;
  }> {
    if (!this.oracleContract) {
      return {
        isValid: false,
        paymentHash,
        amount,
        error: "Oracle contract not initialized",
      };
    }

    try {
      const tx = await this.oracleContract.emergencyVerifyPayment(
        paymentHash,
        amount
      );
      await tx.wait();

      return {
        isValid: true,
        paymentHash,
        amount,
      };
    } catch (error) {
      console.error("Emergency verification failed:", error);
      return {
        isValid: false,
        paymentHash,
        amount,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

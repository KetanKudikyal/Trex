export const CONTRACT_ADDRESSES = {
  // Local Anvil deployment addresses (from our deployment)
  LOCAL: {
    // Shared token contract (used by both versions) - Latest Deployment
    TOKEN_CONTRACT_ADDRESS: '0xA524319d310fa96AAf6E25F8af729587C2DEaE8a',

    // Original contracts - Latest Deployment
    ORACLE_CONTRACT_ADDRESS: '0xa52309eD1DE8781CBeECEF9d05B4B09B209B2493',
    DEFI_CONTRACT_ADDRESS: '0x78f80b74B8caFB14Da95fBfeEDB99c57C8673781',

    // Schnorr-Private-2.0 contracts - Latest Deployment (Simplified)
    ORACLE_PRIVATE_CONTRACT_ADDRESS:
      '0xcEd281f6DaC2AB1AFF3DA393809e01F0f1a46f84',
    DEFI_PRIVATE_CONTRACT_ADDRESS: '0x7A409A3A36112bd6906a113d9612D7f7e1abd6d4',
  },

  // Citrea Testnet - Deployed Contracts
  CITREA_TESTNET: {
    TOKEN_CONTRACT_ADDRESS: '0x94c17DD37ED3Ca85764b35BfD4d1CCc543b1bE3E',
    ORACLE_CONTRACT_ADDRESS: '0x4a95E7e42c968A6c7BFBBb2F2AA908463B46059E',
    DEFI_CONTRACT_ADDRESS: '0x9d24c52916A14afc31D86B5Aa046b252383ee444',
    ORACLE_PRIVATE_CONTRACT_ADDRESS:
      '0xc36B6BFa0ce8C6bdD8efcCd23CeC2E425768f64a',
    DEFI_PRIVATE_CONTRACT_ADDRESS: '0x90e97EF730B28B14b3F5f9214f47312796b6c10e',
  },

  // Citrea Mainnet (to be updated when deployed)
  CITREA_MAINNET: {
    ORACLE_CONTRACT_ADDRESS: '',
    DEFI_CONTRACT_ADDRESS: '',
    TOKEN_CONTRACT_ADDRESS: '',
    ORACLE_PRIVATE_CONTRACT_ADDRESS: '',
    DEFI_PRIVATE_CONTRACT_ADDRESS: '',
  },
} as const

export const RPC_URLS = {
  LOCAL: 'http://localhost:8545',
  CITREA_TESTNET: 'https://rpc.testnet.citrea.xyz',
  CITREA_MAINNET: 'https://rpc.citrea.xyz',
} as const

export const DEFAULT_PRIVATE_KEY =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' // Anvil default

import { ethers } from 'ethers'
import { CitreaTransaction, OracleVerificationResult } from '../types/index'
import { SchnorrUtils } from './schnorr'
import schnorrTestConfigs from './shonurrs'
/**
 * Private Oracle service for interacting with Citrea Lightning Oracle Private contract (Schnorr-Private-2.0)
 * This service works with arbitrary msgHash approach for privacy-preserving Lightning payment verification
 */
export class OracleServicePrivate {
  private provider: ethers.Provider | null = null
  private wallet: ethers.Wallet | null = null
  private oracleContract: ethers.Contract | null = null
  private defiContract: ethers.Contract | null = null
  private tokenContract: ethers.Contract | null = null
  private isConnectedFlag = false

  constructor() {
    this.initialize()
  }

  private async initialize() {
    try {
      // Use Citrea Testnet for production, fallback to local for development
      const useTestnet =
        process.env.NODE_ENV === 'production' ||
        process.env.USE_CITREA_TESTNET === 'true'

      const rpcUrl = useTestnet ? RPC_URLS.CITREA_TESTNET : RPC_URLS.LOCAL
      const privateKey = useTestnet
        ? process.env.CITREA_PRIVATE_KEY || DEFAULT_PRIVATE_KEY
        : DEFAULT_PRIVATE_KEY

      const contractAddresses = useTestnet
        ? CONTRACT_ADDRESSES.CITREA_TESTNET
        : CONTRACT_ADDRESSES.LOCAL

      const oracleAddress = contractAddresses.ORACLE_PRIVATE_CONTRACT_ADDRESS
      const defiAddress = contractAddresses.DEFI_PRIVATE_CONTRACT_ADDRESS
      const tokenAddress = contractAddresses.TOKEN_CONTRACT_ADDRESS

      console.log(
        `🔗 Connecting to contracts (${
          useTestnet ? 'Citrea Testnet' : 'Local Anvil'
        }):`,
        {
          rpcUrl,
          oracleAddress,
          defiAddress,
          tokenAddress,
        }
      )

      this.provider = new ethers.JsonRpcProvider(rpcUrl)
      this.wallet = new ethers.Wallet(privateKey, this.provider)

      // Private Oracle contract ABI (Schnorr-Private-2.0)
      const oracleABI = [
        'function verifyPaymentProof(bytes32 msgHash, bytes32 publicKeyX, bytes calldata signature, address receiver, uint256 invoiceAmount) external returns (bool)',
        'function isMessageVerified(bytes32 msgHash) external view returns (bool)',
        'function getMessageDetails(bytes32 msgHash) external view returns (address verifier, uint256 timestamp, bytes32 publicKeyX, bool verified)',
        'function emergencyVerifyMessage(bytes32 msgHash, bytes32 publicKeyX, address receiver, uint256 invoiceAmount) external',
        'event PaymentVerified(bytes32 indexed msgHash, address indexed verifier, uint256 timestamp, bytes32 publicKeyX)',
        'event PaymentRejected(bytes32 indexed msgHash, string reason)',
        'event DeFiActionTriggered(bytes32 indexed msgHash, address indexed defiContract, bytes actionData)',
      ]

      // Private DeFi contract ABI
      const defiABI = [
        'function onPaymentVerifiedPrivate(bytes32 msgHash, address verifier, bytes32 publicKeyX) external',
        'function getCBTCBalance(address user) external view returns (uint256)',
        'function getRewardBalance(address user) external view returns (uint256)',
        'function getTotalLiquidityProvided(address user) external view returns (uint256)',
        'function isMessageProcessed(bytes32 msgHash) external view returns (bool)',
        'function getProtocolStats() external view returns (uint256 totalCBTC, uint256 totalRewards, uint256 totalProviders)',
        'event CBTCAllocated(bytes32 indexed msgHash, address indexed recipient, uint256 cbtcAmount, uint256 timestamp)',
        'event RewardTokensAllocated(bytes32 indexed msgHash, address indexed recipient, uint256 rewardAmount, uint256 timestamp)',
        'event LiquidityIncentivePaid(bytes32 indexed msgHash, address indexed liquidityProvider, uint256 cbtcAmount, uint256 rewardAmount, bytes32 publicKeyX)',
      ]

      // Token contract ABI (shared)
      const tokenABI = [
        'function balanceOf(address account) external view returns (uint256)',
        'function transfer(address to, uint256 amount) external returns (bool)',
        'function mint(address to, uint256 amount) external',
        'function setMinter(address minter) external',
        'function totalSupply() external view returns (uint256)',
      ]

      // Initialize contracts
      if (oracleAddress) {
        this.oracleContract = new ethers.Contract(
          oracleAddress,
          oracleABI,
          this.wallet
        )
      }

      if (defiAddress) {
        this.defiContract = new ethers.Contract(
          defiAddress,
          defiABI,
          this.wallet
        )
      }

      if (tokenAddress) {
        this.tokenContract = new ethers.Contract(
          tokenAddress,
          tokenABI,
          this.wallet
        )
      }

      this.isConnectedFlag = true
      console.log('OracleServicePrivate initialized successfully')
    } catch (error) {
      console.error('Failed to initialize OracleServicePrivate:', error)
      this.isConnectedFlag = false
    }
  }

  /**
   * Check if the service is connected to Citrea
   */
  isConnected(): boolean {
    return this.isConnectedFlag
  }

  /**
   * Verify a Lightning payment proof using private approach (Schnorr-Private-2.0)
   * @param proof Payment proof containing msgHash and Schnorr signature
   * @returns Verification result
   */
  async verifyPaymentProofPrivate(proof: {
    msgHash: string
    publicKeyX: string
    signature: string
    userAddress: string // Required: address to receive rewards
    invoiceAmount: string // Required: Lightning invoice amount in wei
  }): Promise<OracleVerificationResult> {
    if (!this.isConnected() || !this.oracleContract) {
      throw new Error('Oracle service not connected')
    }

    try {
      console.log('Verifying payment proof (private approach):', {
        msgHash: proof.msgHash,
        publicKeyX: proof.publicKeyX,
        publicKeyXLength: proof.publicKeyX.length,
        signatureLength: proof.signature.length,
      })

      // Convert hex strings to bytes32/bytes
      const msgHash = ethers.zeroPadValue(proof.msgHash, 32)
      const publicKeyX = ethers.zeroPadValue(proof.publicKeyX, 32)
      const signature = ethers.getBytes(proof.signature)

      // Verify the Schnorr signature on-chain with receiver address and invoice amount
      const tx = await this.oracleContract.verifyPaymentProof(
        msgHash,
        publicKeyX,
        signature,
        proof.userAddress, // Pass receiver address for token minting
        proof.invoiceAmount // Pass invoice amount for reward calculation
      )

      console.log('Payment proof verification transaction:', tx.hash)
      const receipt = await tx.wait()

      // Check if verification was successful
      const success = receipt?.status === 1

      if (success) {
        console.log('Payment proof verified successfully (private approach)')

        // Get message details
        const messageDetails = await this.getMessageDetails(proof.msgHash)

        return {
          success: true,
          txHash: tx.hash,
          blockNumber: receipt?.blockNumber,
          timestamp: messageDetails.timestamp,
          msgHash: proof.msgHash,
          publicKeyX: proof.publicKeyX,
          message: 'Payment proof verified successfully using private approach',
        }
      } else {
        throw new Error('Payment proof verification failed')
      }
    } catch (error) {
      console.error('Error verifying payment proof (private):', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        msgHash: proof.msgHash,
        message: 'Payment proof verification failed',
      }
    }
  }

  /**
   * Check if a message has been verified on-chain
   * @param msgHash The message hash to check
   * @returns True if message is verified
   */
  async isMessageVerified(msgHash: string): Promise<boolean> {
    if (!this.isConnected() || !this.oracleContract) {
      throw new Error('Oracle service not connected')
    }

    try {
      const hash = ethers.zeroPadValue(msgHash, 32)
      return await this.oracleContract.isMessageVerified(hash)
    } catch (error) {
      console.error('Error checking message verification status:', error)
      throw error
    }
  }

  /**
   * Get message details from the oracle contract
   * @param msgHash The message hash
   * @returns Message details
   */
  async getMessageDetails(msgHash: string): Promise<{
    verifier: string
    timestamp: number
    publicKeyX: string
    verified: boolean
  }> {
    if (!this.isConnected() || !this.oracleContract) {
      throw new Error('Oracle service not connected')
    }

    try {
      const hash = ethers.zeroPadValue(msgHash, 32)
      const details = await this.oracleContract.getMessageDetails(hash)

      return {
        verifier: details.verifier,
        timestamp: Number(details.timestamp),
        publicKeyX: details.publicKeyX,
        verified: details.verified,
      }
    } catch (error) {
      console.error('Error getting message details:', error)
      throw error
    }
  }

  /**
   * Get user's cBTC balance from the private DeFi contract
   * @param userAddress User's address
   * @returns cBTC balance
   */
  async getCBTCBalance(userAddress: string): Promise<bigint> {
    if (!this.isConnected() || !this.defiContract) {
      throw new Error('Oracle service not connected')
    }

    try {
      return await this.defiContract.getCBTCBalance(userAddress)
    } catch (error) {
      console.error('Error getting cBTC balance:', error)
      throw error
    }
  }

  /**
   * Get user's reward token balance from the private DeFi contract
   * @param userAddress User's address
   * @returns Reward token balance
   */
  async getRewardBalance(userAddress: string): Promise<bigint> {
    if (!this.isConnected() || !this.defiContract) {
      throw new Error('Oracle service not connected')
    }

    try {
      return await this.defiContract.getRewardBalance(userAddress)
    } catch (error) {
      console.error('Error getting reward balance:', error)
      throw error
    }
  }

  /**
   * Get total liquidity provided by a user
   * @param userAddress User's address
   * @returns Total liquidity provided
   */
  async getTotalLiquidityProvided(userAddress: string): Promise<bigint> {
    if (!this.isConnected() || !this.defiContract) {
      throw new Error('Oracle service not connected')
    }

    try {
      return await this.defiContract.getTotalLiquidityProvided(userAddress)
    } catch (error) {
      console.error('Error getting total liquidity provided:', error)
      throw error
    }
  }

  /**
   * Check if a message has been processed by the DeFi contract
   * @param msgHash The message hash
   * @returns True if message is processed
   */
  async isMessageProcessed(msgHash: string): Promise<boolean> {
    if (!this.isConnected() || !this.defiContract) {
      throw new Error('Oracle service not connected')
    }

    try {
      const hash = ethers.zeroPadValue(msgHash, 32)
      return await this.defiContract.isMessageProcessed(hash)
    } catch (error) {
      console.error('Error checking message processing status:', error)
      throw error
    }
  }

  /**
   * Get protocol statistics from the private DeFi contract
   * @returns Protocol statistics
   */
  async getProtocolStats(): Promise<{
    totalCBTC: bigint
    totalRewards: bigint
    totalProviders: bigint
  }> {
    if (!this.isConnected() || !this.defiContract) {
      throw new Error('Oracle service not connected')
    }

    try {
      const stats = await this.defiContract.getProtocolStats()
      return {
        totalCBTC: stats.totalCBTC,
        totalRewards: stats.totalRewards,
        totalProviders: stats.totalProviders,
      }
    } catch (error) {
      console.error('Error getting protocol statistics:', error)
      throw error
    }
  }

  /**
   * Create a private message hash from Lightning payment details
   * This is computed off-chain to preserve privacy
   * @param paymentHash Lightning payment hash
   * @param preimage Lightning payment preimage
   * @param userAddress User's address (optional, for uniqueness)
   * @param timestamp Timestamp (optional, for uniqueness)
   * @returns Private message hash
   */
  static createPrivateMessageHash(
    paymentHash: string,
    preimage: string,
    amount: number,
    userAddress?: string,
    timestamp?: number
  ): string {
    // Create a deterministic hash from payment details using the same format as SchnorrUtils
    // This keeps the Lightning invoice details private while allowing verification
    const ts = timestamp || Math.floor(Date.now() / 1000)

    // Use the same message format as SchnorrUtils.createPaymentMessage
    const message = `lightning_payment:${paymentHash}:${preimage}:${amount}:${ts}`

    // Hash the message using keccak256
    const msgHash = ethers.keccak256(ethers.toUtf8Bytes(message))

    return msgHash
  }

  /**
   * Generate a Schnorr signature for the private message hash
   * @param privateKey Private key for signing
   * @param msgHash Message hash to sign
   * @returns Schnorr signature
   */
  async generateSchnorrSignature(
    privateKey: string,
    msgHash: string
  ): Promise<string> {
    try {
      const msgHashBytes = ethers.getBytes(msgHash)

      // Use the SchnorrUtils to generate signature directly from the message hash
      // The msgHash is already a hash, so we sign it directly
      const signature = await SchnorrUtils.signMessageHash(
        msgHashBytes,
        ethers.getBytes(privateKey)
      )

      // Concatenate r and s without 0x prefixes, then add single 0x prefix
      const r = signature.r.startsWith('0x')
        ? signature.r.substring(2)
        : signature.r
      const s = signature.s.startsWith('0x')
        ? signature.s.substring(2)
        : signature.s
      const finalSignature = `0x${r}${s}` // Concatenate and add single 0x prefix

      return finalSignature
    } catch (error) {
      console.error('Error generating Schnorr signature:', error)
      throw error
    }
  }

  /**
   * Get contract addresses for frontend integration
   * @returns Contract addresses
   */
  getContractAddresses(): {
    oracle: string | null
    defi: string | null
    token: string | null
  } {
    return {
      oracle: (this.oracleContract?.target as string) || null,
      defi: (this.defiContract?.target as string) || null,
      token: (this.tokenContract?.target as string) || null,
    }
  }

  /**
   * Emergency function to verify a message (only for testing/emergency use)
   * @param msgHash Message hash to verify
   * @param publicKeyX Public key X coordinate
   */
  async emergencyVerifyMessage(
    userAddress: string,
    invoiceAmount: string
  ): Promise<CitreaTransaction> {
    if (!this.isConnected() || !this.oracleContract) {
      throw new Error('Oracle service not connected')
    }

    try {
      const txArgs = schnorrTestConfigs[1]

      const tx = await this.oracleContract.verifyPaymentProof(
        txArgs.msgHash,
        txArgs.publicKeyX,
        txArgs.signature,
        userAddress,
        invoiceAmount
      )
      const receipt = await tx.wait()

      return {
        hash: tx.hash,
        blockNumber: receipt?.blockNumber || 0,
        success: receipt?.status === 1,
      }
    } catch (error) {
      console.error('Error in emergency message verification:', error)
      throw error
    }
  }
}

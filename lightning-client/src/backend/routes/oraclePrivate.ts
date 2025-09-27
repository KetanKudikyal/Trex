import { Router } from "express";
import { OracleServicePrivate } from "../services/OracleServicePrivate.js";

export function oraclePrivateRoutes(
  oracleServicePrivate: OracleServicePrivate
) {
  const router = Router();

  /**
   * POST /api/oracle-private/verify
   * Verify a payment proof on-chain using private approach (Schnorr-Private-2.0)
   */
  router.post("/verify", async (req, res) => {
    try {
      const { msgHash, publicKeyX, signature, userAddress, invoiceAmount } =
        req.body;

      if (
        !msgHash ||
        !publicKeyX ||
        !signature ||
        !userAddress ||
        !invoiceAmount
      ) {
        return res.status(400).json({
          error:
            "msgHash, publicKeyX, signature, userAddress, and invoiceAmount are required",
        });
      }

      const result = await oracleServicePrivate.verifyPaymentProofPrivate({
        msgHash,
        publicKeyX,
        signature,
        userAddress,
        invoiceAmount,
      });

      res.json(result);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * POST /api/oracle-private/create-msg-hash
   * Create a private message hash from Lightning payment details (off-chain computation)
   */
  router.post("/create-msg-hash", async (req, res) => {
    try {
      const { paymentHash, preimage, amount, userAddress, timestamp } =
        req.body;

      if (!paymentHash || !preimage || !amount) {
        return res.status(400).json({
          error: "paymentHash, preimage, and amount are required",
        });
      }

      const msgHash = OracleServicePrivate.createPrivateMessageHash(
        paymentHash,
        preimage,
        amount,
        userAddress,
        timestamp
      );

      res.json({
        msgHash,
        message: "Private message hash created successfully",
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * POST /api/oracle-private/generate-signature
   * Generate a Schnorr signature for a message hash
   */
  router.post("/generate-signature", async (req, res) => {
    try {
      const { privateKey, msgHash } = req.body;

      if (!privateKey || !msgHash) {
        return res.status(400).json({
          error: "privateKey and msgHash are required",
        });
      }

      const signature = await oracleServicePrivate.generateSchnorrSignature(
        privateKey,
        msgHash
      );

      res.json({
        signature,
        message: "Schnorr signature generated successfully",
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * GET /api/oracle-private/message/:hash/verified
   * Check if a message has been verified on-chain
   */
  router.get("/message/:hash/verified", async (req, res) => {
    try {
      const { hash } = req.params;
      const isVerified = await oracleServicePrivate.isMessageVerified(hash);
      res.json({ isVerified });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * GET /api/oracle-private/message/:hash/details
   * Get message details from the oracle contract
   */
  router.get("/message/:hash/details", async (req, res) => {
    try {
      const { hash } = req.params;
      const details = await oracleServicePrivate.getMessageDetails(hash);
      res.json(details);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * GET /api/oracle-private/user/:address/cbtc-balance
   * Get user's cBTC balance from the private DeFi contract
   */
  router.get("/user/:address/cbtc-balance", async (req, res) => {
    try {
      const { address } = req.params;
      const balance = await oracleServicePrivate.getCBTCBalance(address);
      res.json({
        address,
        cbtcBalance: balance.toString(),
        balance: balance.toString(),
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * GET /api/oracle-private/user/:address/reward-balance
   * Get user's reward token balance from the private DeFi contract
   */
  router.get("/user/:address/reward-balance", async (req, res) => {
    try {
      const { address } = req.params;
      const balance = await oracleServicePrivate.getRewardBalance(address);
      res.json({
        address,
        rewardBalance: balance.toString(),
        balance: balance.toString(),
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * GET /api/oracle-private/user/:address/liquidity
   * Get total liquidity provided by a user
   */
  router.get("/user/:address/liquidity", async (req, res) => {
    try {
      const { address } = req.params;
      const liquidity = await oracleServicePrivate.getTotalLiquidityProvided(
        address
      );
      res.json({
        address,
        totalLiquidityProvided: liquidity.toString(),
        liquidity: liquidity.toString(),
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * GET /api/oracle-private/user/:address/stats
   * Get comprehensive user statistics
   */
  router.get("/user/:address/stats", async (req, res) => {
    try {
      const { address } = req.params;

      const [cbtcBalance, rewardBalance, totalLiquidity] = await Promise.all([
        oracleServicePrivate.getCBTCBalance(address),
        oracleServicePrivate.getRewardBalance(address),
        oracleServicePrivate.getTotalLiquidityProvided(address),
      ]);

      res.json({
        address,
        cbtcBalance: cbtcBalance.toString(),
        rewardBalance: rewardBalance.toString(),
        totalLiquidityProvided: totalLiquidity.toString(),
        timestamp: Date.now(),
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * GET /api/oracle-private/message/:hash/processed
   * Check if a message has been processed by the DeFi contract
   */
  router.get("/message/:hash/processed", async (req, res) => {
    try {
      const { hash } = req.params;
      const isProcessed = await oracleServicePrivate.isMessageProcessed(hash);
      res.json({ isProcessed });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * GET /api/oracle-private/protocol/stats
   * Get protocol statistics from the private DeFi contract
   */
  router.get("/protocol/stats", async (_req, res) => {
    try {
      const stats = await oracleServicePrivate.getProtocolStats();
      res.json({
        totalCBTC: stats.totalCBTC.toString(),
        totalRewards: stats.totalRewards.toString(),
        totalProviders: stats.totalProviders.toString(),
        timestamp: Date.now(),
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * GET /api/oracle-private/contracts
   * Get contract addresses for frontend integration
   */
  router.get("/contracts", async (_req, res) => {
    try {
      const addresses = oracleServicePrivate.getContractAddresses();
      res.json({
        contracts: addresses,
        timestamp: Date.now(),
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * POST /api/oracle-private/emergency-verify
   * Emergency function to verify a message (only for testing/emergency use)
   */
  router.post("/emergency-verify", async (req, res) => {
    try {
      const { msgHash, publicKeyX, userAddress, invoiceAmount } = req.body;

      if (!msgHash || !publicKeyX || !userAddress || !invoiceAmount) {
        return res.status(400).json({
          error:
            "msgHash, publicKeyX, userAddress, and invoiceAmount are required",
        });
      }

      const result = await oracleServicePrivate.emergencyVerifyMessage(
        msgHash,
        publicKeyX,
        userAddress,
        invoiceAmount
      );

      res.json({
        success: result.success,
        txHash: result.hash,
        blockNumber: result.blockNumber,
        message: "Emergency message verification completed",
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * GET /api/oracle-private/status
   * Check if the private oracle service is connected
   */
  router.get("/status", async (_req, res) => {
    try {
      const isConnected = oracleServicePrivate.isConnected();
      const addresses = oracleServicePrivate.getContractAddresses();

      res.json({
        connected: isConnected,
        contracts: addresses,
        timestamp: Date.now(),
        // Additional fields for UI compatibility
        blockHeight: null, // Not available for private oracle
        walletBalance: null, // Not available for private oracle
        walletAddress: null, // Not available for private oracle
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  return router;
}

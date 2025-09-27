import { Router } from "express";
import { OracleService } from "../services/OracleService.js";

export function oracleRoutes(oracleService: OracleService) {
  const router = Router();

  /**
   * POST /api/oracle/verify
   * Verify a payment proof on-chain
   */
  router.post("/verify", async (req, res) => {
    try {
      const { proof } = req.body;

      if (!proof) {
        return res.status(400).json({ error: "Proof is required" });
      }

      const result = await oracleService.verifyPaymentProof(proof);
      res.json(result);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * GET /api/oracle/payment/:hash
   * Check if a payment has been verified on-chain
   */
  router.get("/payment/:hash", async (req, res) => {
    try {
      const { hash } = req.params;
      const isVerified = await oracleService.isPaymentVerified(hash);
      res.json({ isVerified });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * GET /api/oracle/payment/:hash/details
   * Get payment details from the oracle contract
   */
  router.get("/payment/:hash/details", async (req, res) => {
    try {
      const { hash } = req.params;
      const details = await oracleService.getPaymentDetails(hash);

      if (!details) {
        return res.status(404).json({ error: "Payment details not found" });
      }

      res.json(details);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * GET /api/oracle/transaction/:hash
   * Get transaction details
   */
  router.get("/transaction/:hash", async (req, res) => {
    try {
      const { hash } = req.params;
      const transaction = await oracleService.getTransaction(hash);

      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      res.json(transaction);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * GET /api/oracle/block
   * Get current block number
   */
  router.get("/block", async (_req, res) => {
    try {
      const blockNumber = await oracleService.getCurrentBlockNumber();
      res.json({ blockNumber });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * GET /api/oracle/wallet
   * Get wallet information
   */
  router.get("/wallet", async (_req, res) => {
    try {
      const address = oracleService.getWalletAddress();
      const balance = await oracleService.getWalletBalance();

      res.json({ address, balance });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * GET /api/oracle/contracts
   * Get contract information
   */
  router.get("/contracts", async (req, res) => {
    try {
      const contractInfo = await oracleService.getContractInfo();
      res.json(contractInfo);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * GET /api/oracle/token/balance/:address
   * Get token balance for a user
   */
  router.get("/token/balance/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const balance = await oracleService.getTokenBalance(address);
      res.json({ balance });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * GET /api/oracle/token/supply
   * Get total token supply
   */
  router.get("/token/supply", async (req, res) => {
    try {
      const supply = await oracleService.getTotalTokenSupply();
      res.json({ supply });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * GET /api/oracle/defi/balance/:address
   * Get DeFi contract balance for a user
   */
  router.get("/defi/balance/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const balance = await oracleService.getDeFiBalance(address);
      res.json({ balance });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * GET /api/oracle/defi/processed/:hash
   * Check if payment has been processed in DeFi contract
   */
  router.get("/defi/processed/:hash", async (req, res) => {
    try {
      const { hash } = req.params;
      const isProcessed = await oracleService.isPaymentProcessed(hash);
      res.json({ isProcessed });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * POST /api/oracle/emergency-verify
   * Emergency verify a payment (for testing)
   */
  router.post("/emergency-verify", async (req, res) => {
    try {
      const { paymentHash, amount } = req.body;

      if (!paymentHash || !amount) {
        return res
          .status(400)
          .json({ error: "paymentHash and amount are required" });
      }

      const result = await oracleService.emergencyVerifyPayment(
        paymentHash,
        amount
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  return router;
}

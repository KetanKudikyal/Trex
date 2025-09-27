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
      res
        .status(400)
        .json({
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
      res
        .status(400)
        .json({
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
      res
        .status(400)
        .json({
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
      res
        .status(400)
        .json({
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
      res
        .status(400)
        .json({
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
      res
        .status(400)
        .json({
          error: error instanceof Error ? error.message : "Unknown error",
        });
    }
  });

  return router;
}

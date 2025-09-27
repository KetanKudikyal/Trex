import { Router } from "express";
import { SwapService } from "../services/SwapService.js";

export function swapRoutes(swapService: SwapService) {
  const router = Router();

  /**
   * POST /api/swap/create
   * Create a new swap request
   */
  router.post("/create", async (req, res) => {
    try {
      const { lightningAddress, amount, defiAction } = req.body;

      if (!lightningAddress || !amount || !defiAction) {
        return res.status(400).json({
          error: "Lightning address, amount, and DeFi action are required",
        });
      }

      const swap = await swapService.createSwap(
        lightningAddress,
        amount,
        defiAction
      );
      res.json(swap);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * GET /api/swap/stats
   * Get swap statistics
   */
  router.get("/stats", async (_req, res) => {
    try {
      const stats = swapService.getStats();
      res.json(stats);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * GET /api/swap/:id
   * Get swap by ID
   */
  router.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const swap = swapService.getSwap(id);

      if (!swap) {
        return res.status(404).json({ error: "Swap not found" });
      }

      res.json(swap);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * GET /api/swap
   * Get all swaps with optional filtering
   */
  router.get("/", async (req, res) => {
    try {
      const { status } = req.query;

      let swaps;
      if (status) {
        swaps = swapService.getSwapsByStatus(status as any);
      } else {
        swaps = swapService.getAllSwaps();
      }

      res.json(swaps);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * POST /api/swap/:id/payment
   * Process a Lightning payment for a swap
   */
  router.post("/:id/payment", async (req, res) => {
    try {
      const { id } = req.params;
      const { paymentHash } = req.body;

      if (!paymentHash) {
        return res.status(400).json({ error: "Payment hash is required" });
      }

      const success = await swapService.processPayment(id, paymentHash);
      res.json({ success });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * POST /api/swap/:id/verify
   * Verify payment proof and complete swap
   */
  router.post("/:id/verify", async (req, res) => {
    try {
      const { id } = req.params;
      const { preimage } = req.body;

      if (!preimage) {
        return res.status(400).json({ error: "Preimage is required" });
      }

      const success = await swapService.verifyAndCompleteSwap(id, preimage);
      res.json({ success });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * POST /api/swap/:id/complete
   * Complete a swap with payment proof
   */
  router.post("/:id/complete", async (req, res) => {
    try {
      const { id } = req.params;
      const { paymentProof } = req.body;

      if (!paymentProof) {
        return res.status(400).json({ error: "Payment proof is required" });
      }

      const success = await swapService.verifyAndCompleteSwapWithProof(
        id,
        paymentProof
      );
      res.json({ success });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  return router;
}

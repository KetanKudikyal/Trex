import { Router } from "express";
import { LightningService } from "../services/LightningService.js";

export function lightningRoutes(lightningService: LightningService) {
  const router = Router();

  /**
   * GET /api/lightning/address/:address
   * Fetch Lightning address data
   */
  router.get("/address/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const data = await lightningService.fetchLightningAddress(address);
      res.json(data);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * POST /api/lightning/invoice
   * Request an invoice from a Lightning address
   */
  router.post("/invoice", async (req, res) => {
    try {
      const { address, amount, description } = req.body;

      if (!address || !amount) {
        return res
          .status(400)
          .json({ error: "Address and amount are required" });
      }

      const invoice = await lightningService.requestInvoice(
        address,
        amount,
        description
      );
      res.json(invoice);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * POST /api/lightning/verify
   * Verify if an invoice has been paid
   */
  router.post("/verify", async (req, res) => {
    try {
      const { paymentRequest } = req.body;

      if (!paymentRequest) {
        return res.status(400).json({ error: "Payment request is required" });
      }

      const invoice = lightningService.decodeInvoice(paymentRequest);
      const isPaid = await lightningService.verifyPayment(invoice);

      res.json({
        isPaid,
        invoice,
        preimage: isPaid
          ? await lightningService.getPaymentPreimage(invoice)
          : null,
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * POST /api/lightning/verify-manual
   * Manually verify payment with preimage (for when LNURL verification fails)
   */
  router.post("/verify-manual", async (req, res) => {
    try {
      const { paymentRequest, preimage } = req.body;

      if (!paymentRequest || !preimage) {
        return res.status(400).json({
          error: "Payment request and preimage are required",
        });
      }

      const invoice = lightningService.decodeInvoice(paymentRequest);

      // Validate the preimage against the payment hash
      const isValidPreimage = await lightningService.validatePreimage(
        invoice,
        preimage
      );

      if (isValidPreimage) {
        res.json({
          isPaid: true,
          invoice,
          preimage,
          verified: true,
        });
      } else {
        res.json({
          isPaid: false,
          invoice,
          preimage: null,
          verified: false,
          error: "Invalid preimage",
        });
      }
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * POST /api/lightning/decode
   * Decode a Lightning invoice
   */
  router.post("/decode", async (req, res) => {
    try {
      const { paymentRequest } = req.body;

      if (!paymentRequest) {
        return res.status(400).json({ error: "Payment request is required" });
      }

      const invoice = lightningService.decodeInvoice(paymentRequest);
      res.json(invoice);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * POST /api/lightning/boost
   * Create a boost payment
   */
  router.post("/boost", async (req, res) => {
    try {
      const { address, amount, metadata } = req.body;

      if (!address || !amount) {
        return res
          .status(400)
          .json({ error: "Address and amount are required" });
      }

      const result = await lightningService.createBoost(
        address,
        amount,
        metadata || {}
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * POST /api/lightning/zap
   * Create a zap payment
   */
  router.post("/zap", async (req, res) => {
    try {
      const { address, amount, options } = req.body;

      if (!address || !amount) {
        return res
          .status(400)
          .json({ error: "Address and amount are required" });
      }

      const result = await lightningService.createZap(
        address,
        amount,
        options || {}
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * POST /api/lightning/proof
   * Create a payment proof with Schnorr signature
   */
  router.post("/proof", async (req, res) => {
    try {
      console.log("🔐 Proof route received request body:", req.body);
      let { paymentHash, preimage, amount, lightningAddress } = req.body;

      console.log("🔐 Extracted parameters:", {
        paymentHash,
        preimage,
        amount,
        lightningAddress,
      });

      if (!paymentHash || !preimage || !amount || !lightningAddress) {
        console.log("❌ Missing required parameters:", {
          hasPaymentHash: !!paymentHash,
          hasPreimage: !!preimage,
          hasAmount: !!amount,
          hasLightningAddress: !!lightningAddress,
        });
        return res.status(400).json({
          error:
            "Payment hash, preimage, amount, and Lightning address are required",
        });
      }

      const proof = await lightningService.createPaymentProof(
        paymentHash,
        preimage,
        amount,
        lightningAddress
      );

      res.json(proof);
    } catch (error) {
      console.error("❌ Proof route error:", error);
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * POST /api/lightning/verify-proof
   * Verify a payment proof
   */
  router.post("/verify-proof", async (req, res) => {
    try {
      const { proof } = req.body;

      if (!proof) {
        return res.status(400).json({ error: "Proof is required" });
      }

      const isValid = lightningService.verifyPaymentProof(proof);
      res.json({ isValid });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * GET /api/lightning/private-key/:address
   * Get the private key for a Lightning address (for testing purposes)
   */
  router.get("/private-key/:address", async (req, res) => {
    try {
      const { address } = req.params;

      if (!address) {
        return res.status(400).json({ error: "Address is required" });
      }

      const privateKey = lightningService.getPrivateKey(address);

      if (!privateKey) {
        return res
          .status(404)
          .json({ error: "Private key not found for address" });
      }

      // Convert Uint8Array to hex string with 0x prefix
      const privateKeyHex = "0x" + Buffer.from(privateKey).toString("hex");

      res.json({ privateKey: privateKeyHex });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  return router;
}

import { LightningService } from "./LightningService.js";
import { OracleService } from "./OracleService.js";
import { SwapRequest, DeFiAction } from "../../shared/types/index.js";
import { WebSocket } from "ws";

/**
 * Swap service for managing Lightning to Citrea atomic swaps
 */
export class SwapService {
  private swaps = new Map<string, SwapRequest>();
  private subscribers = new Map<string, Set<WebSocket>>();
  private paymentSubscribers = new Map<string, Set<WebSocket>>();

  constructor(
    private lightningService: LightningService,
    private oracleService: OracleService
  ) {
    this.initialize();
  }

  private async initialize() {
    // Set up event listeners
    if (this.oracleService.isConnected()) {
      await this.oracleService.listenForPaymentEvents((event) => {
        this.handlePaymentEvent(event);
      });
    }
  }

  /**
   * Check if swap service is ready
   */
  isReady(): boolean {
    return (
      this.lightningService.isConnected() && this.oracleService.isConnected()
    );
  }

  /**
   * Create a new swap request
   */
  async createSwap(
    lightningAddress: string,
    amount: number,
    defiAction: DeFiAction
  ): Promise<SwapRequest> {
    const swapId = this.generateSwapId();

    const swap: SwapRequest = {
      id: swapId,
      lightningAddress,
      amount,
      defiAction,
      status: "pending",
      createdAt: Date.now(),
    };

    this.swaps.set(swapId, swap);

    // Notify subscribers
    this.notifySwapSubscribers(swapId, {
      type: "swap_created",
      swap,
    });

    return swap;
  }

  /**
   * Get swap by ID
   */
  getSwap(swapId: string): SwapRequest | null {
    return this.swaps.get(swapId) || null;
  }

  /**
   * Get all swaps
   */
  getAllSwaps(): SwapRequest[] {
    return Array.from(this.swaps.values());
  }

  /**
   * Get swaps by status
   */
  getSwapsByStatus(status: SwapRequest["status"]): SwapRequest[] {
    return Array.from(this.swaps.values()).filter(
      (swap) => swap.status === status
    );
  }

  /**
   * Process a Lightning payment for a swap
   */
  async processPayment(swapId: string, paymentHash: string): Promise<boolean> {
    const swap = this.swaps.get(swapId);
    if (!swap) {
      throw new Error("Swap not found");
    }

    if (swap.status !== "pending") {
      throw new Error("Swap is not in pending status");
    }

    try {
      // Update swap status
      swap.status = "paid";
      swap.paymentProof = {
        paymentHash,
        preimage: "", // Will be filled when we get the preimage
        signature: "",
        publicKey: "",
        timestamp: Date.now(),
        amount: swap.amount,
      };

      // Notify subscribers
      this.notifySwapSubscribers(swapId, {
        type: "payment_received",
        swap,
      });

      return true;
    } catch (error) {
      console.error("Failed to process payment:", error);
      swap.status = "failed";
      this.notifySwapSubscribers(swapId, {
        type: "swap_failed",
        swap,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return false;
    }
  }

  /**
   * Verify payment proof and complete swap
   */
  async verifyAndCompleteSwap(
    swapId: string,
    preimage: string
  ): Promise<boolean> {
    const swap = this.swaps.get(swapId);
    if (!swap || !swap.paymentProof) {
      throw new Error("Swap or payment proof not found");
    }

    try {
      // Create payment proof with Schnorr signature
      const paymentProof = await this.lightningService.createPaymentProof(
        swap.paymentProof.paymentHash,
        preimage,
        swap.amount,
        swap.lightningAddress
      );

      // Verify the proof locally first
      const isValid = this.lightningService.verifyPaymentProof(paymentProof);
      if (!isValid) {
        throw new Error("Invalid payment proof");
      }

      // Update swap with complete payment proof
      swap.paymentProof = paymentProof;

      // Verify on-chain
      const oracleResult = await this.oracleService.verifyPaymentProof(
        paymentProof
      );
      if (oracleResult.isValid) {
        swap.status = "completed";
        swap.completedAt = new Date().toISOString();
      } else {
        swap.status = "failed";
        throw new Error(`Oracle verification failed: ${oracleResult.error}`);
      }

      // Notify subscribers
      this.notifySwapSubscribers(swapId, {
        type: "swap_completed",
        swap,
      });

      return true;
    } catch (error) {
      console.error("Failed to verify and complete swap:", error);
      swap.status = "failed";
      this.notifySwapSubscribers(swapId, {
        type: "swap_failed",
        swap,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return false;
    }
  }

  /**
   * Verify and complete swap with existing payment proof
   */
  async verifyAndCompleteSwapWithProof(
    swapId: string,
    paymentProof: PaymentProof
  ): Promise<boolean> {
    const swap = this.swaps.get(swapId);
    if (!swap) {
      throw new Error("Swap not found");
    }

    try {
      // Verify the payment proof with Oracle
      const oracleResult = await this.oracleService.verifyPaymentProof(
        paymentProof
      );
      if (!oracleResult.isValid) {
        throw new Error(`Oracle verification failed: ${oracleResult.error}`);
      }

      // Update swap with payment proof and mark as completed
      swap.paymentProof = paymentProof;
      swap.status = "completed";
      swap.completedAt = new Date().toISOString();

      // Notify subscribers
      this.notifySwapSubscribers(swapId, {
        type: "swap_completed",
        swap,
      });

      return true;
    } catch (error) {
      console.error("Failed to verify and complete swap:", error);
      swap.status = "failed";
      this.notifySwapSubscribers(swapId, {
        type: "swap_failed",
        swap,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return false;
    }
  }

  /**
   * Subscribe to swap updates
   */
  subscribeToSwap(swapId: string, ws: WebSocket): void {
    if (!this.subscribers.has(swapId)) {
      this.subscribers.set(swapId, new Set());
    }
    this.subscribers.get(swapId)!.add(ws);
  }

  /**
   * Subscribe to payment updates
   */
  subscribeToPayment(paymentHash: string, ws: WebSocket): void {
    if (!this.paymentSubscribers.has(paymentHash)) {
      this.paymentSubscribers.set(paymentHash, new Set());
    }
    this.paymentSubscribers.get(paymentHash)!.add(ws);
  }

  /**
   * Unsubscribe WebSocket
   */
  unsubscribe(ws: WebSocket): void {
    // Remove from swap subscribers
    for (const [swapId, subscribers] of this.subscribers.entries()) {
      subscribers.delete(ws);
      if (subscribers.size === 0) {
        this.subscribers.delete(swapId);
      }
    }

    // Remove from payment subscribers
    for (const [
      paymentHash,
      subscribers,
    ] of this.paymentSubscribers.entries()) {
      subscribers.delete(ws);
      if (subscribers.size === 0) {
        this.paymentSubscribers.delete(paymentHash);
      }
    }
  }

  /**
   * Handle payment events from the oracle
   */
  private handlePaymentEvent(event: any): void {
    console.log("Received payment event:", event);

    // Notify payment subscribers
    const paymentSubscribers = this.paymentSubscribers.get(event.paymentHash);
    if (paymentSubscribers) {
      for (const ws of paymentSubscribers) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              type: "payment_event",
              event,
            })
          );
        }
      }
    }

    // Find and update related swaps
    for (const [swapId, swap] of this.swaps.entries()) {
      if (swap.paymentProof?.paymentHash === event.paymentHash) {
        if (event.type === "PaymentVerified") {
          swap.status = "completed";
          swap.transactionHash = event.transactionHash;
        } else if (event.type === "PaymentRejected") {
          swap.status = "failed";
        }

        this.notifySwapSubscribers(swapId, {
          type: "swap_updated",
          swap,
        });
      }
    }
  }

  /**
   * Notify swap subscribers
   */
  private notifySwapSubscribers(swapId: string, message: any): void {
    const subscribers = this.subscribers.get(swapId);
    if (subscribers) {
      for (const ws of subscribers) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(message));
        }
      }
    }
  }

  /**
   * Generate a unique swap ID
   */
  private generateSwapId(): string {
    return `swap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get swap statistics
   */
  getStats(): {
    total: number;
    pending: number;
    paid: number;
    verified: number;
    completed: number;
    failed: number;
  } {
    const swaps = Array.from(this.swaps.values());
    return {
      total: swaps.length,
      pending: swaps.filter((s) => s.status === "pending").length,
      paid: swaps.filter((s) => s.status === "paid").length,
      verified: swaps.filter((s) => s.status === "verified").length,
      completed: swaps.filter((s) => s.status === "completed").length,
      failed: swaps.filter((s) => s.status === "failed").length,
    };
  }
}

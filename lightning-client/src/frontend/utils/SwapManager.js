/**
 * Swap Manager for handling atomic swaps
 */
export class SwapManager {
  constructor() {
    this.baseUrl = "http://localhost:3001/api/swap";
    this.swaps = new Map();
  }

  async init() {
    console.log("Initializing Swap Manager...");
    // Load existing swaps
    await this.loadSwaps();
  }

  /**
   * Create a new swap
   */
  async createSwap(swapData) {
    try {
      const response = await fetch(`${this.baseUrl}/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(swapData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const swap = await response.json();
      this.swaps.set(swap.id, swap);
      return swap;
    } catch (error) {
      console.error("Failed to create swap:", error);
      throw error;
    }
  }

  /**
   * Get swap by ID
   */
  async getSwap(swapId) {
    try {
      const response = await fetch(`${this.baseUrl}/${swapId}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const swap = await response.json();
      this.swaps.set(swap.id, swap);
      return swap;
    } catch (error) {
      console.error("Failed to get swap:", error);
      throw error;
    }
  }

  /**
   * Get all swaps
   */
  async getAllSwaps() {
    try {
      const response = await fetch(`${this.baseUrl}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const swaps = await response.json();
      swaps.forEach((swap) => this.swaps.set(swap.id, swap));
      return swaps;
    } catch (error) {
      console.error("Failed to get swaps:", error);
      throw error;
    }
  }

  /**
   * Get swaps by status
   */
  async getSwapsByStatus(status) {
    try {
      const response = await fetch(`${this.baseUrl}?status=${status}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const swaps = await response.json();
      swaps.forEach((swap) => this.swaps.set(swap.id, swap));
      return swaps;
    } catch (error) {
      console.error("Failed to get swaps by status:", error);
      throw error;
    }
  }

  /**
   * Process a Lightning payment for a swap
   */
  async processPayment(swapId, paymentHash) {
    try {
      const response = await fetch(`${this.baseUrl}/${swapId}/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentHash,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        // Update local swap
        const swap = this.swaps.get(swapId);
        if (swap) {
          swap.status = "paid";
          swap.paymentProof = {
            paymentHash,
            preimage: "",
            signature: "",
            publicKey: "",
            timestamp: Date.now(),
            amount: swap.amount,
          };
        }
      }
      return result.success;
    } catch (error) {
      console.error("Failed to process payment:", error);
      throw error;
    }
  }

  /**
   * Verify payment proof and complete swap
   */
  async verifyAndCompleteSwap(swapId, preimage) {
    try {
      const response = await fetch(`${this.baseUrl}/${swapId}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          preimage,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        // Update local swap
        const swap = this.swaps.get(swapId);
        if (swap) {
          swap.status = "completed";
        }
      }
      return result.success;
    } catch (error) {
      console.error("Failed to verify and complete swap:", error);
      throw error;
    }
  }

  /**
   * Get swap statistics
   */
  async getStats() {
    try {
      const response = await fetch(`${this.baseUrl}/stats`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to get swap stats:", error);
      throw error;
    }
  }

  /**
   * Load swaps from server
   */
  async loadSwaps() {
    try {
      const swaps = await this.getAllSwaps();
      return swaps;
    } catch (error) {
      console.error("Failed to load swaps:", error);
      return [];
    }
  }

  /**
   * Get swap from local cache
   */
  getSwapFromCache(swapId) {
    return this.swaps.get(swapId);
  }

  /**
   * Update swap in local cache
   */
  updateSwapInCache(swap) {
    this.swaps.set(swap.id, swap);
  }

  /**
   * Delete swap from local cache
   */
  deleteSwapFromCache(swapId) {
    this.swaps.delete(swapId);
  }

  /**
   * Get all swaps from local cache
   */
  getAllSwapsFromCache() {
    return Array.from(this.swaps.values());
  }

  /**
   * Get swaps by status from local cache
   */
  getSwapsByStatusFromCache(status) {
    return Array.from(this.swaps.values()).filter(
      (swap) => swap.status === status
    );
  }

  /**
   * Format swap for display
   */
  formatSwap(swap) {
    return {
      ...swap,
      createdAtFormatted: new Date(swap.createdAt).toLocaleString(),
      amountFormatted: `${swap.amount} sats`,
      statusFormatted:
        swap.status.charAt(0).toUpperCase() + swap.status.slice(1),
    };
  }

  /**
   * Get swap status color
   */
  getSwapStatusColor(status) {
    const colors = {
      pending: "#ffc107",
      paid: "#17a2b8",
      verified: "#28a745",
      completed: "#28a745",
      failed: "#dc3545",
    };
    return colors[status] || "#6c757d";
  }

  /**
   * Get swap status icon
   */
  getSwapStatusIcon(status) {
    const icons = {
      pending: "⏳",
      paid: "💰",
      verified: "✅",
      completed: "🎉",
      failed: "❌",
    };
    return icons[status] || "❓";
  }

  /**
   * Complete a swap with payment proof
   */
  async completeSwap(swapId, paymentProof) {
    try {
      const response = await fetch(`${this.baseUrl}/${swapId}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentProof,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        // Update local swap
        const swap = this.swaps.get(swapId);
        if (swap) {
          swap.status = "completed";
          swap.completedAt = new Date().toISOString();
        }
      }
      return result.success;
    } catch (error) {
      console.error("Failed to complete swap:", error);
      throw error;
    }
  }
}

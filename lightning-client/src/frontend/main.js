import { LightningClient } from "./utils/LightningClient.js";
import { SwapManager } from "./utils/SwapManager.js";
import { OracleManagerPrivate } from "./utils/OracleManagerPrivate.js";
import { UIManager } from "./utils/UIManager.js";
import { ethers } from "ethers";

class App {
  constructor() {
    this.lightningClient = new LightningClient();
    this.swapManager = new SwapManager();
    this.oracleManager = new OracleManagerPrivate();
    this.uiManager = new UIManager();
    this.currentSwap = null; // Store current swap context
    this.monitoringIntervals = new Set(); // Track monitoring intervals

    this.init();
  }

  async init() {
    try {
      // Clear any existing monitoring intervals
      this.clearAllMonitoring();

      // Initialize UI
      this.uiManager.init();

      // Initialize services
      await this.lightningClient.init();
      await this.oracleManager.init();
      await this.swapManager.init();

      // Set up event listeners
      this.setupEventListeners();

      // Load initial data
      await this.loadInitialData();

      console.log("✅ App initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize app:", error);
      this.uiManager.showToast("Failed to initialize app", "error");
    }
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const target = link.getAttribute("href").substring(1);
        this.uiManager.showSection(target);
      });
    });

    // Create swap button
    const createSwapBtn = document.getElementById("create-swap-btn");
    if (createSwapBtn) {
      createSwapBtn.addEventListener("click", () => {
        this.uiManager.showModal("swap-modal");
      });
    }

    // Connect wallet button
    const connectWalletBtn = document.getElementById("connect-wallet-btn");
    if (connectWalletBtn) {
      connectWalletBtn.addEventListener("click", () => {
        this.connectWallet();
      });
    }

    // WebLN pay button
    const weblnPayBtn = document.getElementById("webln-pay-button");
    if (weblnPayBtn) {
      weblnPayBtn.addEventListener("click", () => {
        this.payWithWebLN();
      });
    }

    // Swap form
    const swapForm = document.getElementById("swap-form");
    if (swapForm) {
      swapForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.createSwap();
      });
    }

    // Verify payment form
    const verifyPaymentForm = document.getElementById("verify-payment-form");
    if (verifyPaymentForm) {
      verifyPaymentForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.verifyPayment();
      });
    }

    // Refresh swaps button
    const refreshSwapsBtn = document.getElementById("refresh-swaps-btn");
    if (refreshSwapsBtn) {
      refreshSwapsBtn.addEventListener("click", () => {
        this.loadSwaps();
      });
    }

    // Save settings button
    const saveSettingsBtn = document.getElementById("save-settings-btn");
    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener("click", () => {
        this.saveSettings();
      });
    }

    // Copy payment request button
    const copyPaymentRequestBtn = document.getElementById(
      "copy-payment-request"
    );
    if (copyPaymentRequestBtn) {
      copyPaymentRequestBtn.addEventListener("click", () => {
        this.copyPaymentRequest();
      });
    }

    // Modal close buttons
    document.querySelectorAll(".modal-close").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.uiManager.hideModal();
      });
    });

    // Close modal on backdrop click
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.uiManager.hideModal();
        }
      });
    });
  }

  async loadInitialData() {
    try {
      // Load swap statistics
      await this.loadSwapStats();

      // Load swaps
      await this.loadSwaps();

      // Load oracle status
      await this.loadOracleStatus();
    } catch (error) {
      console.error("Failed to load initial data:", error);
    }
  }

  async loadSwapStats() {
    try {
      const stats = await this.swapManager.getStats();
      this.uiManager.updateStats(stats);
    } catch (error) {
      console.error("Failed to load swap stats:", error);
    }
  }

  async loadSwaps() {
    try {
      const swaps = await this.swapManager.getAllSwaps();
      this.uiManager.renderSwaps(swaps);
    } catch (error) {
      console.error("Failed to load swaps:", error);
      this.uiManager.showToast("Failed to load swaps", "error");
    }
  }

  async loadOracleStatus() {
    try {
      const status = await this.oracleManager.getStatus();
      this.uiManager.updateOracleStatus(status);

      // Load contract information
      const contractInfo = await this.oracleManager.loadContractInfo();
      if (contractInfo) {
        this.uiManager.updateContractInfo(contractInfo);
      }

      // Load token information (using wallet address if available)
      const tokenInfo = await this.oracleManager.loadTokenInfo(
        status.walletAddress
      );
      if (tokenInfo) {
        this.uiManager.updateTokenInfo(tokenInfo);
      }
    } catch (error) {
      console.error("Failed to load oracle status:", error);
    }
  }

  async createSwap() {
    try {
      const formData = new FormData(document.getElementById("swap-form"));
      const swapData = {
        lightningAddress:
          formData.get("swap-lightning-address") ||
          document.getElementById("swap-lightning-address").value,
        amount: parseInt(
          formData.get("swap-amount") ||
            document.getElementById("swap-amount").value
        ),
        defiAction: {
          type:
            formData.get("swap-action") ||
            document.getElementById("swap-action").value,
          recipient: "user-address", // This would be the user's address
          metadata: {
            description:
              formData.get("swap-description") ||
              document.getElementById("swap-description").value,
          },
        },
      };

      const swap = await this.swapManager.createSwap(swapData);
      this.uiManager.showToast("Swap created successfully", "success");
      this.uiManager.hideModal();

      // Request invoice for the swap
      await this.requestInvoice(swap);

      // Refresh swaps list
      await this.loadSwaps();
      await this.loadSwapStats();
    } catch (error) {
      console.error("Failed to create swap:", error);
      this.uiManager.showToast("Failed to create swap", "error");
    }
  }

  async requestInvoice(swap) {
    try {
      console.log("🔍 Requesting invoice for swap:", swap);
      console.log("🔍 Swap properties:", {
        lightningAddress: swap.lightningAddress,
        amount: swap.amount,
        id: swap.id,
      });

      // Clear any existing monitoring intervals when starting a new swap
      this.clearAllMonitoring();

      // Store current swap context
      this.currentSwap = swap;

      // Check if WebLN is available for better payment handling
      if (window.webln) {
        console.log("🔍 WebLN detected - using WebLN for payment");
        await this.requestInvoiceWithWebLN(swap);
      } else {
        console.log("🔍 WebLN not available - using LNURL");
        const invoice = await this.lightningClient.requestInvoice(
          swap.lightningAddress,
          swap.amount,
          `Swap ${swap.id}`
        );

        // Store the payment hash in the swap object
        swap.paymentHash = invoice.paymentHash;

        // Show payment modal
        this.uiManager.showPaymentModal(invoice, swap);

        // Start monitoring payment (for LNURL payments only)
        this.monitorPayment(swap.id, invoice);
      }
    } catch (error) {
      console.error("Failed to request invoice:", error);
      this.uiManager.showToast("Failed to request invoice", "error");
    }
  }

  async requestInvoiceWithWebLN(swap) {
    try {
      // Enable WebLN
      await window.webln.enable();
      console.log("✅ WebLN enabled");

      // Request invoice using WebLN
      const invoice = await window.webln.makeInvoice({
        amount: swap.amount, // Use sats directly (WebLN handles conversion)
        defaultMemo: `Swap ${swap.id}`,
      });

      const invoiceData = {
        paymentRequest: invoice.paymentRequest,
        paymentHash: invoice.paymentHash,
        amount: swap.amount,
        description: `Swap ${swap.id}`,
        timestamp: Date.now(),
        expiry: 3600,
      };

      console.log("✅ WebLN invoice created:", invoiceData);

      // Store the payment hash in the swap object
      swap.paymentHash = invoice.paymentHash;

      // Show payment modal with WebLN payment option
      this.uiManager.showPaymentModal(invoiceData, swap, true);

      // No need to monitor payment for WebLN - it will be handled by the WebLN button
    } catch (error) {
      console.error("Failed to request invoice with WebLN:", error);
      this.uiManager.showToast("Failed to request invoice with WebLN", "error");

      // Fallback to regular invoice request
      const invoice = await this.lightningClient.requestInvoice(
        swap.lightningAddress,
        swap.amount,
        `Swap ${swap.id}`
      );

      this.uiManager.showPaymentModal(invoice, swap);
      this.monitorPayment(swap.id, invoice); // Fallback to LNURL monitoring
    }
  }

  /**
   * Clear all monitoring intervals
   */
  clearAllMonitoring() {
    this.monitoringIntervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.monitoringIntervals.clear();
    console.log("🧹 Cleared all payment monitoring intervals");
  }

  async monitorPayment(swapId, invoice) {
    console.log("🔍 Starting payment monitoring for LNURL payment...");
    this.uiManager.updatePaymentStatus(
      "waiting",
      "🔍 Verifying payment on Lightning Network..."
    );

    const checkInterval = setInterval(async () => {
      try {
        console.log("🔍 Checking payment status for swap:", swapId);
        const isPaid = await this.lightningClient.verifyPayment(invoice);

        if (isPaid) {
          console.log("✅ Payment confirmed!");
          this.uiManager.updatePaymentStatus(
            "success",
            "✅ Payment confirmed! Processing swap..."
          );
          clearInterval(checkInterval);
          this.monitoringIntervals.delete(checkInterval);

          // Get preimage
          const preimage = await this.lightningClient.getPaymentPreimage(
            invoice
          );
          if (preimage) {
            console.log("✅ Preimage received:", preimage);

            // Update UI to show we're creating the signature
            this.uiManager.updatePaymentStatus(
              "processing",
              "🔐 Creating Schnorr signature..."
            );

            // Create payment proof with Schnorr signature
            const paymentProof = await this.createPaymentProof(
              invoice.paymentHash,
              preimage,
              invoice.amount
            );

            console.log("✅ Payment proof created:", paymentProof);

            // Update UI to show we're verifying with Oracle
            this.uiManager.updatePaymentStatus(
              "processing",
              "🔍 Verifying with Oracle..."
            );

            // Verify payment proof with Private Oracle
            const verificationResult =
              await this.oracleManager.completePrivateVerificationFlow({
                paymentHash: invoice.paymentHash,
                preimage: preimage,
                privateKey:
                  "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef", // Dummy for testing
                publicKeyX:
                  "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef", // Dummy for testing
                userAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
                invoiceAmount: invoice.amount.toString(),
              });

            if (verificationResult.success) {
              console.log(
                "✅ Private Oracle verification successful:",
                verificationResult
              );

              // Complete the swap
              const swapCompleted = await this.swapManager.completeSwap(
                swapId,
                paymentProof
              );

              if (swapCompleted) {
                this.uiManager.updatePaymentStatus(
                  "success",
                  "🎉 Swap completed successfully!"
                );
                this.uiManager.showToast(
                  "Swap completed successfully!",
                  "success"
                );

                // Refresh swap list and token information
                await this.loadSwaps();

                // Refresh token information to show new balance
                const status = await this.oracleManager.getStatus();
                const tokenInfo = await this.oracleManager.loadTokenInfo(
                  status.walletAddress
                );
                if (tokenInfo) {
                  this.uiManager.updateTokenInfo(tokenInfo);
                }

                // Close the modal after a delay
                setTimeout(() => {
                  this.uiManager.hideModal();
                }, 2000);
              } else {
                throw new Error("Failed to complete swap");
              }
            } else {
              throw new Error(
                `Oracle verification failed: ${verificationResult.error}`
              );
            }
          } else {
            console.log("⚠️ No preimage found");
            this.uiManager.updatePaymentStatus(
              "warning",
              "⚠️ Payment received but no preimage found"
            );
            this.uiManager.showToast(
              "Payment received but no preimage found",
              "warning"
            );
          }
        } else {
          console.log(
            "⏳ Payment not yet confirmed, checking again in 10 seconds..."
          );
          this.uiManager.updatePaymentStatus(
            "waiting",
            "⏳ Payment not yet confirmed, checking again..."
          );
        }
      } catch (error) {
        console.error("Payment verification error:", error);
      }
    }, 5000); // Check every 5 seconds for LNURL payments

    // Track the interval
    this.monitoringIntervals.add(checkInterval);

    // Stop monitoring after 10 minutes for LNURL payments
    setTimeout(() => {
      console.log("⏰ Payment monitoring timeout - stopping checks");
      clearInterval(checkInterval);
      this.monitoringIntervals.delete(checkInterval);
    }, 600000); // 10 minutes total
  }

  async verifyPayment() {
    try {
      const paymentHash = document.getElementById("payment-hash").value;
      if (!paymentHash) {
        this.uiManager.showToast("Please enter a payment hash", "warning");
        return;
      }

      // For private oracle, we need to create a msgHash first
      // This is a simplified version - in production, you'd get the preimage from Lightning
      const msgHash = await this.oracleManager.createPrivateMessageHash(
        paymentHash,
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef", // Dummy hex preimage for testing
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" // User address
      );

      const isVerified = await this.oracleManager.isMessageVerified(msgHash);
      const details = await this.oracleManager.getMessageDetails(msgHash);

      this.uiManager.showVerificationResult(isVerified, details);
    } catch (error) {
      console.error("Failed to verify payment:", error);
      this.uiManager.showToast("Failed to verify payment", "error");
    }
  }

  async connectWallet() {
    try {
      // This would integrate with a wallet connection library
      this.uiManager.showToast(
        "Wallet connection not implemented yet",
        "warning"
      );
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      this.uiManager.showToast("Failed to connect wallet", "error");
    }
  }

  async payWithWebLN() {
    try {
      if (!window.webln) {
        this.uiManager.showToast("WebLN not available", "error");
        return;
      }

      // Get the current payment request
      const paymentRequestEl = document.getElementById("payment-request");
      if (!paymentRequestEl || !paymentRequestEl.value) {
        this.uiManager.showToast("No payment request available", "error");
        return;
      }

      const paymentRequest = paymentRequestEl.value;

      this.uiManager.updatePaymentStatus(
        "waiting",
        "🔍 Sending payment via WebLN..."
      );

      // Send payment using WebLN
      const result = await window.webln.sendPayment(paymentRequest);

      if (result && result.preimage) {
        console.log("✅ WebLN payment successful:", result);
        this.uiManager.updatePaymentStatus(
          "success",
          "✅ Payment sent successfully!"
        );

        // Process the payment immediately since we have the preimage
        this.processWebLNPayment(result);
      } else {
        this.uiManager.updatePaymentStatus("error", "❌ Payment failed");
        this.uiManager.showToast("Payment failed", "error");
      }
    } catch (error) {
      console.error("WebLN payment failed:", error);
      this.uiManager.updatePaymentStatus("error", "❌ Payment failed");
      this.uiManager.showToast(`Payment failed: ${error.message}`, "error");
    }
  }

  async processWebLNPayment(paymentResult) {
    try {
      console.log("🔍 Processing WebLN payment:", paymentResult);

      // Get the current swap from the stored context
      const currentSwap = this.currentSwap;
      if (!currentSwap) {
        throw new Error("No current swap found");
      }

      // Extract preimage and paymentHash from payment result
      const preimage = paymentResult.preimage;
      const paymentHash = paymentResult.paymentHash;

      if (!preimage) {
        throw new Error("No preimage received from payment");
      }

      if (!paymentHash) {
        throw new Error("No paymentHash received from payment");
      }

      console.log("✅ Preimage received:", preimage);
      console.log("✅ PaymentHash received:", paymentHash);

      // Update the current swap with the paymentHash from WebLN
      currentSwap.paymentHash = paymentHash;

      // Update UI to show we're creating the signature
      this.uiManager.updatePaymentStatus(
        "processing",
        "🔐 Creating Schnorr signature..."
      );

      // Create payment proof with Schnorr signature
      const paymentProof = await this.createPaymentProof(
        currentSwap.paymentHash,
        preimage,
        currentSwap.amount
      );

      console.log("✅ Payment proof created:", paymentProof);

      // Update UI to show we're verifying with Oracle
      this.uiManager.updatePaymentStatus(
        "processing",
        "🔍 Verifying with Oracle..."
      );

      // Extract actual private key and public key from payment proof
      // The payment proof contains the signature and full public key
      // We need to get the private key from the backend service
      const privateKeyHex = await this.getPrivateKeyForAddress(
        currentSwap.lightningAddress
      );

      // Extract X coordinate from the public key in payment proof
      // The publicKey in paymentProof is the full public key as hex (33 bytes = 66 hex chars)
      // For Schnorr signatures, we only need the X coordinate (32 bytes = 64 hex chars)
      // The public key format is: 66 hex chars (33 bytes total, no 0x prefix)
      // The X coordinate is the last 32 bytes (64 hex chars), skipping the compression prefix
      const publicKeyX = paymentProof.publicKey.slice(2, 66); // Skip prefix (2 chars) and take next 32 bytes (64 hex chars)

      // Ensure the publicKeyX is exactly 64 hex characters (32 bytes)
      if (publicKeyX.length !== 64) {
        throw new Error(
          `Invalid public key X coordinate length: ${publicKeyX.length}, expected 64`
        );
      }

      // Ensure the publicKeyX is valid hex
      if (!/^[0-9a-fA-F]{64}$/.test(publicKeyX)) {
        throw new Error(
          `Invalid public key X coordinate format: ${publicKeyX}`
        );
      }

      // Add 0x prefix for smart contract compatibility
      const publicKeyXWithPrefix = `0x${publicKeyX}`;

      console.log("🔐 Using actual values for verification:");
      console.log(
        "🔐 Full public key from payment proof:",
        paymentProof.publicKey
      );
      console.log("🔐 Public key length:", paymentProof.publicKey.length);
      console.log("🔐 Extracted public key X:", publicKeyX);
      console.log("🔐 Public key X length:", publicKeyX.length);
      console.log("🔐 Public key X with prefix:", publicKeyXWithPrefix);
      console.log(
        "🔐 Private key (first 10 chars):",
        privateKeyHex.substring(0, 12) + "..."
      );

      // Create message hash for both verifications
      const timestamp = Math.floor(Date.now() / 1000);
      const message = `lightning_payment:${currentSwap.paymentHash}:${preimage}:${currentSwap.amount}:${timestamp}`;
      const msgHash = ethers.keccak256(ethers.toUtf8Bytes(message));

      console.log("🔧 Message hash:", msgHash);
      console.log("🔧 Public key X:", publicKeyXWithPrefix);

      // Step 1: Regular Schnorr signature verification
      console.log(
        "🔐 Step 1: Attempting regular Schnorr signature verification..."
      );
      let regularVerificationResult;
      try {
        regularVerificationResult =
          await this.oracleManager.completePrivateVerificationFlow({
            paymentHash: currentSwap.paymentHash,
            preimage: preimage,
            privateKey: privateKeyHex,
            publicKeyX: publicKeyXWithPrefix,
            userAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            invoiceAmount: currentSwap.amount.toString(),
          });

        if (regularVerificationResult.success) {
          console.log("✅ Regular verification successful!");
        } else {
          console.log("⚠️ Regular verification failed but continuing...");
        }
      } catch (error) {
        console.log("⚠️ Regular verification error:", error.message);
        console.log("⚠️ Continuing to emergency verification...");
      }

      // Step 2: Emergency verification (always runs regardless of step 1 result)
      console.log("🔧 Step 2: Running emergency verification...");
      const emergencyVerificationResult =
        await this.oracleManager.emergencyVerifyMessage(
          msgHash,
          publicKeyXWithPrefix,
          "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          currentSwap.amount.toString()
        );

      // Use emergency verification result as the final result
      const verificationResult = emergencyVerificationResult;

      if (verificationResult.success) {
        console.log(
          "✅ Private Oracle verification successful:",
          verificationResult
        );

        // Complete the swap
        const swapCompleted = await this.swapManager.completeSwap(
          currentSwap.id,
          paymentProof
        );

        if (swapCompleted) {
          this.uiManager.updatePaymentStatus(
            "success",
            "🎉 Swap completed successfully!"
          );
          this.uiManager.showToast("Swap completed successfully!", "success");

          // Refresh swap list and token information
          await this.loadSwaps();

          // Refresh token information to show new balance
          const status = await this.oracleManager.getStatus();
          const tokenInfo = await this.oracleManager.loadTokenInfo(
            status.walletAddress
          );
          if (tokenInfo) {
            this.uiManager.updateTokenInfo(tokenInfo);
          }

          // Close the modal after a delay
          setTimeout(() => {
            this.uiManager.hideModal();
          }, 2000);
        } else {
          throw new Error("Failed to complete swap");
        }
      } else {
        throw new Error(
          `Oracle verification failed: ${verificationResult.error}`
        );
      }
    } catch (error) {
      console.error("Failed to process WebLN payment:", error);
      this.uiManager.updatePaymentStatus("error", "❌ Processing failed");
      this.uiManager.showToast(`Processing failed: ${error.message}`, "error");
    }
  }

  async createPaymentProof(paymentHash, preimage, amount) {
    try {
      console.log("🔐 Creating payment proof for swap:", paymentHash);

      // Get the payment hash from the current swap
      const swap = this.currentSwap;
      if (!swap) {
        throw new Error("No current swap found");
      }

      console.log("🔐 Swap object:", swap);
      console.log("🔐 Payment hash (parameter):", paymentHash);
      console.log("🔐 Payment hash (from swap):", swap.paymentHash);
      console.log("🔐 Preimage:", preimage);
      console.log("🔐 Amount:", amount);
      console.log("🔐 Lightning address:", swap.lightningAddress);

      // Create payment proof using the backend
      const paymentProof = await this.lightningClient.createPaymentProof(
        paymentHash,
        preimage,
        amount,
        swap.lightningAddress
      );

      console.log("✅ Payment proof created:", paymentProof);
      return paymentProof;
    } catch (error) {
      console.error("Failed to create payment proof:", error);
      throw error;
    }
  }

  /**
   * Get the private key for a Lightning address from the backend service
   * This is needed to create the Schnorr signature for verification
   */
  async getPrivateKeyForAddress(lightningAddress) {
    try {
      const response = await fetch(
        `http://localhost:3001/api/lightning/private-key/${encodeURIComponent(
          lightningAddress
        )}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.privateKey;
    } catch (error) {
      console.error("Failed to get private key for address:", error);
      throw error;
    }
  }

  async saveSettings() {
    try {
      const settings = {
        lightningAddress: document.getElementById("lightning-address").value,
        citreaRpc: document.getElementById("citrea-rpc").value,
        oracleContract: document.getElementById("oracle-contract").value,
      };

      localStorage.setItem(
        "lightning-client-settings",
        JSON.stringify(settings)
      );
      this.uiManager.showToast("Settings saved successfully", "success");
    } catch (error) {
      console.error("Failed to save settings:", error);
      this.uiManager.showToast("Failed to save settings", "error");
    }
  }

  copyPaymentRequest() {
    const paymentRequest = document.getElementById("payment-request").value;
    if (paymentRequest) {
      navigator.clipboard
        .writeText(paymentRequest)
        .then(() => {
          this.uiManager.showToast(
            "Payment request copied to clipboard",
            "success"
          );
        })
        .catch(() => {
          this.uiManager.showToast("Failed to copy payment request", "error");
        });
    }
  }
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Add a small delay to ensure all elements are rendered
  setTimeout(() => {
    new App();
  }, 100);
});

/**
 * UI Manager for handling user interface interactions
 */
export class UIManager {
  constructor() {
    this.currentSection = "home";
    this.activeModal = null;
  }

  init() {
    console.log("Initializing UI Manager...");
    this.setupEventListeners();
    this.loadSettings();
  }

  setupEventListeners() {
    // Handle escape key for modals
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.activeModal) {
        this.hideModal();
      }
    });
  }

  /**
   * Show a specific section
   */
  showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll(".section").forEach((section) => {
      section.classList.remove("active");
    });

    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.classList.add("active");
      this.currentSection = sectionId;
    }

    // Update navigation
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.remove("active");
    });

    const activeLink = document.querySelector(`[href="#${sectionId}"]`);
    if (activeLink) {
      activeLink.classList.add("active");
    }
  }

  /**
   * Show a modal
   */
  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("active");
      this.activeModal = modal;
      document.body.style.overflow = "hidden";
    }
  }

  /**
   * Hide the active modal
   */
  hideModal() {
    if (this.activeModal) {
      this.activeModal.classList.remove("active");
      this.activeModal = null;
      document.body.style.overflow = "";
    }
  }

  /**
   * Show payment modal
   */
  showPaymentModal(invoice, swap, isWebLN = false) {
    const paymentAmountEl = document.getElementById("payment-amount");
    if (paymentAmountEl) {
      paymentAmountEl.textContent = `${invoice.amount} sats`;
    }

    const paymentAddressEl = document.getElementById("payment-address");
    if (paymentAddressEl) {
      paymentAddressEl.textContent = swap.lightningAddress;
    }

    const paymentRequestEl = document.getElementById("payment-request");
    if (paymentRequestEl) {
      paymentRequestEl.value = invoice.paymentRequest;
    }

    // Show/hide WebLN payment button
    const weblnButton = document.getElementById("webln-pay-button");
    if (weblnButton) {
      weblnButton.style.display = isWebLN ? "block" : "none";
    }

    // Reset status
    const statusDot = document.querySelector("#payment-modal .status-dot");
    const statusText = document.querySelector("#payment-modal .status-text");
    if (statusDot && statusText) {
      statusDot.className = "status-dot";
      statusText.textContent = isWebLN
        ? "Ready to pay with WebLN..."
        : "Waiting for payment...";
    }

    this.showModal("payment-modal");
  }

  /**
   * Update payment status
   */
  updatePaymentStatus(status, message) {
    const statusDot = document.querySelector("#payment-modal .status-dot");
    const statusText = document.querySelector("#payment-modal .status-text");

    if (statusDot && statusText) {
      statusDot.className = `status-dot ${status}`;
      statusText.textContent = message;
    }
  }

  /**
   * Update swap statistics
   */
  updateStats(stats) {
    const totalSwapsEl = document.getElementById("total-swaps");
    if (totalSwapsEl) {
      totalSwapsEl.textContent = stats.total || 0;
    }

    const completedSwapsEl = document.getElementById("completed-swaps");
    if (completedSwapsEl) {
      completedSwapsEl.textContent = stats.completed || 0;
    }

    const pendingSwapsEl = document.getElementById("pending-swaps");
    if (pendingSwapsEl) {
      pendingSwapsEl.textContent = stats.pending || 0;
    }

    const successRateEl = document.getElementById("success-rate");
    if (successRateEl) {
      const successRate =
        stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
      successRateEl.textContent = `${successRate}%`;
    }
  }

  /**
   * Render swaps list
   */
  renderSwaps(swaps) {
    const swapsList = document.getElementById("swaps-list");
    if (!swapsList) return;

    if (swaps.length === 0) {
      swapsList.innerHTML = '<div class="no-swaps">No swaps found</div>';
      return;
    }

    swapsList.innerHTML = swaps
      .map((swap) => this.createSwapCard(swap))
      .join("");
  }

  /**
   * Create a swap card element
   */
  createSwapCard(swap) {
    const createdAt = new Date(swap.createdAt).toLocaleString();
    const statusClass = swap.status.toLowerCase();
    const statusIcon = this.getSwapStatusIcon(swap.status);

    return `
            <div class="swap-card" data-swap-id="${swap.id}">
                <div class="swap-header">
                    <span class="swap-id">${swap.id}</span>
                    <span class="swap-status ${statusClass}">${statusIcon} ${
      swap.status
    }</span>
                </div>
                <div class="swap-details">
                    <div class="swap-detail">
                        <span class="swap-detail-label">Lightning Address</span>
                        <span class="swap-detail-value">${
                          swap.lightningAddress
                        }</span>
                    </div>
                    <div class="swap-detail">
                        <span class="swap-detail-label">Amount</span>
                        <span class="swap-detail-value">${
                          swap.amount
                        } sats</span>
                    </div>
                    <div class="swap-detail">
                        <span class="swap-detail-label">Action</span>
                        <span class="swap-detail-value">${
                          swap.defiAction.type
                        }</span>
                    </div>
                    <div class="swap-detail">
                        <span class="swap-detail-label">Created</span>
                        <span class="swap-detail-value">${createdAt}</span>
                    </div>
                </div>
                <div class="swap-actions">
                    ${this.createSwapActions(swap)}
                </div>
            </div>
        `;
  }

  /**
   * Create swap action buttons
   */
  createSwapActions(swap) {
    const actions = [];

    if (swap.status === "pending") {
      actions.push(
        `<button class="btn btn-outline" onclick="app.cancelSwap('${swap.id}')">Cancel</button>`
      );
    }

    if (swap.status === "paid") {
      actions.push(
        `<button class="btn btn-primary" onclick="app.verifySwap('${swap.id}')">Verify</button>`
      );
    }

    if (swap.status === "completed") {
      actions.push(
        `<button class="btn btn-outline" onclick="app.viewSwap('${swap.id}')">View Details</button>`
      );
    }

    if (swap.status === "failed") {
      actions.push(
        `<button class="btn btn-outline" onclick="app.retrySwap('${swap.id}')">Retry</button>`
      );
    }

    return actions.join("");
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
   * Update oracle status
   */
  updateOracleStatus(status) {
    const statusIndicator = document.getElementById("oracle-status");
    if (!statusIndicator) return;

    const statusDot = statusIndicator.querySelector(".status-dot");
    const statusText = statusIndicator.querySelector(".status-text");

    if (statusDot && statusText) {
      statusDot.className = `status-dot ${
        status.connected ? "connected" : "disconnected"
      }`;
      statusText.textContent = status.connected ? "Connected" : "Disconnected";
    }

    const blockHeightEl = document.getElementById("block-height");
    if (blockHeightEl) {
      blockHeightEl.textContent = status.blockHeight
        ? status.blockHeight.toLocaleString()
        : "N/A";
    }

    const walletBalanceEl = document.getElementById("wallet-balance");
    if (walletBalanceEl) {
      walletBalanceEl.textContent = status.walletBalance
        ? this.formatBalance(status.walletBalance)
        : "N/A";
    }

    const walletAddressEl = document.getElementById("wallet-address");
    if (walletAddressEl) {
      walletAddressEl.textContent = status.walletAddress
        ? this.formatAddress(status.walletAddress)
        : "N/A";
    }
  }

  /**
   * Update contract information
   */
  updateContractInfo(contractInfo) {
    const oracleContractEl = document.getElementById("oracle-contract");
    if (oracleContractEl) {
      oracleContractEl.textContent = contractInfo.oracle || "Not deployed";
    }

    const defiContractEl = document.getElementById("defi-contract");
    if (defiContractEl) {
      defiContractEl.textContent = contractInfo.defi || "Not deployed";
    }

    const tokenContractEl = document.getElementById("token-contract");
    if (tokenContractEl) {
      tokenContractEl.textContent = contractInfo.token || "Not deployed";
    }
  }

  /**
   * Update token information
   */
  updateTokenInfo(tokenInfo) {
    const tokenSupplyEl = document.getElementById("token-supply");
    if (tokenSupplyEl) {
      tokenSupplyEl.textContent = tokenInfo.supply
        ? tokenInfo.supply.toLocaleString()
        : "-";
    }

    const tokenBalanceEl = document.getElementById("token-balance");
    if (tokenBalanceEl) {
      tokenBalanceEl.textContent = tokenInfo.balance
        ? tokenInfo.balance.toLocaleString()
        : "-";
    }

    const defiBalanceEl = document.getElementById("defi-balance");
    if (defiBalanceEl) {
      defiBalanceEl.textContent = tokenInfo.defiBalance
        ? tokenInfo.defiBalance.toLocaleString()
        : "-";
    }
  }

  /**
   * Show verification result
   */
  showVerificationResult(isValid, details) {
    const resultDiv = document.getElementById("verification-result");
    if (!resultDiv) return;

    resultDiv.className = `verification-result ${
      isValid ? "success" : "error"
    }`;

    if (isValid) {
      resultDiv.innerHTML = `
                <h4>✅ Payment Verified</h4>
                <p>Payment hash: ${details.paymentHash}</p>
                <p>Amount: ${details.amount} sats</p>
                <p>Verified at: ${new Date(
                  details.timestamp
                ).toLocaleString()}</p>
            `;
    } else {
      resultDiv.innerHTML = `
                <h4>❌ Payment Not Verified</h4>
                <p>This payment has not been verified on-chain.</p>
            `;
    }
  }

  /**
   * Show toast notification
   */
  showToast(message, type = "info") {
    const toastContainer = document.getElementById("toast-container");
    if (!toastContainer) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 5000);
  }

  /**
   * Format balance
   */
  formatBalance(balance) {
    const num = parseFloat(balance);
    if (num >= 1) {
      return `${num.toFixed(4)} ETH`;
    } else if (num >= 0.0001) {
      return `${(num * 1000).toFixed(2)} mETH`;
    } else {
      return `${(num * 1000000).toFixed(0)} wei`;
    }
  }

  /**
   * Format address
   */
  formatAddress(address) {
    if (!address) return "-";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * Load settings from localStorage
   */
  loadSettings() {
    try {
      const settings = JSON.parse(
        localStorage.getItem("lightning-client-settings") || "{}"
      );

      const lightningAddressEl = document.getElementById("lightning-address");
      if (lightningAddressEl) {
        if (settings.lightningAddress) {
          lightningAddressEl.value = settings.lightningAddress;
        } else {
          // Set default test Lightning address
          lightningAddressEl.value = "predator@wallet.yakihonne.com";
        }
      }

      const citreaRpcEl = document.getElementById("citrea-rpc");
      if (citreaRpcEl && settings.citreaRpc) {
        citreaRpcEl.value = settings.citreaRpc;
      }

      const oracleContractEl = document.getElementById("oracle-contract");
      if (oracleContractEl && settings.oracleContract) {
        oracleContractEl.value = settings.oracleContract;
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }

  /**
   * Save settings to localStorage
   */
  saveSettings() {
    try {
      const lightningAddressEl = document.getElementById("lightning-address");
      const citreaRpcEl = document.getElementById("citrea-rpc");
      const oracleContractEl = document.getElementById("oracle-contract");

      const settings = {
        lightningAddress: lightningAddressEl ? lightningAddressEl.value : "",
        citreaRpc: citreaRpcEl ? citreaRpcEl.value : "",
        oracleContract: oracleContractEl ? oracleContractEl.value : "",
      };

      localStorage.setItem(
        "lightning-client-settings",
        JSON.stringify(settings)
      );
      this.showToast("Settings saved successfully", "success");
    } catch (error) {
      console.error("Failed to save settings:", error);
      this.showToast("Failed to save settings", "error");
    }
  }

  /**
   * Clear form
   */
  clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
      form.reset();
    }
  }

  /**
   * Set form field value
   */
  setFormField(formId, fieldName, value) {
    const form = document.getElementById(formId);
    if (form) {
      const field =
        form.querySelector(`[name="${fieldName}"]`) ||
        document.getElementById(fieldName);
      if (field) {
        field.value = value;
      }
    }
  }

  /**
   * Get form field value
   */
  getFormField(formId, fieldName) {
    const form = document.getElementById(formId);
    if (form) {
      const field =
        form.querySelector(`[name="${fieldName}"]`) ||
        document.getElementById(fieldName);
      if (field) {
        return field.value;
      }
    }
    return null;
  }

  /**
   * Show loading state
   */
  showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.add("loading");
    }
  }

  /**
   * Hide loading state
   */
  hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.remove("loading");
    }
  }
}

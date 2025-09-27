/**
 * Oracle Manager for interacting with the Citrea Lightning Oracle
 */
export class OracleManager {
  constructor() {
    this.baseUrl = "http://localhost:3001/api/oracle";
    this.isConnected = false;
    this.status = {
      connected: false,
      blockHeight: 0,
      walletAddress: null,
      walletBalance: "0",
    };
  }

  async init() {
    console.log("Initializing Oracle Manager...");
    await this.loadStatus();
  }

  /**
   * Load oracle status
   */
  async loadStatus() {
    try {
      const [blockResponse, walletResponse, contractsResponse] =
        await Promise.all([
          fetch(`${this.baseUrl}/block`),
          fetch(`${this.baseUrl}/wallet`),
          fetch(`${this.baseUrl}/contracts`),
        ]);

      if (blockResponse.ok) {
        const blockData = await blockResponse.json();
        this.status.blockHeight = blockData.blockNumber;
      }

      if (walletResponse.ok) {
        const walletData = await walletResponse.json();
        this.status.walletAddress = walletData.address;
        this.status.walletBalance = walletData.balance;
      }

      if (contractsResponse.ok) {
        const contractsData = await contractsResponse.json();
        this.status.contractInfo = contractsData;
      }

      this.status.connected = true;
      this.isConnected = true;
    } catch (error) {
      console.error("Failed to load oracle status:", error);
      this.status.connected = false;
      this.isConnected = false;
    }
  }

  /**
   * Get current status
   */
  getStatus() {
    return this.status;
  }

  /**
   * Load contract information
   */
  async loadContractInfo() {
    try {
      const response = await fetch(`${this.baseUrl}/contracts`);
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      return null;
    } catch (error) {
      console.error("Failed to load contract info:", error);
      return null;
    }
  }

  /**
   * Load token information
   */
  async loadTokenInfo(userAddress = null) {
    try {
      const requests = [fetch(`${this.baseUrl}/token/supply`)];

      // If user address is provided, get user-specific data
      if (userAddress) {
        requests.push(
          fetch(`${this.baseUrl}/token/balance/${userAddress}`),
          fetch(`${this.baseUrl}/defi/balance/${userAddress}`)
        );
      }

      const responses = await Promise.all(requests);
      const data = {};

      if (responses[0].ok) {
        const supplyData = await responses[0].json();
        data.supply = supplyData.supply;
      }

      if (userAddress && responses[1] && responses[1].ok) {
        const balanceData = await responses[1].json();
        data.balance = balanceData.balance;
      }

      if (userAddress && responses[2] && responses[2].ok) {
        const defiBalanceData = await responses[2].json();
        data.defiBalance = defiBalanceData.balance;
      }

      return data;
    } catch (error) {
      console.error("Failed to load token info:", error);
      return null;
    }
  }

  /**
   * Verify a payment proof on-chain
   */
  async verifyPaymentProof(proof) {
    try {
      const response = await fetch(`${this.baseUrl}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          proof,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to verify payment proof:", error);
      throw error;
    }
  }

  /**
   * Check if a payment has been verified on-chain
   */
  async isPaymentVerified(paymentHash) {
    try {
      const response = await fetch(`${this.baseUrl}/payment/${paymentHash}`);
      if (!response.ok) {
        if (response.status === 404) {
          return false;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.isVerified;
    } catch (error) {
      console.error("Failed to check payment verification:", error);
      return false;
    }
  }

  /**
   * Get payment details from the oracle contract
   */
  async getPaymentDetails(paymentHash) {
    try {
      const response = await fetch(
        `${this.baseUrl}/payment/${paymentHash}/details`
      );
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to get payment details:", error);
      return null;
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(txHash) {
    try {
      const response = await fetch(`${this.baseUrl}/transaction/${txHash}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to get transaction details:", error);
      return null;
    }
  }

  /**
   * Get current block number
   */
  async getCurrentBlockNumber() {
    try {
      const response = await fetch(`${this.baseUrl}/block`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      this.status.blockHeight = result.blockNumber;
      return result.blockNumber;
    } catch (error) {
      console.error("Failed to get current block number:", error);
      return 0;
    }
  }

  /**
   * Get wallet information
   */
  async getWalletInfo() {
    try {
      const response = await fetch(`${this.baseUrl}/wallet`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      this.status.walletAddress = result.address;
      this.status.walletBalance = result.balance;
      return result;
    } catch (error) {
      console.error("Failed to get wallet info:", error);
      return null;
    }
  }

  /**
   * Format wallet balance
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
   * Format wallet address
   */
  formatAddress(address) {
    if (!address) return "-";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * Format block number
   */
  formatBlockNumber(blockNumber) {
    return blockNumber.toLocaleString();
  }

  /**
   * Check if oracle is connected
   */
  isOracleConnected() {
    return this.isConnected;
  }

  /**
   * Get connection status text
   */
  getConnectionStatusText() {
    return this.isConnected ? "Connected" : "Disconnected";
  }

  /**
   * Get connection status class
   */
  getConnectionStatusClass() {
    return this.isConnected ? "connected" : "disconnected";
  }

  /**
   * Start periodic status updates
   */
  startStatusUpdates(interval = 30000) {
    this.statusUpdateInterval = setInterval(async () => {
      await this.loadStatus();
    }, interval);
  }

  /**
   * Stop periodic status updates
   */
  stopStatusUpdates() {
    if (this.statusUpdateInterval) {
      clearInterval(this.statusUpdateInterval);
      this.statusUpdateInterval = null;
    }
  }
}

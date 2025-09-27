/**
 * Contract addresses for Lightning Client integration
 * These are the deployed addresses from the Schnorr-Private-2.0 deployment
 */

export const CONTRACT_ADDRESSES = {
  // Local Anvil deployment addresses (from our deployment)
  LOCAL: {
    // Original contracts
    ORACLE_CONTRACT_ADDRESS: "0xF99b791257ab50be7F235BC825E7d4B83942cf38",
    DEFI_CONTRACT_ADDRESS: "0x56EF69e24c3bCa5135C18574b403273F1eB2Bd74",
    TOKEN_CONTRACT_ADDRESS: "0x309222b7833D3D0A59A8eBf9C64A5790bf43E2aA",

    // Schnorr-Private-2.0 contracts
    ORACLE_PRIVATE_CONTRACT_ADDRESS:
      "0x57eB75Df7f17aA5351f850040EeD5c66F945dF32",
    DEFI_PRIVATE_CONTRACT_ADDRESS: "0x5192Ffbc96b2E731649714B7b51d4cC4CA1fAB8F",
  },

  // Citrea Testnet (to be updated when deployed)
  CITREA_TESTNET: {
    ORACLE_CONTRACT_ADDRESS: "",
    DEFI_CONTRACT_ADDRESS: "",
    TOKEN_CONTRACT_ADDRESS: "",
    ORACLE_PRIVATE_CONTRACT_ADDRESS: "",
    DEFI_PRIVATE_CONTRACT_ADDRESS: "",
  },

  // Citrea Mainnet (to be updated when deployed)
  CITREA_MAINNET: {
    ORACLE_CONTRACT_ADDRESS: "",
    DEFI_CONTRACT_ADDRESS: "",
    TOKEN_CONTRACT_ADDRESS: "",
    ORACLE_PRIVATE_CONTRACT_ADDRESS: "",
    DEFI_PRIVATE_CONTRACT_ADDRESS: "",
  },
} as const;

export const RPC_URLS = {
  LOCAL: "http://localhost:8545",
  CITREA_TESTNET: "https://rpc-testnet.citrea.xyz",
  CITREA_MAINNET: "https://rpc.citrea.xyz",
} as const;

export const DEFAULT_PRIVATE_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // Anvil default

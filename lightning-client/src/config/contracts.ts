/**
 * Contract addresses for Lightning Client integration
 * These are the deployed addresses from the Schnorr-Private-2.0 deployment
 */

export const CONTRACT_ADDRESSES = {
  // Local Anvil deployment addresses (from our deployment)
  LOCAL: {
    // Shared token contract (used by both versions) - Latest Deployment
    TOKEN_CONTRACT_ADDRESS: "0xA524319d310fa96AAf6E25F8af729587C2DEaE8a",

    // Original contracts - Latest Deployment
    ORACLE_CONTRACT_ADDRESS: "0xa52309eD1DE8781CBeECEF9d05B4B09B209B2493",
    DEFI_CONTRACT_ADDRESS: "0x78f80b74B8caFB14Da95fBfeEDB99c57C8673781",

    // Schnorr-Private-2.0 contracts - Latest Deployment (Simplified)
    ORACLE_PRIVATE_CONTRACT_ADDRESS:
      "0xcEd281f6DaC2AB1AFF3DA393809e01F0f1a46f84",
    DEFI_PRIVATE_CONTRACT_ADDRESS: "0x7A409A3A36112bd6906a113d9612D7f7e1abd6d4",
  },

  // Citrea Testnet - Deployed Contracts
  CITREA_TESTNET: {
    TOKEN_CONTRACT_ADDRESS: "0x94c17DD37ED3Ca85764b35BfD4d1CCc543b1bE3E",
    ORACLE_CONTRACT_ADDRESS: "0x4a95E7e42c968A6c7BFBBb2F2AA908463B46059E",
    DEFI_CONTRACT_ADDRESS: "0x9d24c52916A14afc31D86B5Aa046b252383ee444",
    ORACLE_PRIVATE_CONTRACT_ADDRESS:
      "0xc36B6BFa0ce8C6bdD8efcCd23CeC2E425768f64a",
    DEFI_PRIVATE_CONTRACT_ADDRESS: "0x90e97EF730B28B14b3F5f9214f47312796b6c10e",
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
  CITREA_TESTNET: "https://rpc.testnet.citrea.xyz",
  CITREA_MAINNET: "https://rpc.citrea.xyz",
} as const;

export const DEFAULT_PRIVATE_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // Anvil default

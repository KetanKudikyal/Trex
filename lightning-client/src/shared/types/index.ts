export interface LightningInvoice {
  paymentRequest: string;
  paymentHash: string;
  amount: number; // in satoshis
  description?: string;
  expiry?: number;
  timestamp: number;
}

export interface PaymentProof {
  paymentHash: string;
  preimage: string;
  signature: string;
  publicKey: string;
  timestamp: number;
  amount: number;
}

export interface SchnorrSignature {
  r: string; // 32-byte r value
  s: string; // 32-byte s value
  message: string; // original message that was signed
}

export interface OracleVerificationResult {
  isValid: boolean;
  paymentHash: string;
  amount: number;
  timestamp: number;
  error?: string;
}

export interface DeFiAction {
  type: 'release_tokens' | 'unlock_funds' | 'mint_nft' | 'custom';
  amount?: number;
  tokenAddress?: string;
  recipient: string;
  metadata?: Record<string, any>;
}

export interface SwapRequest {
  id: string;
  lightningAddress: string;
  amount: number;
  defiAction: DeFiAction;
  status: 'pending' | 'paid' | 'verified' | 'completed' | 'failed';
  createdAt: number;
  paymentProof?: PaymentProof;
  transactionHash?: string;
}

export interface LightningAddressData {
  address: string;
  lnurlpData?: any;
  keysendData?: any;
  isSupported: boolean;
}

export interface CitreaTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  timestamp: number;
}

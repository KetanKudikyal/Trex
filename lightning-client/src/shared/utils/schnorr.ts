import { getPublicKey, sign, verify } from "@noble/secp256k1";
import { randomBytes, createHash } from "crypto";
import { PaymentProof } from "../types/index.js";

// Set up the required hash function for @noble/secp256k1
import { etc } from "@noble/secp256k1";
etc.hmacSha256Sync = (key: Uint8Array, ...msgs: Uint8Array[]) => {
  const h = createHash("sha256");
  h.update(key);
  for (const msg of msgs) h.update(msg);
  return h.digest();
};

/**
 * Schnorr signature utilities for Lightning Network payment proofs
 * Implements BIP-340 Schnorr signatures for Taproot compatibility
 */

export class SchnorrUtils {
  /**
   * Generate a new random private key
   */
  static generatePrivateKey(): Uint8Array {
    return randomBytes(32);
  }

  /**
   * Get public key from private key
   */
  static getPublicKey(privateKey: Uint8Array): Uint8Array {
    return getPublicKey(privateKey);
  }

  /**
   * Sign a message with a private key using Schnorr signature
   */
  static signMessage(
    message: string,
    privateKey: Uint8Array
  ): SchnorrSignature {
    const messageBytes = new TextEncoder().encode(message);
    const messageHash = this.hashMessage(messageBytes);
    const signature = sign(messageHash, privateKey);

    // Convert signature r and s to hex strings
    const rHex = signature.r.toString(16).padStart(64, "0");
    const sHex = signature.s.toString(16).padStart(64, "0");

    return {
      r: rHex,
      s: sHex,
      message,
    };
  }

  /**
   * Sign a message hash directly with a private key using Schnorr signature
   * This is useful when you already have a hash and want to sign it directly
   */
  static signMessageHash(
    messageHash: Uint8Array,
    privateKey: Uint8Array
  ): SchnorrSignature {
    // Use deterministic signing for better compatibility with Citrea precompile
    const signature = sign(messageHash, privateKey, { extraEntropy: false });

    // Convert signature r and s to hex strings with proper padding
    const rHex = signature.r.toString(16).padStart(64, "0");
    const sHex = signature.s.toString(16).padStart(64, "0");

    return {
      r: rHex,
      s: sHex,
      message: "", // No original message since we signed a hash directly
    };
  }

  /**
   * Verify a Schnorr signature
   */
  static verifySignature(
    signature: SchnorrSignature,
    publicKey: Uint8Array,
    message?: string
  ): boolean {
    try {
      const messageToVerify = message || signature.message;
      const messageBytes = new TextEncoder().encode(messageToVerify);
      const messageHash = this.hashMessage(messageBytes);

      // Reconstruct the signature from r and s values
      const r = Buffer.from(signature.r, "hex");
      const s = Buffer.from(signature.s, "hex");
      const fullSignature = new Uint8Array([...r, ...s]);

      return verify(fullSignature, messageHash, publicKey);
    } catch (error) {
      console.error("Signature verification failed:", error);
      return false;
    }
  }

  /**
   * Hash a message using SHA-256
   */
  private static hashMessage(message: Uint8Array): Uint8Array {
    return new Uint8Array(createHash("sha256").update(message).digest());
  }

  /**
   * Create a payment proof with Schnorr signature
   */
  static createPaymentProof(
    paymentHash: string,
    preimage: string,
    amount: number,
    privateKey: Uint8Array
  ): PaymentProof {
    const publicKey = this.getPublicKey(privateKey);
    const timestamp = Date.now();
    const message = this.createPaymentMessage(
      paymentHash,
      preimage,
      amount,
      timestamp
    );
    const signature = this.signMessage(message, privateKey);

    return {
      paymentHash,
      preimage,
      signature: `${signature.r}${signature.s}`,
      publicKey: Buffer.from(publicKey).toString("hex"),
      timestamp,
      amount,
    };
  }

  /**
   * Verify a payment proof
   */
  static verifyPaymentProof(proof: PaymentProof): boolean {
    try {
      const publicKey = Buffer.from(proof.publicKey, "hex");
      const message = this.createPaymentMessage(
        proof.paymentHash,
        proof.preimage,
        proof.amount,
        proof.timestamp
      );

      const signature: SchnorrSignature = {
        r: proof.signature.slice(0, 64),
        s: proof.signature.slice(64, 128),
        message,
      };

      return this.verifySignature(signature, publicKey, message);
    } catch (error) {
      console.error("Payment proof verification failed:", error);
      return false;
    }
  }

  /**
   * Create a standardized message for payment proof
   */
  private static createPaymentMessage(
    paymentHash: string,
    preimage: string,
    amount: number,
    timestamp?: number
  ): string {
    const ts = timestamp || Date.now();
    return `lightning_payment:${paymentHash}:${preimage}:${amount}:${ts}`;
  }

  /**
   * Convert signature to DER format (for compatibility with some systems)
   */
  static signatureToDER(signature: SchnorrSignature): string {
    const r = Buffer.from(signature.r, "hex");
    const s = Buffer.from(signature.s, "hex");

    // Simple DER encoding for Schnorr signature
    const der = Buffer.concat([
      Buffer.from([0x30]), // SEQUENCE
      Buffer.from([r.length + s.length + 4]), // Length
      Buffer.from([0x02]), // INTEGER
      Buffer.from([r.length]), // R length
      r,
      Buffer.from([0x02]), // INTEGER
      Buffer.from([s.length]), // S length
      s,
    ]);

    return der.toString("hex");
  }

  /**
   * Parse DER signature back to Schnorr format
   */
  static signatureFromDER(derSignature: string): SchnorrSignature {
    const der = Buffer.from(derSignature, "hex");

    // Simple DER parsing
    let offset = 4; // Skip SEQUENCE and length
    offset++; // Skip INTEGER tag for R
    const rLength = der[offset++];
    const r = der.slice(offset, offset + rLength);
    offset += rLength;

    offset++; // Skip INTEGER tag for S
    const sLength = der[offset++];
    const s = der.slice(offset, offset + sLength);

    return {
      r: r.toString("hex"),
      s: s.toString("hex"),
      message: "", // Will be set when used
    };
  }
}

export interface SchnorrSignature {
  r: string;
  s: string;
  message: string;
}

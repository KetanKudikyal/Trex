#!/usr/bin/env node

/**
 * Test script to verify Schnorr signature generation and format
 * This will help debug the Citrea precompile compatibility issue
 */

import { ethers } from "ethers";
import { getPublicKey, sign } from "@noble/secp256k1";
import { createHash } from "crypto";

// Test data
const paymentHash =
  "d7afe7b94a76faa36155bc07cad9bfbed4ecc9c83e189cbe13af176caa40e4a6";
const preimage =
  "a922ae8899d808767c6dfa9788ee566f23fac9042abbf79c99d52c3862d968d9";
const amount = 10;
const timestamp = Math.floor(Date.now() / 1000);

console.log("🧪 Testing Schnorr signature generation...");
console.log("📋 Test data:");
console.log("  paymentHash:", paymentHash);
console.log("  preimage:", preimage);
console.log("  amount:", amount);
console.log("  timestamp:", timestamp);

// Step 1: Create message hash using the same format as our backend
console.log("\n🔐 Step 1: Creating message hash...");
const message = `lightning_payment:${paymentHash}:${preimage}:${amount}:${timestamp}`;
console.log("  message:", message);

const msgHash = ethers.keccak256(ethers.toUtf8Bytes(message));
console.log("  msgHash:", msgHash);
console.log("  msgHash length:", msgHash.length);

// Step 2: Generate private key and public key
console.log("\n🔐 Step 2: Generating keys...");
const privateKey = new Uint8Array(32);
crypto.getRandomValues(privateKey);
console.log(
  "  privateKey (first 10 bytes):",
  Array.from(privateKey.slice(0, 10))
);

const publicKey = getPublicKey(privateKey);
console.log("  publicKey:", Buffer.from(publicKey).toString("hex"));
console.log("  publicKey length:", publicKey.length);

// Extract X coordinate (first 32 bytes)
const publicKeyX = Buffer.from(publicKey).toString("hex").slice(0, 64);
console.log("  publicKeyX:", publicKeyX);
console.log("  publicKeyX length:", publicKeyX.length);

// Step 3: Generate Schnorr signature
console.log("\n🔐 Step 3: Generating Schnorr signature...");
const msgHashBytes = ethers.getBytes(msgHash);
console.log("  msgHashBytes length:", msgHashBytes.length);

const signature = sign(msgHashBytes, privateKey);
console.log("  signature.r (BigInt):", signature.r.toString());
console.log("  signature.s (BigInt):", signature.s.toString());

// Convert to hex strings
const rHex = signature.r.toString(16).padStart(64, "0");
const sHex = signature.s.toString(16).padStart(64, "0");
console.log("  rHex:", rHex, "length:", rHex.length);
console.log("  sHex:", sHex, "length:", sHex.length);

// Combine signature
const combinedSignature = `0x${rHex}${sHex}`;
console.log("  combinedSignature:", combinedSignature);
console.log("  combinedSignature length:", combinedSignature.length);

// Step 4: Verify signature locally
console.log("\n🔐 Step 4: Verifying signature locally...");
try {
  const isValid = verify(signature, msgHashBytes, publicKey);
  console.log("  Local verification result:", isValid);
} catch (error) {
  console.log("  Local verification error:", error.message);
}

// Step 5: Prepare data for Citrea precompile
console.log("\n🔐 Step 5: Preparing data for Citrea precompile...");
const publicKeyXBytes = ethers.getBytes(`0x${publicKeyX}`);
const msgHashBytes32 = ethers.getBytes(msgHash);
const signatureBytes = ethers.getBytes(combinedSignature);

console.log("  publicKeyXBytes length:", publicKeyXBytes.length);
console.log("  msgHashBytes32 length:", msgHashBytes32.length);
console.log("  signatureBytes length:", signatureBytes.length);

const totalInputSize =
  publicKeyXBytes.length + msgHashBytes32.length + signatureBytes.length;
console.log("  Total input size:", totalInputSize, "bytes (expected: 128)");

// Step 6: Show the exact input that would be sent to the precompile
console.log("\n🔐 Step 6: Precompile input format...");
const precompileInput = ethers.concat([
  publicKeyXBytes,
  msgHashBytes32,
  signatureBytes,
]);
console.log("  precompileInput length:", precompileInput.length);
console.log(
  "  precompileInput (first 32 bytes):",
  ethers.hexlify(precompileInput.slice(0, 32))
);

console.log("\n✅ Test completed. Check the output above for any issues.");

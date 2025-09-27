#!/usr/bin/env node

/**
 * Test script to verify if the issue is with signature verification or the entire flow
 * Uses the emergency verification function to bypass signature verification
 */

import { ethers } from "ethers";

// Test data
const paymentHash =
  "d7afe7b94a76faa36155bc07cad9bfbed4ecc9c83e189cbe13af176caa40e4a6";
const preimage =
  "a922ae8899d808767c6dfa9788ee566f23fac9042abbf79c99d52c3862d968d9";
const amount = 10;
const timestamp = 1759003300;

console.log(
  "🧪 Testing emergency verification to bypass signature verification..."
);

// Create message hash
const message = `lightning_payment:${paymentHash}:${preimage}:${amount}:${timestamp}`;
const msgHash = ethers.keccak256(ethers.toUtf8Bytes(message));

console.log("📋 Test data:");
console.log("  message:", message);
console.log("  msgHash:", msgHash);

// Test emergency verification API call
async function testEmergencyVerification() {
  try {
    const response = await fetch(
      "http://localhost:3001/api/oracle-private/emergency-verify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          msgHash: msgHash,
          publicKeyX:
            "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef", // Dummy public key
          userAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          invoiceAmount: amount.toString(),
        }),
      }
    );

    const result = await response.json();

    if (response.ok) {
      console.log("✅ Emergency verification successful!");
      console.log("  Result:", result);
    } else {
      console.log("❌ Emergency verification failed:");
      console.log("  Error:", result.error);
    }
  } catch (error) {
    console.log("❌ Emergency verification error:");
    console.log("  Error:", error.message);
  }
}

// Run the test
testEmergencyVerification().then(() => {
  console.log("\n📝 Conclusion:");
  console.log(
    "  - If emergency verification works: Issue is with signature verification"
  );
  console.log(
    "  - If emergency verification fails: Issue is with the entire flow"
  );
});

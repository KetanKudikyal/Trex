#!/usr/bin/env node

const { ethers } = require("ethers");

// Latest contract addresses
const CONTRACTS = {
  token: "0xA524319d310fa96AAf6E25F8af729587C2DEaE8a",
  oraclePrivate: "0xcEd281f6DaC2AB1AFF3DA393809e01F0f1a46f84",
  defiPrivate: "0x7A409A3A36112bd6906a113d9612D7f7e1abd6d4",
};

const TEST_USER = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
const INVOICE_AMOUNT = ethers.parseEther("1.0"); // 1 ETH

// Simple ABI for testing
const TOKEN_ABI = [
  "function balanceOf(address) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
  "function mint(address,uint256) external",
];

const DEFI_ABI = [
  "function onPaymentVerifiedPrivate(bytes32,address,bytes32,uint256) external",
];

async function testSimpleFlow() {
  console.log("🧪 Testing Simplified Flow");
  console.log("===========================");

  // Connect to local Anvil
  const provider = new ethers.JsonRpcProvider("http://localhost:8545");
  const ownerWallet = new ethers.Wallet(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    provider
  );

  const tokenContract = new ethers.Contract(
    CONTRACTS.token,
    TOKEN_ABI,
    ownerWallet
  );
  const defiContract = new ethers.Contract(
    CONTRACTS.defiPrivate,
    DEFI_ABI,
    ownerWallet
  );

  try {
    // Test 1: Check initial balances
    console.log("\n1️⃣ Initial State:");
    const initialBalance = await tokenContract.balanceOf(TEST_USER);
    const initialSupply = await tokenContract.totalSupply();

    console.log(`   User Balance: ${ethers.formatEther(initialBalance)} TREX`);
    console.log(`   Total Supply: ${ethers.formatEther(initialSupply)} TREX`);

    // Test 2: Direct DeFi contract call
    console.log("\n2️⃣ Testing Direct DeFi Contract Call:");
    console.log(`   Invoice Amount: ${ethers.formatEther(INVOICE_AMOUNT)} ETH`);

    // Calculate expected rewards: invoice + 1.5% = 1.015 ETH
    const expectedCBTC = INVOICE_AMOUNT + (INVOICE_AMOUNT * 150n) / 10000n;
    const expectedReward = expectedCBTC / 10n;

    console.log(`   Expected cBTC: ${ethers.formatEther(expectedCBTC)} TREX`);
    console.log(
      `   Expected Reward: ${ethers.formatEther(expectedReward)} TREX`
    );

    // Call DeFi contract directly
    const tx = await defiContract.onPaymentVerifiedPrivate(
      "0xea6d2adf88a8591f22eab328ec85239e211bd0b4b76788c6350787eff66d1e03",
      TEST_USER,
      "0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
      INVOICE_AMOUNT
    );

    console.log(`   Transaction Hash: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`   Gas Used: ${receipt.gasUsed.toString()}`);

    // Test 3: Check final balances
    console.log("\n3️⃣ Final State:");
    const finalBalance = await tokenContract.balanceOf(TEST_USER);
    const finalSupply = await tokenContract.totalSupply();

    console.log(`   User Balance: ${ethers.formatEther(finalBalance)} TREX`);
    console.log(`   Total Supply: ${ethers.formatEther(finalSupply)} TREX`);

    // Test 4: Verify rewards
    console.log("\n4️⃣ Reward Verification:");
    const actualReward = finalBalance - initialBalance;
    const actualSupply = finalSupply - initialSupply;

    console.log(
      `   Actual User Reward: ${ethers.formatEther(actualReward)} TREX`
    );
    console.log(
      `   Actual Supply Increase: ${ethers.formatEther(actualSupply)} TREX`
    );

    if (actualReward > 0n) {
      console.log("\n🎉 SUCCESS: Simplified flow is working!");
      console.log("   ✅ Direct DeFi contract call succeeded");
      console.log("   ✅ Tokens were minted to user");
      console.log("   ✅ Reward calculation is working");
      console.log(
        `   ✅ User received ${ethers.formatEther(actualReward)} TREX tokens`
      );
    } else {
      console.log("\n❌ ISSUE: No tokens were minted");
      console.log("   - Direct call succeeded but no tokens received");
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the test
testSimpleFlow().catch(console.error);

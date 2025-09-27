// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {Test, console} from "forge-std/Test.sol";
import {TrexToken} from "../src/TrexToken.sol";
import {LightningOracle} from "../src/LightningOracle.sol";
import {DeFiContract} from "../src/DeFiContract.sol";
import {LightningOraclePrivate} from "../src/LightningOraclePrivate.sol";
import {DeFiContractPrivate} from "../src/DeFiContractPrivate.sol";

/**
 * @title TrexFlowTest
 * @dev Comprehensive tests for the complete Trex Lightning DeFi flow
 * @notice Tests both original and Schnorr-Private-2.0 versions
 */
contract TrexFlowTest is Test {
    // Contracts
    TrexToken public token;
    LightningOracle public oracle;
    DeFiContract public defiContract;
    LightningOraclePrivate public oraclePrivate;
    DeFiContractPrivate public defiContractPrivate;
    
    // Test accounts
    address public owner;
    address public user1;
    address public user2;
    address public user3;
    
    // Test data
    bytes32 public constant TEST_PAYMENT_HASH = 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef;
    bytes32 public constant TEST_PREIMAGE = 0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890;
    bytes32 public constant TEST_MSG_HASH = 0xea6d2adf88a8591f22eab328ec85239e211bd0b4b76788c6350787eff66d1e03;
    bytes32 public constant TEST_PUBLIC_KEY_X = 0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798;
    uint256 public constant TEST_AMOUNT = 1000000000000000000; // 1 BTC in wei
    
    // Events to test
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Mint(address indexed to, uint256 value);
    event MinterAdded(address indexed minter);

    function setUp() public {
        // Set up test accounts
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");
        
        // Deploy contracts
        token = new TrexToken();
        oracle = new LightningOracle(address(0));
        defiContract = new DeFiContract(address(oracle), address(token));
        oraclePrivate = new LightningOraclePrivate(address(0));
        defiContractPrivate = new DeFiContractPrivate(
            address(oraclePrivate), 
            address(token), 
            address(token)
        );
        
        // Set up relationships
        oracle.setDeFiContract(address(defiContract));
        oraclePrivate.setDeFiContract(address(defiContractPrivate));
        
        // Add both DeFi contracts as minters
        token.addMinter(address(defiContract));
        token.addMinter(address(defiContractPrivate));
        
        console.log("=== Test Setup Complete ===");
        console.log("Token:", address(token));
        console.log("Oracle:", address(oracle));
        console.log("DeFi:", address(defiContract));
        console.log("OraclePrivate:", address(oraclePrivate));
        console.log("DeFiPrivate:", address(defiContractPrivate));
    }

    function testMultipleMintersSetup() public {
        // Test that both DeFi contracts are minters
        assertTrue(token.isMinter(address(defiContract)), "Original DeFi contract should be a minter");
        assertTrue(token.isMinter(address(defiContractPrivate)), "Private DeFi contract should be a minter");
        
        // Test that random address is not a minter
        assertFalse(token.isMinter(user1), "Random address should not be a minter");
        
        console.log("Multiple minters setup test passed");
    }

    function testOriginalFlow() public {
        // Test the original flow with paymentHash and preimage
        
        // Create a mock signature (for testing purposes)
        bytes memory mockSignature = new bytes(64);
        
        // Record initial balances
        uint256 initialBalance = token.balanceOf(user1);
        uint256 initialTotalSupply = token.totalSupply();
        
        // Verify payment using original oracle
        bool success = oracle.verifyPaymentProof(
            TEST_PAYMENT_HASH,
            TEST_PREIMAGE,
            TEST_AMOUNT,
            TEST_PUBLIC_KEY_X,
            mockSignature
        );
        
        // Note: This will fail due to invalid signature, but we're testing the flow
        assertFalse(success, "Should fail with invalid signature");
        
        console.log("Original flow test completed (signature verification failed as expected)");
    }

    function testPrivateFlow() public {
        // Test the Schnorr-Private-2.0 flow
        
        // Create a mock signature (for testing purposes)
        bytes memory mockSignature = new bytes(64);
        
        // Record initial balances
        uint256 initialBalance = token.balanceOf(user2);
        uint256 initialTotalSupply = token.totalSupply();
        
        // Verify payment using private oracle
        bool success = oraclePrivate.verifyPaymentProof(
            TEST_MSG_HASH,
            TEST_PUBLIC_KEY_X,
            mockSignature,
            user2,
            TEST_AMOUNT
        );
        
        // Note: This will fail due to invalid signature, but we're testing the flow
        assertFalse(success, "Should fail with invalid signature");
        
        console.log("Private flow test completed (signature verification failed as expected)");
    }

    function testEmergencyVerification() public {
        // Test emergency verification for private oracle
        
        // Record initial balances
        uint256 initialBalance = token.balanceOf(user3);
        uint256 initialTotalSupply = token.totalSupply();
        
        // Use emergency verification (owner only)
        oraclePrivate.emergencyVerifyMessage(TEST_MSG_HASH, TEST_PUBLIC_KEY_X, user3, TEST_AMOUNT);
        
        // Check that the message is now verified
        assertTrue(oraclePrivate.isMessageVerified(TEST_MSG_HASH), "Message should be verified after emergency verification");
        
        // Check token balances (should be minted)
        uint256 finalBalance = token.balanceOf(user3);
        uint256 finalTotalSupply = token.totalSupply();
        
        // Note: The DeFi contract should have been called and tokens minted
        // This depends on the DeFi contract's reward rates
        console.log("Initial balance:", initialBalance);
        console.log("Final balance:", finalBalance);
        console.log("Initial total supply:", initialTotalSupply);
        console.log("Final total supply:", finalTotalSupply);
        
        console.log("Emergency verification test completed");
    }

    function testMinterManagement() public {
        // Test adding and removing minters
        
        // Add a new minter
        token.addMinter(user1);
        
        assertTrue(token.isMinter(user1), "User1 should be a minter");
        
        // Try to mint tokens as the new minter
        vm.prank(user1);
        token.mint(user2, 1000);
        
        assertEq(token.balanceOf(user2), 1000, "User2 should have 1000 tokens");
        
        // Remove the minter
        token.removeMinter(user1);
        
        assertFalse(token.isMinter(user1), "User1 should not be a minter anymore");
        
        // Try to mint tokens as removed minter (should fail)
        vm.prank(user1);
        vm.expectRevert("Only authorized minters can call this function");
        token.mint(user2, 1000);
        
        console.log("Minter management test passed");
    }

    function testTokenMinting() public {
        // Test direct token minting by authorized minters
        
        uint256 mintAmount = 5000000000000000000; // 5 BTC in wei
        
        // Mint tokens using original DeFi contract
        vm.prank(address(defiContract));
        token.mint(user1, mintAmount);
        
        assertEq(token.balanceOf(user1), mintAmount, "User1 should have minted tokens");
        assertEq(token.totalSupply(), mintAmount, "Total supply should be updated");
        
        // Mint tokens using private DeFi contract
        vm.prank(address(defiContractPrivate));
        token.mint(user2, mintAmount);
        
        assertEq(token.balanceOf(user2), mintAmount, "User2 should have minted tokens");
        assertEq(token.totalSupply(), mintAmount * 2, "Total supply should be doubled");
        
        console.log("Token minting test passed");
    }

    function testContractRelationships() public {
        // Test that all contract relationships are properly set
        
        // Oracle relationships
        assertEq(oracle.defiContract(), address(defiContract), "Oracle should point to DeFi contract");
        assertEq(oraclePrivate.defiContract(), address(defiContractPrivate), "Private oracle should point to private DeFi contract");
        
        // DeFi contract relationships
        assertEq(defiContract.oracleContract(), address(oracle), "DeFi contract should point to oracle");
        assertEq(defiContractPrivate.oracleContract(), address(oraclePrivate), "Private DeFi contract should point to private oracle");
        assertEq(defiContract.tokenContract(), address(token), "DeFi contract should point to token");
        assertEq(defiContractPrivate.cbtcTokenContract(), address(token), "Private DeFi contract should point to token");
        assertEq(defiContractPrivate.rewardTokenContract(), address(token), "Private DeFi contract should point to token");
        
        console.log("Contract relationships test passed");
    }

    function testDeFiContractStats() public {
        // Test DeFi contract statistics
        
        // Check initial stats
        (uint256 totalCBTC, uint256 totalRewards, uint256 totalProviders) = defiContractPrivate.getProtocolStats();
        assertEq(totalCBTC, 0, "Initial cBTC should be 0");
        assertEq(totalRewards, 0, "Initial rewards should be 0");
        assertEq(totalProviders, 0, "Initial providers should be 0");
        
        // Check reward rates
        assertTrue(defiContractPrivate.cbtcRewardRate() > 0, "cBTC reward rate should be set");
        assertTrue(defiContractPrivate.rewardTokenRate() > 0, "Reward token rate should be set");
        
        console.log("DeFi contract stats test passed");
    }

    function testCompleteFlow() public {
        // Test the complete flow end-to-end
        
        console.log("=== Testing Complete Flow ===");
        
        // 1. Setup verification
        testMultipleMintersSetup();
        
        // 2. Contract relationships
        testContractRelationships();
        
        // 3. Token minting capabilities
        testTokenMinting();
        
        // 4. Minter management
        testMinterManagement();
        
        // 5. DeFi contract stats
        testDeFiContractStats();
        
        // 6. Emergency verification (this will actually work)
        testEmergencyVerification();
        
        console.log("=== Complete Flow Test Passed ===");
    }
}

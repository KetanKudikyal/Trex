// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {TrexToken} from "../src/TrexToken.sol";
import {LightningOracle} from "../src/LightningOracle.sol";
import {DeFiContract} from "../src/DeFiContract.sol";

/**
 * @title TrexContractsTest
 * @dev Test suite for the Trex Lightning DeFi contracts
 */
contract TrexContractsTest is Test {
    TrexToken public token;
    LightningOracle public oracle;
    DeFiContract public defiContract;
    
    address public owner;
    address public user;

    function setUp() public {
        owner = address(this);
        user = makeAddr("user");
        
        // Deploy contracts
        token = new TrexToken();
        oracle = new LightningOracle(address(0));
        defiContract = new DeFiContract(address(oracle), address(token));
        
        // Set up contract relationships
        oracle.setDeFiContract(address(defiContract));
        token.setMinter(address(defiContract));
    }

    function testInitialState() public {
        assertEq(token.name(), "Trex Token");
        assertEq(token.symbol(), "TREX");
        assertEq(token.decimals(), 18);
        assertEq(token.totalSupply(), 0);
        assertEq(token.owner(), owner);
        assertEq(token.minter(), address(defiContract));
        
        assertEq(oracle.owner(), owner);
        assertEq(oracle.defiContract(), address(defiContract));
        
        assertEq(defiContract.owner(), owner);
        assertEq(defiContract.oracleContract(), address(oracle));
        assertEq(defiContract.tokenContract(), address(token));
    }

    function testTokenMinting() public {
        uint256 mintAmount = 1000e18;
        
        // Mint tokens through DeFi contract
        vm.prank(address(defiContract));
        token.mint(user, mintAmount);
        
        assertEq(token.balanceOf(user), mintAmount);
        assertEq(token.totalSupply(), mintAmount);
    }

    function testEmergencyPaymentVerification() public {
        bytes32 paymentHash = keccak256("test-payment");
        uint256 amount = 1000;
        
        // Emergency verify payment
        oracle.emergencyVerifyPayment(paymentHash, amount);
        
        assertTrue(oracle.isPaymentVerified(paymentHash));
        (uint256 verifiedAmount, uint256 timestamp, bool verified) = oracle.getPaymentDetails(paymentHash);
        assertEq(verifiedAmount, amount);
        assertTrue(verified);
        assertGt(timestamp, 0);
    }

    function testPaymentProcessing() public {
        bytes32 paymentHash = keccak256("test-payment-2");
        uint256 amount = 500;
        
        // Emergency verify payment (simulating successful Lightning payment)
        oracle.emergencyVerifyPayment(paymentHash, amount);
        
        // Check that DeFi contract was notified and tokens were minted
        assertEq(token.balanceOf(address(oracle)), amount);
        assertEq(defiContract.getBalance(address(oracle)), amount);
        assertTrue(defiContract.isPaymentProcessed(paymentHash));
    }

    function testTokenTransfer() public {
        uint256 mintAmount = 1000e18;
        address recipient = makeAddr("recipient");
        
        // Mint tokens to user
        vm.prank(address(defiContract));
        token.mint(user, mintAmount);
        
        // Transfer tokens
        vm.prank(user);
        token.transfer(recipient, 500e18);
        
        assertEq(token.balanceOf(user), 500e18);
        assertEq(token.balanceOf(recipient), 500e18);
    }

    function testTokenApproval() public {
        uint256 mintAmount = 1000e18;
        address spender = makeAddr("spender");
        uint256 approvalAmount = 500e18;
        
        // Mint tokens to user
        vm.prank(address(defiContract));
        token.mint(user, mintAmount);
        
        // Approve spender
        vm.prank(user);
        token.approve(spender, approvalAmount);
        
        assertEq(token.allowance(user, spender), approvalAmount);
        
        // Transfer from
        vm.prank(spender);
        token.transferFrom(user, spender, approvalAmount);
        
        assertEq(token.balanceOf(user), 500e18);
        assertEq(token.balanceOf(spender), 500e18);
        assertEq(token.allowance(user, spender), 0);
    }

    function testOnlyOwnerModifiers() public {
        address attacker = makeAddr("attacker");
        
        // Test oracle owner functions
        vm.prank(attacker);
        vm.expectRevert("Only owner can call this function");
        oracle.setDeFiContract(address(0));
        
        vm.prank(attacker);
        vm.expectRevert("Only owner can call this function");
        oracle.emergencyVerifyPayment(keccak256("test"), 100);
        
        // Test token owner functions
        vm.prank(attacker);
        vm.expectRevert("Only owner can call this function");
        token.setMinter(address(0));
        
        // Test DeFi contract owner functions
        vm.prank(attacker);
        vm.expectRevert("Only owner can call this function");
        defiContract.setOracleContract(address(0));
        
        vm.prank(attacker);
        vm.expectRevert("Only owner can call this function");
        defiContract.setTokenContract(address(0));
    }

    function testOnlyOracleModifier() public {
        address attacker = makeAddr("attacker");
        bytes32 paymentHash = keccak256("test-payment");
        
        vm.prank(attacker);
        vm.expectRevert("Only oracle can call this function");
        defiContract.onPaymentVerified(paymentHash, 100, keccak256("preimage"));
        
        vm.prank(attacker);
        vm.expectRevert("Only oracle can call this function");
        defiContract.unlockFunds(paymentHash, attacker, 100);
        
        vm.prank(attacker);
        vm.expectRevert("Only oracle can call this function");
        defiContract.createNFT(paymentHash, attacker, "metadata");
    }

    function testOnlyMinterModifier() public {
        address attacker = makeAddr("attacker");
        
        vm.prank(attacker);
        vm.expectRevert("Only minter can call this function");
        token.mint(attacker, 1000e18);
    }

    function testPaymentNotProcessedModifier() public {
        bytes32 paymentHash = keccak256("test-payment");
        uint256 amount = 100;
        
        // First verification should succeed
        oracle.emergencyVerifyPayment(paymentHash, amount);
        
        // Second verification should fail
        vm.expectRevert("Payment already verified");
        oracle.emergencyVerifyPayment(paymentHash, amount);
    }
}

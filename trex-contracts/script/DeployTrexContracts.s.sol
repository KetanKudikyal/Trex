// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {TrexToken} from "../src/TrexToken.sol";
import {LightningOracle} from "../src/LightningOracle.sol";
import {DeFiContract} from "../src/DeFiContract.sol";
import {LightningOraclePrivate} from "../src/LightningOraclePrivate.sol";
import {DeFiContractPrivate} from "../src/DeFiContractPrivate.sol";

/**
 * @title DeployTrexContracts
 * @dev Deployment script for the Trex Lightning DeFi contracts
 * @notice Deploys both original and Schnorr-Private-2.0 versions
 */
contract DeployTrexContracts is Script {
    function run() external {
        string memory privateKeyStr = vm.envString("PRIVATE_KEY");
        // Add 0x prefix if not present
        if (bytes(privateKeyStr).length > 0 && bytes(privateKeyStr)[0] != bytes1("0")) {
            privateKeyStr = string(abi.encodePacked("0x", privateKeyStr));
        }
        uint256 deployerPrivateKey = vm.parseUint(privateKeyStr);
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying contracts with the account:", deployer);
        console.log("Account balance:", deployer.balance);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy TrexToken first (shared by both versions)
        TrexToken token = new TrexToken();
        console.log("TrexToken deployed at:", address(token));

        console.log("\n=== Deploying Original Version ===");
        
        // Deploy LightningOracle (will set DeFi contract later)
        LightningOracle oracle = new LightningOracle(address(0));
        console.log("LightningOracle deployed at:", address(oracle));

        // Deploy DeFiContract with oracle and token addresses
        DeFiContract defiContract = new DeFiContract(address(oracle), address(token));
        console.log("DeFiContract deployed at:", address(defiContract));

        // Set the DeFi contract address in the oracle
        oracle.setDeFiContract(address(defiContract));
        console.log("Oracle DeFi contract address set to:", address(defiContract));

        console.log("\n=== Deploying Schnorr-Private-2.0 Version ===");
        
        // Deploy LightningOraclePrivate (will set DeFi contract later)
        LightningOraclePrivate oraclePrivate = new LightningOraclePrivate(address(0));
        console.log("LightningOraclePrivate deployed at:", address(oraclePrivate));

        // Deploy DeFiContractPrivate with oracle and token addresses
        DeFiContractPrivate defiContractPrivate = new DeFiContractPrivate(
            address(oraclePrivate), 
            address(token), // cBTC token (reusing TrexToken)
            address(token)  // reward token (reusing TrexToken for now)
        );
        console.log("DeFiContractPrivate deployed at:", address(defiContractPrivate));

        // Set the DeFi contract address in the private oracle
        oraclePrivate.setDeFiContract(address(defiContractPrivate));
        console.log("Private Oracle DeFi contract address set to:", address(defiContractPrivate));

        // Add both DeFi contracts as minters for the token contract
        // (This enables both contracts to mint cBTC and reward tokens)
        token.addMinter(address(defiContract));
        console.log("Added original DeFi contract as minter:", address(defiContract));
        
        token.addMinter(address(defiContractPrivate));
        console.log("Added private DeFi contract as minter:", address(defiContractPrivate));
        
        // Note: Both cBTC and reward tokens use the same TrexToken contract
        // Both DeFi contracts can now mint tokens independently

        vm.stopBroadcast();

        // Log deployment summary
        console.log("\n=== Deployment Summary ===");
        console.log("TrexToken (shared):", address(token));
        console.log("");
        console.log("Original Version:");
        console.log("  LightningOracle:", address(oracle));
        console.log("  DeFiContract:", address(defiContract));
        console.log("");
        console.log("Schnorr-Private-2.0 Version:");
        console.log("  LightningOraclePrivate:", address(oraclePrivate));
        console.log("  DeFiContractPrivate:", address(defiContractPrivate));
        console.log("");
        console.log("Deployer:", deployer);
        console.log("==========================");
    }
}

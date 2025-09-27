// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {TrexToken} from "../src/TrexToken.sol";
import {LightningOracle} from "../src/LightningOracle.sol";
import {DeFiContract} from "../src/DeFiContract.sol";

/**
 * @title DeployTrexContracts
 * @dev Deployment script for the Trex Lightning DeFi contracts
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

        // Deploy TrexToken first
        TrexToken token = new TrexToken();
        console.log("TrexToken deployed at:", address(token));

        // Deploy LightningOracle (will set DeFi contract later)
        LightningOracle oracle = new LightningOracle(address(0));
        console.log("LightningOracle deployed at:", address(oracle));

        // Deploy DeFiContract with oracle and token addresses
        DeFiContract defiContract = new DeFiContract(address(oracle), address(token));
        console.log("DeFiContract deployed at:", address(defiContract));

        // Set the DeFi contract address in the oracle
        oracle.setDeFiContract(address(defiContract));
        console.log("Oracle DeFi contract address set to:", address(defiContract));

        // Set the minter address in the token contract to the DeFi contract
        token.setMinter(address(defiContract));
        console.log("Token minter set to:", address(defiContract));

        vm.stopBroadcast();

        // Log deployment summary
        console.log("\n=== Deployment Summary ===");
        console.log("TrexToken:", address(token));
        console.log("LightningOracle:", address(oracle));
        console.log("DeFiContract:", address(defiContract));
        console.log("Deployer:", deployer);
        console.log("==========================");
    }
}

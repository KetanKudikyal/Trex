// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title LightningOracle
 * @dev Oracle contract for verifying Lightning Network payment proofs using Schnorr signatures
 * @notice This contract verifies Schnorr signatures on-chain using Citrea's precompile
 */
contract LightningOracle {
    // Events
    event PaymentVerified(
        bytes32 indexed paymentHash,
        address indexed verifier,
        uint256 amount,
        uint256 timestamp
    );
    
    event PaymentRejected(
        bytes32 indexed paymentHash,
        string reason
    );
    
    event DeFiActionTriggered(
        bytes32 indexed paymentHash,
        address indexed defiContract,
        bytes actionData
    );

    // State variables
    mapping(bytes32 => bool) public verifiedPayments;
    mapping(bytes32 => uint256) public paymentAmounts;
    mapping(bytes32 => uint256) public paymentTimestamps;
    
    address public owner;
    address public defiContract;
    uint256 public constant SIGNATURE_LENGTH = 64; // 32 bytes r + 32 bytes s
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyDefiContract() {
        require(msg.sender == defiContract, "Only DeFi contract can call this function");
        _;
    }

    constructor(address _defiContract) {
        owner = msg.sender;
        defiContract = _defiContract;
    }

    /**
     * @dev Verify a Lightning payment proof using Schnorr signature
     * @param paymentHash The payment hash from the Lightning invoice
     * @param preimage The payment preimage
     * @param amount The payment amount in satoshis
     * @param publicKeyX The public key X coordinate used to sign the payment proof
     * @param signature The Schnorr signature (64 bytes: 32 bytes r + 32 bytes s)
     * @return success True if the signature is valid and payment is verified
     */
    function verifyPaymentProof(
        bytes32 paymentHash,
        bytes32 preimage,
        uint256 amount,
        bytes32 publicKeyX,
        bytes calldata signature
    ) external returns (bool success) {
        // Check if payment is already verified
        require(!verifiedPayments[paymentHash], "Payment already verified");
        
        // Validate signature length
        require(signature.length == SIGNATURE_LENGTH, "Invalid signature length");
        
        // Create the message that was signed
        bytes32 message = keccak256(abi.encodePacked(
            "lightning_payment:",
            paymentHash,
            ":",
            preimage,
            ":",
            amount,
            ":",
            block.timestamp
        ));
        
        // Verify Schnorr signature using Citrea's precompile
        // This calls the secp256k1 precompile for Schnorr verification
        bool isValidSignature = verifySchnorrSignature(
            publicKeyX,
            message,
            signature
        );
        
        if (isValidSignature) {
            // Mark payment as verified
            verifiedPayments[paymentHash] = true;
            paymentAmounts[paymentHash] = amount;
            paymentTimestamps[paymentHash] = block.timestamp;
            
            emit PaymentVerified(paymentHash, msg.sender, amount, block.timestamp);
            
            // Notify DeFi contract
            _notifyDeFiContract(paymentHash, amount, preimage);
            
            return true;
        } else {
            emit PaymentRejected(paymentHash, "Invalid Schnorr signature");
            return false;
        }
    }

    /**
     * @dev Verify Schnorr signature using Citrea's Schnorr precompile
     * @param publicKeyX The public key X coordinate (32 bytes)
     * @param message The message hash
     * @param signature The Schnorr signature (64 bytes)
     * @return True if signature is valid
     */
    function verifySchnorrSignature(
        bytes32 publicKeyX,
        bytes32 message,
        bytes calldata signature
    ) internal view returns (bool) {
        // Citrea Schnorr precompile address
        address constant SCHNORR_VERIFY_PRECOMPILE = 0x0000000000000000000000000000000000000200;
        
        require(signature.length == 64, "Invalid signature length");
        
        // Concatenate inputs in correct order: pubKeyX | messageHash | signature
        bytes memory input = abi.encodePacked(
            publicKeyX,
            message,
            signature
        );
        
        (bool ok, bytes memory output) = SCHNORR_VERIFY_PRECOMPILE.staticcall(input);
        
        // 32-byte return, last byte == 0x01 means success
        return ok && output.length == 32 && output[31] == 0x01;
    }

    /**
     * @dev Notify DeFi contract of verified payment
     * @param paymentHash The verified payment hash
     * @param amount The payment amount
     * @param preimage The payment preimage
     */
    function _notifyDeFiContract(
        bytes32 paymentHash,
        uint256 amount,
        bytes32 preimage
    ) internal {
        if (defiContract != address(0)) {
            // Call the DeFi contract's onPaymentVerified function
            (bool success, bytes memory data) = defiContract.call(
                abi.encodeWithSignature(
                    "onPaymentVerified(bytes32,uint256,bytes32)",
                    paymentHash,
                    amount,
                    preimage
                )
            );
            
            if (success) {
                emit DeFiActionTriggered(paymentHash, defiContract, data);
            }
        }
    }

    /**
     * @dev Check if a payment has been verified
     * @param paymentHash The payment hash to check
     * @return True if payment is verified
     */
    function isPaymentVerified(bytes32 paymentHash) external view returns (bool) {
        return verifiedPayments[paymentHash];
    }

    /**
     * @dev Get payment details
     * @param paymentHash The payment hash
     * @return amount The payment amount
     * @return timestamp The verification timestamp
     * @return verified Whether the payment is verified
     */
    function getPaymentDetails(bytes32 paymentHash) external view returns (
        uint256 amount,
        uint256 timestamp,
        bool verified
    ) {
        return (
            paymentAmounts[paymentHash],
            paymentTimestamps[paymentHash],
            verifiedPayments[paymentHash]
        );
    }

    /**
     * @dev Update DeFi contract address (only owner)
     * @param _defiContract New DeFi contract address
     */
    function setDeFiContract(address _defiContract) external onlyOwner {
        require(_defiContract != address(0), "Invalid DeFi contract address");
        defiContract = _defiContract;
    }

    /**
     * @dev Emergency function to mark payment as verified (only owner)
     * @param paymentHash The payment hash to mark as verified
     * @param amount The payment amount
     */
    function emergencyVerifyPayment(
        bytes32 paymentHash,
        uint256 amount
    ) external onlyOwner {
        require(!verifiedPayments[paymentHash], "Payment already verified");
        
        verifiedPayments[paymentHash] = true;
        paymentAmounts[paymentHash] = amount;
        paymentTimestamps[paymentHash] = block.timestamp;
        
        emit PaymentVerified(paymentHash, msg.sender, amount, block.timestamp);
    }

    /**
     * @dev Withdraw contract balance (only owner)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
}

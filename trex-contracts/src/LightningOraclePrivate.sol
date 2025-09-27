// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title LightningOraclePrivate (Schnorr-Private-2.0)
 * @dev Oracle contract for verifying Lightning Network payment proofs using private Schnorr signatures
 * @notice This contract verifies Schnorr signatures without exposing preimage or paymentHash on-chain
 * 
 * Key Features:
 * - Accepts arbitrary msgHash (constructed off-chain from preimage + paymentHash)
 * - Only verifies Schnorr signature against msgHash
 * - Preserves invoice privacy by not exposing Lightning payment details
 * - Future: Will add off-chain trustless msgHash verification
 */
contract LightningOraclePrivate {
    // Events
    event PaymentVerified(
        bytes32 indexed msgHash,
        address indexed verifier,
        uint256 timestamp,
        bytes32 publicKeyX
    );
    
    event PaymentRejected(
        bytes32 indexed msgHash,
        string reason
    );
    
    event DeFiActionTriggered(
        bytes32 indexed msgHash,
        address indexed defiContract,
        bytes actionData
    );

    // State variables
    mapping(bytes32 => bool) public verifiedMessages;
    mapping(bytes32 => uint256) public messageTimestamps;
    mapping(bytes32 => address) public messageVerifiers;
    mapping(bytes32 => bytes32) public messagePublicKeys;
    
    address public owner;
    address public defiContract;
    uint256 public constant SIGNATURE_LENGTH = 64; // 32 bytes r + 32 bytes s
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor(address _defiContract) {
        owner = msg.sender;
        defiContract = _defiContract;
    }

    /**
     * @dev Verify a Lightning payment proof using private Schnorr signature approach
     * @param msgHash The message hash (constructed off-chain from preimage + paymentHash)
     * @param publicKeyX The public key X coordinate used to sign the payment proof
     * @param signature The Schnorr signature (64 bytes: 32 bytes r + 32 bytes s)
     * @return success True if the signature is valid and payment is verified
     * 
     * @notice In Schnorr-Private-2.0:
     * - msgHash is arbitrary and opaque to the contract
     * - msgHash = hash(preimage + paymentHash) computed off-chain
     * - No preimage or paymentHash is exposed on-chain
     * - Future: Will add off-chain trustless msgHash verification
     */
    function verifyPaymentProof(
        bytes32 msgHash,
        bytes32 publicKeyX,
        bytes calldata signature
    ) external returns (bool success) {
        // Check if message is already verified
        require(!verifiedMessages[msgHash], "Message already verified");
        
        // Validate signature length
        require(signature.length == SIGNATURE_LENGTH, "Invalid signature length");
        
        // Verify Schnorr signature using Citrea's precompile
        bool isValidSignature = verifySchnorrSignature(
            publicKeyX,
            msgHash,
            signature
        );
        
        if (isValidSignature) {
            // Mark message as verified
            verifiedMessages[msgHash] = true;
            messageTimestamps[msgHash] = block.timestamp;
            messageVerifiers[msgHash] = msg.sender;
            messagePublicKeys[msgHash] = publicKeyX;
            
            emit PaymentVerified(msgHash, msg.sender, block.timestamp, publicKeyX);
            
            // Notify DeFi contract
            _notifyDeFiContract(msgHash, msg.sender, publicKeyX);
            
            return true;
        } else {
            emit PaymentRejected(msgHash, "Invalid Schnorr signature");
            return false;
        }
    }

    /**
     * @dev Verify Schnorr signature using Citrea's Schnorr precompile
     * @param publicKeyX The public key X coordinate (32 bytes)
     * @param msgHash The message hash (arbitrary, constructed off-chain)
     * @param signature The Schnorr signature (64 bytes)
     * @return True if signature is valid
     */
    function verifySchnorrSignature(
        bytes32 publicKeyX,
        bytes32 msgHash,
        bytes calldata signature
    ) internal view returns (bool) {
        // Citrea Schnorr precompile address
        address SCHNORR_VERIFY_PRECOMPILE = 0x0000000000000000000000000000000000000200;
        
        require(signature.length == 64, "Invalid signature length");
        
        // Concatenate inputs in correct order: pubKeyX | messageHash | signature
        bytes memory input = abi.encodePacked(
            publicKeyX,
            msgHash,
            signature
        );
        
        (bool ok, bytes memory output) = SCHNORR_VERIFY_PRECOMPILE.staticcall(input);
        
        // 32-byte return, last byte == 0x01 means success
        return ok && output.length == 32 && output[31] == 0x01;
    }

    /**
     * @dev Notify DeFi contract of verified payment
     * @param msgHash The verified message hash
     * @param verifier The address that submitted the proof
     * @param publicKeyX The public key used for verification
     */
    function _notifyDeFiContract(
        bytes32 msgHash,
        address verifier,
        bytes32 publicKeyX
    ) internal {
        if (defiContract != address(0)) {
            // Call the DeFi contract's onPaymentVerified function
            (bool success, bytes memory data) = defiContract.call(
                abi.encodeWithSignature(
                    "onPaymentVerifiedPrivate(bytes32,address,bytes32)",
                    msgHash,
                    verifier,
                    publicKeyX
                )
            );
            
            if (success) {
                emit DeFiActionTriggered(msgHash, defiContract, data);
            }
        }
    }

    /**
     * @dev Check if a message has been verified
     * @param msgHash The message hash to check
     * @return True if message is verified
     */
    function isMessageVerified(bytes32 msgHash) external view returns (bool) {
        return verifiedMessages[msgHash];
    }

    /**
     * @dev Get message details
     * @param msgHash The message hash
     * @return verifier The address that verified the message
     * @return timestamp The verification timestamp
     * @return publicKeyX The public key used for verification
     * @return verified Whether the message is verified
     */
    function getMessageDetails(bytes32 msgHash) external view returns (
        address verifier,
        uint256 timestamp,
        bytes32 publicKeyX,
        bool verified
    ) {
        return (
            messageVerifiers[msgHash],
            messageTimestamps[msgHash],
            messagePublicKeys[msgHash],
            verifiedMessages[msgHash]
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
     * @dev Emergency function to mark message as verified (only owner)
     * @param msgHash The message hash to mark as verified
     * @param publicKeyX The public key to associate with the message
     */
    function emergencyVerifyMessage(
        bytes32 msgHash,
        bytes32 publicKeyX
    ) external onlyOwner {
        require(!verifiedMessages[msgHash], "Message already verified");
        
        verifiedMessages[msgHash] = true;
        messageTimestamps[msgHash] = block.timestamp;
        messageVerifiers[msgHash] = msg.sender;
        messagePublicKeys[msgHash] = publicKeyX;
        
        emit PaymentVerified(msgHash, msg.sender, block.timestamp, publicKeyX);
        
        // Notify DeFi contract
        _notifyDeFiContract(msgHash, msg.sender, publicKeyX);
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

    // TODO: Future enhancement - Add off-chain trustless msgHash verification
    // This will allow the contract to verify that msgHash corresponds to valid Lightning payment
    // without exposing preimage or paymentHash on-chain
}

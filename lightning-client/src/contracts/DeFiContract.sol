// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title DeFiContract
 * @dev DeFi contract that performs conditional actions based on Lightning Network payments
 * @notice This contract receives notifications from the LightningOracle and triggers actions
 */
contract DeFiContract {
    // Events
    event TokensReleased(
        bytes32 indexed paymentHash,
        address indexed recipient,
        uint256 amount,
        address tokenAddress
    );
    
    event FundsUnlocked(
        bytes32 indexed paymentHash,
        address indexed recipient,
        uint256 amount
    );
    
    event NFTCreated(
        bytes32 indexed paymentHash,
        address indexed recipient,
        uint256 tokenId,
        string metadata
    );
    
    event CustomActionExecuted(
        bytes32 indexed paymentHash,
        address indexed recipient,
        string actionType,
        bytes actionData
    );

    // State variables
    address public owner;
    address public oracleContract;
    address public tokenContract; // ERC20 token contract address
    
    mapping(bytes32 => bool) public processedPayments;
    mapping(address => uint256) public userBalances;
    mapping(address => uint256) public lockedFunds;
    
    uint256 public totalSupply;
    uint256 public nextTokenId = 1;
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyOracle() {
        require(msg.sender == oracleContract, "Only oracle can call this function");
        _;
    }
    
    modifier paymentNotProcessed(bytes32 paymentHash) {
        require(!processedPayments[paymentHash], "Payment already processed");
        _;
    }

    constructor(address _oracleContract, address _tokenContract) {
        owner = msg.sender;
        oracleContract = _oracleContract;
        tokenContract = _tokenContract;
    }

    /**
     * @dev Called by the LightningOracle when a payment is verified
     * @param paymentHash The verified payment hash
     * @param amount The payment amount in satoshis
     * @param preimage The payment preimage
     */
    function onPaymentVerified(
        bytes32 paymentHash,
        uint256 amount,
        bytes32 preimage
    ) external onlyOracle paymentNotProcessed(paymentHash) {
        // Mark payment as processed
        processedPayments[paymentHash] = true;
        
        // Convert satoshis to tokens (1 satoshi = 1 token for simplicity)
        uint256 tokenAmount = amount;
        
        // Release tokens to the sender
        _releaseTokens(msg.sender, tokenAmount);
        
        emit TokensReleased(paymentHash, msg.sender, tokenAmount, tokenContract);
    }

    /**
     * @dev Release tokens to a recipient
     * @param recipient The address to receive tokens
     * @param amount The amount of tokens to release
     */
    function _releaseTokens(address recipient, uint256 amount) internal {
        userBalances[recipient] += amount;
        totalSupply += amount;
        
        // In a real implementation, this would mint tokens from an ERC20 contract
        // IERC20(tokenContract).mint(recipient, amount);
    }

    /**
     * @dev Unlock funds for a user (alternative action)
     * @param paymentHash The payment hash
     * @param recipient The recipient address
     * @param amount The amount to unlock
     */
    function unlockFunds(
        bytes32 paymentHash,
        address recipient,
        uint256 amount
    ) external onlyOracle paymentNotProcessed(paymentHash) {
        require(lockedFunds[recipient] >= amount, "Insufficient locked funds");
        
        processedPayments[paymentHash] = true;
        lockedFunds[recipient] -= amount;
        userBalances[recipient] += amount;
        
        emit FundsUnlocked(paymentHash, recipient, amount);
    }

    /**
     * @dev Create an NFT for a user
     * @param paymentHash The payment hash
     * @param recipient The recipient address
     * @param metadata The NFT metadata
     */
    function createNFT(
        bytes32 paymentHash,
        address recipient,
        string memory metadata
    ) external onlyOracle paymentNotProcessed(paymentHash) {
        processedPayments[paymentHash] = true;
        
        uint256 tokenId = nextTokenId++;
        
        // In a real implementation, this would mint an NFT
        // IERC721(nftContract).mint(recipient, tokenId, metadata);
        
        emit NFTCreated(paymentHash, recipient, tokenId, metadata);
    }

    /**
     * @dev Execute a custom action
     * @param paymentHash The payment hash
     * @param recipient The recipient address
     * @param actionType The type of action to execute
     * @param actionData Additional data for the action
     */
    function executeCustomAction(
        bytes32 paymentHash,
        address recipient,
        string memory actionType,
        bytes memory actionData
    ) external onlyOracle paymentNotProcessed(paymentHash) {
        processedPayments[paymentHash] = true;
        
        // Execute custom logic based on actionType
        if (keccak256(bytes(actionType)) == keccak256(bytes("stake"))) {
            _executeStakeAction(recipient, actionData);
        } else if (keccak256(bytes(actionType)) == keccak256(bytes("vote"))) {
            _executeVoteAction(recipient, actionData);
        } else {
            // Generic custom action
            _executeGenericAction(recipient, actionData);
        }
        
        emit CustomActionExecuted(paymentHash, recipient, actionType, actionData);
    }

    /**
     * @dev Execute stake action
     * @param recipient The recipient address
     * @param actionData The action data
     */
    function _executeStakeAction(address recipient, bytes memory actionData) internal {
        // Decode staking parameters from actionData
        (uint256 amount, uint256 duration) = abi.decode(actionData, (uint256, uint256));
        
        // Implement staking logic
        require(userBalances[recipient] >= amount, "Insufficient balance for staking");
        userBalances[recipient] -= amount;
        lockedFunds[recipient] += amount;
    }

    /**
     * @dev Execute vote action
     * @param recipient The recipient address
     * @param actionData The action data
     */
    function _executeVoteAction(address recipient, bytes memory actionData) internal {
        // Decode voting parameters from actionData
        (uint256 proposalId, bool support) = abi.decode(actionData, (uint256, bool));
        
        // Implement voting logic
        // This would interact with a governance contract
    }

    /**
     * @dev Execute generic custom action
     * @param recipient The recipient address
     * @param actionData The action data
     */
    function _executeGenericAction(address recipient, bytes memory actionData) internal {
        // Implement generic custom action logic
        // This could be anything based on the specific DeFi application
    }

    /**
     * @dev Get user balance
     * @param user The user address
     * @return The user's token balance
     */
    function getBalance(address user) external view returns (uint256) {
        return userBalances[user];
    }

    /**
     * @dev Get locked funds for a user
     * @param user The user address
     * @return The user's locked funds
     */
    function getLockedFunds(address user) external view returns (uint256) {
        return lockedFunds[user];
    }

    /**
     * @dev Check if a payment has been processed
     * @param paymentHash The payment hash
     * @return True if payment has been processed
     */
    function isPaymentProcessed(bytes32 paymentHash) external view returns (bool) {
        return processedPayments[paymentHash];
    }

    /**
     * @dev Update oracle contract address (only owner)
     * @param _oracleContract New oracle contract address
     */
    function setOracleContract(address _oracleContract) external onlyOwner {
        require(_oracleContract != address(0), "Invalid oracle contract address");
        oracleContract = _oracleContract;
    }

    /**
     * @dev Update token contract address (only owner)
     * @param _tokenContract New token contract address
     */
    function setTokenContract(address _tokenContract) external onlyOwner {
        tokenContract = _tokenContract;
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

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title DeFiContractPrivate (Schnorr-Private-2.0)
 * @dev DeFi contract that performs conditional actions based on private Lightning Network payment proofs
 * @notice This contract receives notifications from LightningOraclePrivate and triggers actions
 * 
 * Key Features:
 * - Works with arbitrary msgHash (no access to preimage/paymentHash)
 * - Allocates cBTC and reward tokens to liquidity providers
 * - Incentivizes users for providing Lightning liquidity to Citrea nodes
 * - Maintains privacy of Lightning invoice details
 */
contract DeFiContractPrivate {
    // Events
    event CBTCAllocated(
        bytes32 indexed msgHash,
        address indexed recipient,
        uint256 cbtcAmount,
        uint256 timestamp
    );
    
    event RewardTokensAllocated(
        bytes32 indexed msgHash,
        address indexed recipient,
        uint256 rewardAmount,
        uint256 timestamp
    );
    
    event LiquidityIncentivePaid(
        bytes32 indexed msgHash,
        address indexed liquidityProvider,
        uint256 cbtcAmount,
        uint256 rewardAmount,
        bytes32 publicKeyX
    );
    
    event CustomActionExecuted(
        bytes32 indexed msgHash,
        address indexed recipient,
        string actionType,
        bytes actionData
    );

    // State variables
    address public owner;
    address public oracleContract;
    address public cbtcTokenContract; // cBTC token contract address
    address public rewardTokenContract; // Reward token contract address
    
    mapping(bytes32 => bool) public processedMessages;
    mapping(address => uint256) public userCBTCBalances;
    mapping(address => uint256) public userRewardBalances;
    mapping(address => uint256) public totalLiquidityProvided;
    
    // Incentive parameters
    uint256 public cbtcRewardRate = 1e18; // 1 cBTC per payment (adjustable)
    uint256 public rewardTokenRate = 100e18; // 100 reward tokens per payment (adjustable)
    uint256 public liquidityBonusMultiplier = 150; // 150% = 1.5x bonus for high liquidity providers
    
    uint256 public totalCBTCAllocated;
    uint256 public totalRewardTokensAllocated;
    uint256 public totalLiquidityProvidersRewarded;
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyOracle() {
        require(msg.sender == oracleContract, "Only oracle can call this function");
        _;
    }
    
    modifier messageNotProcessed(bytes32 msgHash) {
        require(!processedMessages[msgHash], "Message already processed");
        _;
    }

    constructor(
        address _oracleContract, 
        address _cbtcTokenContract,
        address _rewardTokenContract
    ) {
        owner = msg.sender;
        oracleContract = _oracleContract;
        cbtcTokenContract = _cbtcTokenContract;
        rewardTokenContract = _rewardTokenContract;
    }

    /**
     * @dev Called by the LightningOraclePrivate when a payment is verified
     * @param msgHash The verified message hash (arbitrary, privacy-preserving)
     * @param verifier The address that submitted the proof (liquidity provider)
     * @param publicKeyX The public key X coordinate used for verification
     */
    function onPaymentVerifiedPrivate(
        bytes32 msgHash,
        address verifier,
        bytes32 publicKeyX
    ) external onlyOracle messageNotProcessed(msgHash) {
        // Mark message as processed
        processedMessages[msgHash] = true;
        
        // Calculate rewards for liquidity provider
        uint256 cbtcAmount = cbtcRewardRate;
        uint256 rewardAmount = rewardTokenRate;
        
        // Apply bonus for high liquidity providers (future enhancement)
        if (totalLiquidityProvided[verifier] > 10e18) { // 10 BTC threshold
            cbtcAmount = (cbtcAmount * liquidityBonusMultiplier) / 100;
            rewardAmount = (rewardAmount * liquidityBonusMultiplier) / 100;
        }
        
        // Allocate cBTC and reward tokens
        _allocateCBTC(verifier, cbtcAmount);
        _allocateRewardTokens(verifier, rewardAmount);
        
        // Update liquidity tracking
        totalLiquidityProvided[verifier] += cbtcAmount;
        totalLiquidityProvidersRewarded++;
        
        emit LiquidityIncentivePaid(
            msgHash, 
            verifier, 
            cbtcAmount, 
            rewardAmount, 
            publicKeyX
        );
    }

    /**
     * @dev Allocate cBTC tokens to a liquidity provider
     * @param recipient The address to receive cBTC
     * @param amount The amount of cBTC to allocate
     */
    function _allocateCBTC(address recipient, uint256 amount) internal {
        userCBTCBalances[recipient] += amount;
        totalCBTCAllocated += amount;
        
        // Mint cBTC tokens
        if (cbtcTokenContract != address(0)) {
            (bool success, ) = cbtcTokenContract.call(
                abi.encodeWithSignature("mint(address,uint256)", recipient, amount)
            );
            require(success, "cBTC minting failed");
        }
        
        emit CBTCAllocated(
            keccak256(abi.encodePacked(recipient, block.timestamp)), 
            recipient, 
            amount, 
            block.timestamp
        );
    }

    /**
     * @dev Allocate reward tokens to a liquidity provider
     * @param recipient The address to receive reward tokens
     * @param amount The amount of reward tokens to allocate
     */
    function _allocateRewardTokens(address recipient, uint256 amount) internal {
        userRewardBalances[recipient] += amount;
        totalRewardTokensAllocated += amount;
        
        // Mint reward tokens
        if (rewardTokenContract != address(0)) {
            (bool success, ) = rewardTokenContract.call(
                abi.encodeWithSignature("mint(address,uint256)", recipient, amount)
            );
            require(success, "Reward token minting failed");
        }
        
        emit RewardTokensAllocated(
            keccak256(abi.encodePacked(recipient, block.timestamp)), 
            recipient, 
            amount, 
            block.timestamp
        );
    }

    /**
     * @dev Execute a custom action for advanced DeFi functionality
     * @param msgHash The message hash
     * @param recipient The recipient address
     * @param actionType The type of action to execute
     * @param actionData Additional data for the action
     */
    function executeCustomAction(
        bytes32 msgHash,
        address recipient,
        string memory actionType,
        bytes memory actionData
    ) external onlyOracle messageNotProcessed(msgHash) {
        processedMessages[msgHash] = true;
        
        // Execute custom logic based on actionType
        if (keccak256(bytes(actionType)) == keccak256(bytes("liquidity_boost"))) {
            _executeLiquidityBoost(recipient, actionData);
        } else if (keccak256(bytes(actionType)) == keccak256(bytes("node_reward"))) {
            _executeNodeReward(recipient, actionData);
        } else {
            // Generic custom action
            _executeGenericAction(recipient, actionData);
        }
        
        emit CustomActionExecuted(msgHash, recipient, actionType, actionData);
    }

    /**
     * @dev Execute liquidity boost action
     * @param recipient The recipient address
     * @param actionData The action data
     */
    function _executeLiquidityBoost(address recipient, bytes memory actionData) internal {
        // Decode boost parameters from actionData
        (uint256 boostAmount, uint256 duration) = abi.decode(actionData, (uint256, uint256));
        
        // Apply temporary liquidity boost
        uint256 bonusCBTC = (boostAmount * 120) / 100; // 20% bonus
        _allocateCBTC(recipient, bonusCBTC);
    }

    /**
     * @dev Execute node reward action for Citrea node operators
     * @param recipient The recipient address (node operator)
     * @param actionData The action data
     */
    function _executeNodeReward(address recipient, bytes memory actionData) internal {
        // Decode node reward parameters from actionData
        (uint256 liquidityProvided, uint256 routingFees) = abi.decode(actionData, (uint256, uint256));
        
        // Calculate node operator rewards
        uint256 nodeReward = (liquidityProvided * 5) / 100; // 5% of liquidity as node reward
        uint256 feeShare = (routingFees * 50) / 100; // 50% of routing fees
        
        _allocateRewardTokens(recipient, nodeReward + feeShare);
    }

    /**
     * @dev Execute generic custom action
     * @param recipient The recipient address
     * @param actionData The action data
     */
    function _executeGenericAction(address recipient, bytes memory actionData) internal {
        // Implement generic custom action logic
        // This could be anything based on the specific DeFi application
        _allocateRewardTokens(recipient, rewardTokenRate);
    }

    // View functions
    
    /**
     * @dev Get user's cBTC balance
     * @param user The user address
     * @return The user's cBTC balance
     */
    function getCBTCBalance(address user) external view returns (uint256) {
        return userCBTCBalances[user];
    }

    /**
     * @dev Get user's reward token balance
     * @param user The user address
     * @return The user's reward token balance
     */
    function getRewardBalance(address user) external view returns (uint256) {
        return userRewardBalances[user];
    }

    /**
     * @dev Get total liquidity provided by a user
     * @param user The user address
     * @return The total liquidity provided by the user
     */
    function getTotalLiquidityProvided(address user) external view returns (uint256) {
        return totalLiquidityProvided[user];
    }

    /**
     * @dev Check if a message has been processed
     * @param msgHash The message hash
     * @return True if message has been processed
     */
    function isMessageProcessed(bytes32 msgHash) external view returns (bool) {
        return processedMessages[msgHash];
    }

    /**
     * @dev Get protocol statistics
     * @return totalCBTC Total cBTC allocated
     * @return totalRewards Total reward tokens allocated
     * @return totalProviders Total liquidity providers rewarded
     */
    function getProtocolStats() external view returns (
        uint256 totalCBTC,
        uint256 totalRewards,
        uint256 totalProviders
    ) {
        return (
            totalCBTCAllocated,
            totalRewardTokensAllocated,
            totalLiquidityProvidersRewarded
        );
    }

    // Admin functions
    
    /**
     * @dev Update oracle contract address (only owner)
     * @param _oracleContract New oracle contract address
     */
    function setOracleContract(address _oracleContract) external onlyOwner {
        require(_oracleContract != address(0), "Invalid oracle contract address");
        oracleContract = _oracleContract;
    }

    /**
     * @dev Update cBTC token contract address (only owner)
     * @param _cbtcTokenContract New cBTC token contract address
     */
    function setCBTCTokenContract(address _cbtcTokenContract) external onlyOwner {
        cbtcTokenContract = _cbtcTokenContract;
    }

    /**
     * @dev Update reward token contract address (only owner)
     * @param _rewardTokenContract New reward token contract address
     */
    function setRewardTokenContract(address _rewardTokenContract) external onlyOwner {
        rewardTokenContract = _rewardTokenContract;
    }

    /**
     * @dev Update reward rates (only owner)
     * @param _cbtcRewardRate New cBTC reward rate
     * @param _rewardTokenRate New reward token rate
     */
    function setRewardRates(
        uint256 _cbtcRewardRate,
        uint256 _rewardTokenRate
    ) external onlyOwner {
        cbtcRewardRate = _cbtcRewardRate;
        rewardTokenRate = _rewardTokenRate;
    }

    /**
     * @dev Update liquidity bonus multiplier (only owner)
     * @param _multiplier New bonus multiplier (100 = 1x, 150 = 1.5x, etc.)
     */
    function setLiquidityBonusMultiplier(uint256 _multiplier) external onlyOwner {
        require(_multiplier >= 100, "Multiplier must be at least 100 (1x)");
        liquidityBonusMultiplier = _multiplier;
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

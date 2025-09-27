// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title TrexToken
 * @dev Simple ERC20 token for the Trex Lightning DeFi system
 */
contract TrexToken {
    string public name = "Trex Token";
    string public symbol = "TREX";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    address public owner;
    mapping(address => bool) public minters; // Multiple DeFi contracts that can mint tokens

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Mint(address indexed to, uint256 value);
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyMinter() {
        require(minters[msg.sender], "Only authorized minters can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
        totalSupply = 0;
    }

    /**
     * @dev Add a minter address (DeFi contract)
     * @param _minter Address of the contract that can mint tokens
     */
    function addMinter(address _minter) external onlyOwner {
        require(_minter != address(0), "Invalid minter address");
        require(!minters[_minter], "Address is already a minter");
        minters[_minter] = true;
        emit MinterAdded(_minter);
    }

    /**
     * @dev Remove a minter address (DeFi contract)
     * @param _minter Address of the contract to remove from minters
     */
    function removeMinter(address _minter) external onlyOwner {
        require(minters[_minter], "Address is not a minter");
        minters[_minter] = false;
        emit MinterRemoved(_minter);
    }

    /**
     * @dev Check if an address is a minter
     * @param _minter Address to check
     * @return True if the address is a minter
     */
    function isMinter(address _minter) external view returns (bool) {
        return minters[_minter];
    }

    /**
     * @dev Mint tokens to a specific address
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyMinter {
        require(to != address(0), "Cannot mint to zero address");
        
        balanceOf[to] += amount;
        totalSupply += amount;
        
        emit Transfer(address(0), to, amount);
        emit Mint(to, amount);
    }

    /**
     * @dev Transfer tokens
     * @param to Address to transfer to
     * @param amount Amount to transfer
     */
    function transfer(address to, uint256 amount) external returns (bool) {
        require(to != address(0), "Cannot transfer to zero address");
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    /**
     * @dev Transfer tokens from one address to another
     * @param from Address to transfer from
     * @param to Address to transfer to
     * @param amount Amount to transfer
     */
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(to != address(0), "Cannot transfer to zero address");
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(allowance[from][msg.sender] >= amount, "Insufficient allowance");
        
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        allowance[from][msg.sender] -= amount;
        
        emit Transfer(from, to, amount);
        return true;
    }

    /**
     * @dev Approve spender to spend tokens
     * @param spender Address to approve
     * @param amount Amount to approve
     */
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
}

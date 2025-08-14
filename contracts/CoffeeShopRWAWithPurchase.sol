// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CoffeeShopRWAWithPurchase
 * @dev Simplified Coffee Shop RWA with direct purchase functionality
 */
contract CoffeeShopRWAWithPurchase is ERC20, Ownable {
    
    // Asset information
    struct AssetInfo {
        string shopName;
        string location;
        string description;
        uint256 totalValuation;      // Total shop valuation in wei
        uint256 tokenizedPercentage; // Percentage of shop tokenized (basis points, 10000 = 100%)
        bool isVerified;             // Whether asset is verified by oracle/auditor
    }
    
    // State variables
    AssetInfo public assetInfo;
    uint256 public maxTotalSupply;
    uint256 public tokenPrice;  // Price per token in wei
    
    // Events
    event AssetTokenized(
        string shopName,
        string location,
        uint256 totalValuation,
        uint256 tokenizedPercentage,
        uint256 tokensIssued
    );
    
    event TokensPurchased(
        address indexed buyer,
        uint256 amount,
        uint256 totalCost
    );
    
    event PriceUpdated(
        uint256 oldPrice,
        uint256 newPrice
    );
    
    constructor(
        string memory _shopName,
        string memory _location,
        string memory _description,
        uint256 _totalValuation,
        uint256 _tokenizedPercentage,
        uint256 _initialTokenSupply,
        uint256 _tokenPrice
    ) ERC20("Coffee Shop Token", "COFFEE") Ownable(msg.sender) {
        require(_tokenizedPercentage <= 10000, "Cannot tokenize more than 100%");
        require(_totalValuation > 0, "Valuation must be positive");
        require(_initialTokenSupply > 0, "Initial supply must be positive");
        require(_tokenPrice > 0, "Token price must be positive");
        
        assetInfo = AssetInfo({
            shopName: _shopName,
            location: _location,
            description: _description,
            totalValuation: _totalValuation,
            tokenizedPercentage: _tokenizedPercentage,
            isVerified: false
        });
        
        maxTotalSupply = _initialTokenSupply * 2; // Allow up to 2x initial supply
        tokenPrice = _tokenPrice;
        
        _mint(msg.sender, _initialTokenSupply);
        
        emit AssetTokenized(_shopName, _location, _totalValuation, _tokenizedPercentage, _initialTokenSupply);
    }
    
    /**
     * @dev Purchase tokens by sending ETH
     */
    function buyTokens(uint256 _tokenAmount) external payable {
        require(_tokenAmount > 0, "Token amount must be positive");
        require(totalSupply() + _tokenAmount <= maxTotalSupply, "Exceeds maximum total supply");
        
        uint256 totalCost = _tokenAmount * tokenPrice;
        require(msg.value >= totalCost, "Insufficient ETH sent");
        
        // Mint tokens to buyer
        _mint(msg.sender, _tokenAmount);
        
        // Refund excess ETH
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }
        
        emit TokensPurchased(msg.sender, _tokenAmount, totalCost);
    }
    
    /**
     * @dev Update token price (owner only)
     */
    function updateTokenPrice(uint256 _newPrice) external onlyOwner {
        require(_newPrice > 0, "Price must be positive");
        uint256 oldPrice = tokenPrice;
        tokenPrice = _newPrice;
        emit PriceUpdated(oldPrice, _newPrice);
    }
    
    /**
     * @dev Withdraw contract ETH balance (owner only)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Get asset information
     */
    function getAssetInfo() external view returns (
        string memory shopName,
        string memory location,
        string memory description,
        uint256 totalValuation,
        uint256 tokenizedPercentage,
        bool isVerified
    ) {
        return (
            assetInfo.shopName,
            assetInfo.location,
            assetInfo.description,
            assetInfo.totalValuation,
            assetInfo.tokenizedPercentage,
            assetInfo.isVerified
        );
    }
    
    /**
     * @dev Get token value based on latest valuation
     */
    function getTokenValue() external view returns (uint256) {
        if (totalSupply() == 0) return 0;
        uint256 tokenizedValue = (assetInfo.totalValuation * assetInfo.tokenizedPercentage) / 10000;
        return tokenizedValue / totalSupply();
    }
    
    /**
     * @dev Issue additional tokens (for expansion, up to maxTotalSupply)
     */
    function issueTokens(address _to, uint256 _amount) external onlyOwner {
        require(totalSupply() + _amount <= maxTotalSupply, "Exceeds maximum total supply");
        _mint(_to, _amount);
    }
}
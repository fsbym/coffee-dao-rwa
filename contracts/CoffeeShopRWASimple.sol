// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CoffeeShopRWASimple
 * @dev Simplified version of Coffee Shop RWA tokenization
 */
contract CoffeeShopRWASimple is ERC20, Ownable {
    
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
    
    // Events
    event AssetTokenized(
        string shopName,
        string location,
        uint256 totalValuation,
        uint256 tokenizedPercentage,
        uint256 tokensIssued
    );
    
    constructor(
        string memory _shopName,
        string memory _location,
        string memory _description,
        uint256 _totalValuation,
        uint256 _tokenizedPercentage,
        uint256 _initialTokenSupply
    ) ERC20("Coffee Shop Token", "COFFEE") Ownable(msg.sender) {
        require(_tokenizedPercentage <= 10000, "Cannot tokenize more than 100%");
        require(_totalValuation > 0, "Valuation must be positive");
        require(_initialTokenSupply > 0, "Initial supply must be positive");
        
        assetInfo = AssetInfo({
            shopName: _shopName,
            location: _location,
            description: _description,
            totalValuation: _totalValuation,
            tokenizedPercentage: _tokenizedPercentage,
            isVerified: false
        });
        
        maxTotalSupply = _initialTokenSupply * 2; // Allow up to 2x initial supply
        _mint(msg.sender, _initialTokenSupply);
        
        emit AssetTokenized(_shopName, _location, _totalValuation, _tokenizedPercentage, _initialTokenSupply);
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
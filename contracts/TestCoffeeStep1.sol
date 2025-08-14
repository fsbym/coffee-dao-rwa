// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestCoffeeStep1 is ERC20, Ownable {
    struct AssetInfo {
        string shopName;
        string location;
        string description;
        uint256 totalValuation;
        uint256 tokenizedPercentage;
        string legalDocumentHash;
        bool isVerified;
    }
    
    AssetInfo public assetInfo;
    
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
            legalDocumentHash: "",
            isVerified: false
        });
        
        _mint(msg.sender, _initialTokenSupply);
    }
}
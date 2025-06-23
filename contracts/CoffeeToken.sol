// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CoffeeToken is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    // Token price (in wei)
    uint256 public tokenPrice = 0.01 ether;
    
    // Maximum supply
    uint256 public maxSupply = 1000;
    
    // Token metadata structure
    struct TokenMetadata {
        string name;
        string description;
        string image;
        uint256 price;
        bool isForSale;
        address owner;
        uint256 createdAt;
    }
    
    // Mapping from token ID to metadata
    mapping(uint256 => TokenMetadata) public tokenMetadata;
    
    // Events
    event TokenMinted(uint256 indexed tokenId, address indexed owner, string tokenURI);
    event TokenListed(uint256 indexed tokenId, uint256 price);
    event TokenSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event PriceUpdated(uint256 indexed tokenId, uint256 newPrice);
    
    constructor() ERC721("Coffee DAO Token", "COFFEE") Ownable(msg.sender) {}
    
    /**
     * @dev Mint a new token
     * @param recipient Recipient address
     * @param tokenURI Token URI
     * @param name Token name
     * @param description Token description
     * @param image Token image URL
     */
    function mint(
        address recipient,
        string memory tokenURI,
        string memory name,
        string memory description,
        string memory image
    ) public payable returns (uint256) {
        require(msg.value >= tokenPrice, "Insufficient payment");
        require(_tokenIds.current() < maxSupply, "Max supply reached");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _mint(recipient, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        // Set token metadata
        tokenMetadata[newTokenId] = TokenMetadata({
            name: name,
            description: description,
            image: image,
            price: 0,
            isForSale: false,
            owner: recipient,
            createdAt: block.timestamp
        });
        
        emit TokenMinted(newTokenId, recipient, tokenURI);
        return newTokenId;
    }
    
    /**
     * @dev List token for sale
     * @param tokenId Token ID
     * @param price Sale price
     */
    function listToken(uint256 tokenId, uint256 price) public {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        require(price > 0, "Price must be greater than 0");
        
        tokenMetadata[tokenId].price = price;
        tokenMetadata[tokenId].isForSale = true;
        
        emit TokenListed(tokenId, price);
    }
    
    /**
     * @dev Buy token
     * @param tokenId Token ID
     */
    function buyToken(uint256 tokenId) public payable {
        require(_exists(tokenId), "Token does not exist");
        require(tokenMetadata[tokenId].isForSale, "Token not for sale");
        require(msg.value >= tokenMetadata[tokenId].price, "Insufficient payment");
        require(ownerOf(tokenId) != msg.sender, "Cannot buy your own token");
        
        address seller = ownerOf(tokenId);
        uint256 price = tokenMetadata[tokenId].price;
        
        // Transfer token
        _transfer(seller, msg.sender, tokenId);
        
        // Update metadata
        tokenMetadata[tokenId].owner = msg.sender;
        tokenMetadata[tokenId].isForSale = false;
        tokenMetadata[tokenId].price = 0;
        
        // Transfer funds
        payable(seller).transfer(price);
        
        // Refund excess funds to buyer
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }
        
        emit TokenSold(tokenId, seller, msg.sender, price);
    }
    
    /**
     * @dev Cancel token sale
     * @param tokenId Token ID
     */
    function cancelSale(uint256 tokenId) public {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        require(tokenMetadata[tokenId].isForSale, "Token not for sale");
        
        tokenMetadata[tokenId].isForSale = false;
        tokenMetadata[tokenId].price = 0;
    }
    
    /**
     * @dev Update token price
     * @param tokenId Token ID
     * @param newPrice New price
     */
    function updatePrice(uint256 tokenId, uint256 newPrice) public {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        require(tokenMetadata[tokenId].isForSale, "Token not for sale");
        require(newPrice > 0, "Price must be greater than 0");
        
        tokenMetadata[tokenId].price = newPrice;
        emit PriceUpdated(tokenId, newPrice);
    }
    
    /**
     * @dev Get token metadata
     * @param tokenId Token ID
     */
    function getTokenMetadata(uint256 tokenId) public view returns (TokenMetadata memory) {
        require(_exists(tokenId), "Token does not exist");
        return tokenMetadata[tokenId];
    }
    
    /**
     * @dev Get all tokens for sale
     */
    function getTokensForSale() public view returns (uint256[] memory) {
        uint256[] memory forSale = new uint256[](_tokenIds.current());
        uint256 count = 0;
        
        for (uint256 i = 1; i <= _tokenIds.current(); i++) {
            if (tokenMetadata[i].isForSale) {
                forSale[count] = i;
                count++;
            }
        }
        
        // Resize array
        assembly {
            mstore(forSale, count)
        }
        
        return forSale;
    }
    
    /**
     * @dev Get tokens owned by user
     * @param owner User address
     */
    function getTokensByOwner(address owner) public view returns (uint256[] memory) {
        uint256[] memory owned = new uint256[](_tokenIds.current());
        uint256 count = 0;
        
        for (uint256 i = 1; i <= _tokenIds.current(); i++) {
            if (ownerOf(i) == owner) {
                owned[count] = i;
                count++;
            }
        }
        
        // Resize array
        assembly {
            mstore(owned, count)
        }
        
        return owned;
    }
    
    /**
     * @dev Set token price (only owner)
     * @param newPrice New price
     */
    function setTokenPrice(uint256 newPrice) public onlyOwner {
        tokenPrice = newPrice;
    }
    
    /**
     * @dev Withdraw contract balance (only owner)
     */
    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    // Override required functions
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
} 
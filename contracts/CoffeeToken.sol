// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CoffeeToken is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    // 代币价格（以wei为单位）
    uint256 public tokenPrice = 0.01 ether;
    
    // 最大供应量
    uint256 public maxSupply = 1000;
    
    // 代币元数据结构
    struct TokenMetadata {
        string name;
        string description;
        string image;
        uint256 price;
        bool isForSale;
        address owner;
        uint256 createdAt;
    }
    
    // 代币ID到元数据的映射
    mapping(uint256 => TokenMetadata) public tokenMetadata;
    
    // 事件
    event TokenMinted(uint256 indexed tokenId, address indexed owner, string tokenURI);
    event TokenListed(uint256 indexed tokenId, uint256 price);
    event TokenSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event PriceUpdated(uint256 indexed tokenId, uint256 newPrice);
    
    constructor() ERC721("Coffee DAO Token", "COFFEE") Ownable(msg.sender) {}
    
    /**
     * @dev 铸造新代币
     * @param recipient 接收者地址
     * @param tokenURI 代币URI
     * @param name 代币名称
     * @param description 代币描述
     * @param image 代币图片URL
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
        
        // 设置代币元数据
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
     * @dev 列出代币出售
     * @param tokenId 代币ID
     * @param price 出售价格
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
     * @dev 购买代币
     * @param tokenId 代币ID
     */
    function buyToken(uint256 tokenId) public payable {
        require(_exists(tokenId), "Token does not exist");
        require(tokenMetadata[tokenId].isForSale, "Token not for sale");
        require(msg.value >= tokenMetadata[tokenId].price, "Insufficient payment");
        require(ownerOf(tokenId) != msg.sender, "Cannot buy your own token");
        
        address seller = ownerOf(tokenId);
        uint256 price = tokenMetadata[tokenId].price;
        
        // 转移代币
        _transfer(seller, msg.sender, tokenId);
        
        // 更新元数据
        tokenMetadata[tokenId].owner = msg.sender;
        tokenMetadata[tokenId].isForSale = false;
        tokenMetadata[tokenId].price = 0;
        
        // 转移资金
        payable(seller).transfer(price);
        
        // 如果有剩余资金，退还给买家
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }
        
        emit TokenSold(tokenId, seller, msg.sender, price);
    }
    
    /**
     * @dev 取消代币出售
     * @param tokenId 代币ID
     */
    function cancelSale(uint256 tokenId) public {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        require(tokenMetadata[tokenId].isForSale, "Token not for sale");
        
        tokenMetadata[tokenId].isForSale = false;
        tokenMetadata[tokenId].price = 0;
    }
    
    /**
     * @dev 更新代币价格
     * @param tokenId 代币ID
     * @param newPrice 新价格
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
     * @dev 获取代币元数据
     * @param tokenId 代币ID
     */
    function getTokenMetadata(uint256 tokenId) public view returns (TokenMetadata memory) {
        require(_exists(tokenId), "Token does not exist");
        return tokenMetadata[tokenId];
    }
    
    /**
     * @dev 获取所有在售代币
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
        
        // 调整数组大小
        assembly {
            mstore(forSale, count)
        }
        
        return forSale;
    }
    
    /**
     * @dev 获取用户拥有的代币
     * @param owner 用户地址
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
        
        // 调整数组大小
        assembly {
            mstore(owned, count)
        }
        
        return owned;
    }
    
    /**
     * @dev 设置代币价格（仅合约拥有者）
     * @param newPrice 新价格
     */
    function setTokenPrice(uint256 newPrice) public onlyOwner {
        tokenPrice = newPrice;
    }
    
    /**
     * @dev 提取合约余额（仅合约拥有者）
     */
    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    // 重写必要的函数
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
} 
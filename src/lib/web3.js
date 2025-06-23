import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia, localhost } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Coffee DAO RWA",
  projectId: "YOUR_WALLET_CONNECT_PROJECT_ID", // 需要从 WalletConnect 获取
  chains: [mainnet, sepolia, localhost],
  ssr: true,
});

// 合约地址配置
export const CONTRACT_ADDRESSES = {
  mainnet: "0x...", // 主网合约地址
  sepolia: "0x...", // 测试网合约地址
  localhost: "0x...", // 本地合约地址
};

// 合约ABI
export const CONTRACT_ABI = [
  // ERC721 标准函数
  {
    inputs: [],
    name: "name",
    outputs: [{ type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ type: "uint256" }],
    name: "ownerOf",
    outputs: [{ type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ type: "uint256" }],
    name: "tokenURI",
    outputs: [{ type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  // 自定义函数
  {
    inputs: [
      { type: "address" },
      { type: "string" },
      { type: "string" },
      { type: "string" },
      { type: "string" },
    ],
    name: "mint",
    outputs: [{ type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ type: "uint256" }, { type: "uint256" }],
    name: "listToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ type: "uint256" }],
    name: "buyToken",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ type: "uint256" }],
    name: "cancelSale",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ type: "uint256" }],
    name: "getTokenMetadata",
    outputs: [
      {
        components: [
          { name: "name", type: "string" },
          { name: "description", type: "string" },
          { name: "image", type: "string" },
          { name: "price", type: "uint256" },
          { name: "isForSale", type: "bool" },
          { name: "owner", type: "address" },
          { name: "createdAt", type: "uint256" },
        ],
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTokensForSale",
    outputs: [{ type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ type: "address" }],
    name: "getTokensByOwner",
    outputs: [{ type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "tokenPrice",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

// 事件
export const CONTRACT_EVENTS = {
  TokenMinted: "TokenMinted",
  TokenListed: "TokenListed",
  TokenSold: "TokenSold",
  PriceUpdated: "PriceUpdated",
};

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia, localhost } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Coffee DAO RWA",
  projectId: "YOUR_WALLET_CONNECT_PROJECT_ID", // Get from WalletConnect
  chains: [mainnet, sepolia, localhost],
  ssr: true,
});

// Contract addresses
export const CONTRACT_ADDRESSES = {
  mainnet: "0x...", // Mainnet contract address
  sepolia: "0x...", // Testnet contract address
  localhost: "0x...", // Local contract address
};

// Contract ABI
export const CONTRACT_ABI = [
  // ERC721 standard functions
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
  // Custom functions
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

// Events
export const CONTRACT_EVENTS = {
  TokenMinted: "TokenMinted",
  TokenListed: "TokenListed",
  TokenSold: "TokenSold",
  PriceUpdated: "PriceUpdated",
};

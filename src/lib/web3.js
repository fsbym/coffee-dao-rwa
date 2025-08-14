import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia, mainnet } from "wagmi/chains";

// Wallet Connect Project ID
const projectId =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "default-project-id";

// Configure chains and providers using RainbowKit's getDefaultConfig
export const config = getDefaultConfig({
  appName: "Coffee Shop RWA Platform",
  projectId,
  chains: [sepolia, mainnet],
  ssr: true, // Enable server-side rendering
});

// Contract ABI for CoffeeShopRWA (ERC-20 based Real World Asset tokenization)
export const CONTRACT_ABI = [
  // ERC-20 Standard Functions
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
    inputs: [],
    name: "totalSupply",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },

  // Asset Information Functions
  {
    inputs: [],
    name: "getAssetInfo",
    outputs: [
      { name: "shopName", type: "string" },
      { name: "location", type: "string" },
      { name: "description", type: "string" },
      { name: "totalValuation", type: "uint256" },
      { name: "tokenizedPercentage", type: "uint256" },
      { name: "legalDocumentHash", type: "string" },
      { name: "isVerified", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTokenValue",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },

  // Financial Reporting Functions
  {
    inputs: [
      { name: "_month", type: "uint256" },
      { name: "_year", type: "uint256" },
      { name: "_revenue", type: "uint256" },
      { name: "_expenses", type: "uint256" },
      { name: "_reportHash", type: "string" },
    ],
    name: "submitFinancialReport",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_reportId", type: "uint256" }],
    name: "getFinancialReport",
    outputs: [
      { name: "month", type: "uint256" },
      { name: "year", type: "uint256" },
      { name: "revenue", type: "uint256" },
      { name: "expenses", type: "uint256" },
      { name: "netProfit", type: "uint256" },
      { name: "dividendPool", type: "uint256" },
      { name: "reportHash", type: "string" },
      { name: "timestamp", type: "uint256" },
      { name: "isApproved", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_reportId", type: "uint256" }],
    name: "approveFinancialReport",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllReportIds",
    outputs: [{ type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "currentReportId",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },

  // Dividend Distribution Functions
  {
    inputs: [{ name: "_reportId", type: "uint256" }],
    name: "distributeDividends",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ name: "_distributionId", type: "uint256" }],
    name: "claimDividend",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "claimAllDividends",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_holder", type: "address" }],
    name: "getUnclaimedDividends",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "currentDistributionId",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },

  // Governance Functions
  {
    inputs: [
      { name: "_title", type: "string" },
      { name: "_description", type: "string" },
      { name: "_votingPeriod", type: "uint256" },
    ],
    name: "createProposal",
    outputs: [{ type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "_proposalId", type: "uint256" },
      { name: "_support", type: "bool" },
    ],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_proposalId", type: "uint256" }],
    name: "executeProposal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_proposalId", type: "uint256" }],
    name: "getProposal",
    outputs: [
      { name: "title", type: "string" },
      { name: "description", type: "string" },
      { name: "votingDeadline", type: "uint256" },
      { name: "forVotes", type: "uint256" },
      { name: "againstVotes", type: "uint256" },
      { name: "executed", type: "bool" },
      { name: "passed", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "_proposalId", type: "uint256" },
      { name: "_voter", type: "address" },
    ],
    name: "hasVoted",
    outputs: [{ type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "currentProposalId",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "proposalThreshold",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },

  // Admin Functions
  {
    inputs: [{ name: "_legalDocumentHash", type: "string" }],
    name: "verifyAsset",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_reporter", type: "address" }],
    name: "authorizeReporter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_reporter", type: "address" }],
    name: "revokeReporter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "_to", type: "address" },
      { name: "_amount", type: "uint256" },
    ],
    name: "issueTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  // State Variables (public getters)
  {
    inputs: [],
    name: "maxTotalSupply",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "", type: "address" }],
    name: "authorizedReporters",
    outputs: [{ type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "", type: "address" }],
    name: "lastDividendClaimed",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },

  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "shopName", type: "string" },
      { indexed: false, name: "location", type: "string" },
      { indexed: false, name: "totalValuation", type: "uint256" },
      { indexed: false, name: "tokenizedPercentage", type: "uint256" },
      { indexed: false, name: "tokensIssued", type: "uint256" },
    ],
    name: "AssetTokenized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "reportId", type: "uint256" },
      { indexed: false, name: "month", type: "uint256" },
      { indexed: false, name: "year", type: "uint256" },
      { indexed: false, name: "revenue", type: "uint256" },
      { indexed: false, name: "netProfit", type: "uint256" },
      { indexed: false, name: "reportHash", type: "string" },
    ],
    name: "FinancialReportSubmitted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "distributionId", type: "uint256" },
      { indexed: false, name: "totalAmount", type: "uint256" },
      { indexed: false, name: "pricePerToken", type: "uint256" },
      { indexed: false, name: "reportId", type: "uint256" },
    ],
    name: "DividendDistributed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "holder", type: "address" },
      { indexed: true, name: "distributionId", type: "uint256" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
    name: "DividendClaimed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "proposalId", type: "uint256" },
      { indexed: true, name: "creator", type: "address" },
      { indexed: false, name: "title", type: "string" },
      { indexed: false, name: "votingDeadline", type: "uint256" },
    ],
    name: "ProposalCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "proposalId", type: "uint256" },
      { indexed: true, name: "voter", type: "address" },
      { indexed: false, name: "support", type: "bool" },
      { indexed: false, name: "votingPower", type: "uint256" },
    ],
    name: "VoteCast",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "proposalId", type: "uint256" },
      { indexed: false, name: "passed", type: "bool" },
    ],
    name: "ProposalExecuted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, name: "legalDocumentHash", type: "string" }],
    name: "AssetVerified",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, name: "reporter", type: "address" }],
    name: "ReporterAuthorized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, name: "reporter", type: "address" }],
    name: "ReporterRevoked",
    type: "event",
  },
  // ERC-20 Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "value", type: "uint256" },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "owner", type: "address" },
      { indexed: true, name: "spender", type: "address" },
      { indexed: false, name: "value", type: "uint256" },
    ],
    name: "Approval",
    type: "event",
  },
];

// Contract addresses
export const CONTRACT_ADDRESSES = {
  // Update with your deployed contract addresses
  sepolia: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x...", // Update after deployment
  mainnet: "0x...", // Update when deploying to mainnet
  localhost: "0x...", // For local development
};

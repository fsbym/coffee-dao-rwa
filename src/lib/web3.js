// Native Web3 configuration - no external dependencies needed

// Contract ABI for CoffeeShopRWASimple (Simplified ERC-20 based Real World Asset tokenization)
export const CONTRACT_ABI = [
  // Constructor
  {
    inputs: [
      { name: "_shopName", type: "string" },
      { name: "_location", type: "string" },
      { name: "_description", type: "string" },
      { name: "_totalValuation", type: "uint256" },
      { name: "_tokenizedPercentage", type: "uint256" },
      { name: "_initialTokenSupply", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },

  // ERC-20 Standard Functions
  {
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ name: "", type: "bool" }],
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
      { name: "isVerified", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTokenValue",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },

  // Purchase Functions
  {
    inputs: [{ name: "_tokenAmount", type: "uint256" }],
    name: "buyTokens",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ name: "_newPrice", type: "uint256" }],
    name: "updateTokenPrice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
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
    outputs: [{ name: "", type: "uint256" }],
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
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllProposalIds",
    outputs: [{ name: "", type: "uint256[]" }],
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
      { name: "reportHash", type: "string" },
      { name: "timestamp", type: "uint256" },
      { name: "isApproved", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllReportIds",
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
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

  // Admin Functions
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
    outputs: [{ name: "", type: "address" }],
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

  // State Variables (public getters)
  {
    inputs: [],
    name: "maxTotalSupply",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "tokenPrice",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "assetInfo",
    outputs: [
      { name: "shopName", type: "string" },
      { name: "location", type: "string" },
      { name: "description", type: "string" },
      { name: "totalValuation", type: "uint256" },
      { name: "tokenizedPercentage", type: "uint256" },
      { name: "isVerified", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "currentProposalId",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "currentReportId",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "proposalThreshold",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "", type: "address" }],
    name: "authorizedReporters",
    outputs: [{ name: "", type: "bool" }],
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
      { indexed: true, name: "buyer", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "totalCost", type: "uint256" },
    ],
    name: "TokensPurchased",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "oldPrice", type: "uint256" },
      { indexed: false, name: "newPrice", type: "uint256" },
    ],
    name: "PriceUpdated",
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
    inputs: [
      { indexed: true, name: "reportId", type: "uint256" },
      { indexed: false, name: "month", type: "uint256" },
      { indexed: false, name: "year", type: "uint256" },
      { indexed: false, name: "revenue", type: "uint256" },
      { indexed: false, name: "netProfit", type: "uint256" },
    ],
    name: "FinancialReportSubmitted",
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
  localhost:
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
    "0x5FbDB2315678afecb367f032d93F642f64180aa3", // For local development
  hardhat:
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
    "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Hardhat network
};

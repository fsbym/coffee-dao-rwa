// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CoffeeShopRWAComplete
 * @dev Complete Coffee Shop RWA with purchase and governance functionality
 */
contract CoffeeShopRWAComplete is ERC20, Ownable, ReentrancyGuard {
    
    // Asset information
    struct AssetInfo {
        string shopName;
        string location;
        string description;
        uint256 totalValuation;
        uint256 tokenizedPercentage;
        bool isVerified;
    }
    
    // Governance proposal
    struct Proposal {
        uint256 id;
        string title;
        string description;
        uint256 votingDeadline;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 totalVotingPower;
        bool executed;
        bool passed;
    }
    
    // Financial reporting
    struct FinancialReport {
        uint256 reportId;
        uint256 month;
        uint256 year;
        uint256 revenue;
        uint256 expenses;
        uint256 netProfit;
        string reportHash;
        uint256 timestamp;
        bool isApproved;
    }
    
    // State variables
    AssetInfo public assetInfo;
    uint256 public maxTotalSupply;
    uint256 public tokenPrice;
    uint256 public currentProposalId;
    uint256 public currentReportId;
    uint256 public proposalThreshold = 100; // 1% of total supply
    uint256 public constant MIN_VOTING_PERIOD = 7 days;
    
    // Mappings
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => FinancialReport) public financialReports;
    mapping(uint256 => mapping(address => bool)) public proposalHasVoted;
    mapping(uint256 => mapping(address => uint256)) public proposalVotingPower;
    mapping(address => bool) public authorizedReporters;
    
    // Arrays for iteration
    uint256[] public proposalIds;
    uint256[] public reportIds;
    
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
    
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed creator,
        string title,
        uint256 votingDeadline
    );
    
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 votingPower
    );
    
    event ProposalExecuted(
        uint256 indexed proposalId,
        bool passed
    );
    
    event FinancialReportSubmitted(
        uint256 indexed reportId,
        uint256 month,
        uint256 year,
        uint256 revenue,
        uint256 netProfit
    );
    
    // Modifiers
    modifier onlyAuthorizedReporter() {
        require(authorizedReporters[msg.sender] || msg.sender == owner(), "Not authorized reporter");
        _;
    }
    
    modifier validProposal(uint256 proposalId) {
        require(proposalId > 0 && proposalId <= currentProposalId, "Invalid proposal ID");
        _;
    }
    
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
        
        maxTotalSupply = _initialTokenSupply * 2;
        tokenPrice = _tokenPrice;
        
        _mint(msg.sender, _initialTokenSupply);
        
        emit AssetTokenized(_shopName, _location, _totalValuation, _tokenizedPercentage, _initialTokenSupply);
    }
    
    // Purchase Functions
    function buyTokens(uint256 _tokenAmount) external payable {
        require(_tokenAmount > 0, "Token amount must be positive");
        require(totalSupply() + _tokenAmount <= maxTotalSupply, "Exceeds maximum total supply");
        
        uint256 totalCost = _tokenAmount * tokenPrice;
        require(msg.value >= totalCost, "Insufficient ETH sent");
        
        _mint(msg.sender, _tokenAmount);
        
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }
        
        emit TokensPurchased(msg.sender, _tokenAmount, totalCost);
    }
    
    function updateTokenPrice(uint256 _newPrice) external onlyOwner {
        require(_newPrice > 0, "Price must be positive");
        uint256 oldPrice = tokenPrice;
        tokenPrice = _newPrice;
        emit PriceUpdated(oldPrice, _newPrice);
    }
    
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }
    
    // Governance Functions
    function createProposal(
        string memory _title,
        string memory _description,
        uint256 _votingPeriod
    ) external returns (uint256) {
        require(_votingPeriod >= MIN_VOTING_PERIOD, "Voting period too short");
        uint256 requiredTokens = (totalSupply() * proposalThreshold) / 10000;
        require(balanceOf(msg.sender) >= requiredTokens, "Insufficient tokens to create proposal");
        
        currentProposalId++;
        uint256 votingDeadline = block.timestamp + _votingPeriod;
        
        proposals[currentProposalId] = Proposal({
            id: currentProposalId,
            title: _title,
            description: _description,
            votingDeadline: votingDeadline,
            forVotes: 0,
            againstVotes: 0,
            totalVotingPower: totalSupply(),
            executed: false,
            passed: false
        });
        
        proposalIds.push(currentProposalId);
        
        emit ProposalCreated(currentProposalId, msg.sender, _title, votingDeadline);
        return currentProposalId;
    }
    
    function vote(uint256 _proposalId, bool _support) external validProposal(_proposalId) {
        Proposal storage proposal = proposals[_proposalId];
        require(block.timestamp <= proposal.votingDeadline, "Voting period ended");
        require(!proposalHasVoted[_proposalId][msg.sender], "Already voted");
        
        uint256 votingPower = balanceOf(msg.sender);
        require(votingPower > 0, "No voting power");
        
        proposalHasVoted[_proposalId][msg.sender] = true;
        proposalVotingPower[_proposalId][msg.sender] = votingPower;
        
        if (_support) {
            proposal.forVotes += votingPower;
        } else {
            proposal.againstVotes += votingPower;
        }
        
        emit VoteCast(_proposalId, msg.sender, _support, votingPower);
    }
    
    function executeProposal(uint256 _proposalId) external validProposal(_proposalId) {
        Proposal storage proposal = proposals[_proposalId];
        require(block.timestamp > proposal.votingDeadline, "Voting period not ended");
        require(!proposal.executed, "Proposal already executed");
        
        proposal.executed = true;
        
        if (proposal.forVotes > proposal.againstVotes) {
            proposal.passed = true;
        }
        
        emit ProposalExecuted(_proposalId, proposal.passed);
    }
    
    // Financial Reporting Functions
    function submitFinancialReport(
        uint256 _month,
        uint256 _year,
        uint256 _revenue,
        uint256 _expenses,
        string memory _reportHash
    ) external onlyAuthorizedReporter {
        require(_month >= 1 && _month <= 12, "Invalid month");
        require(_year >= 2020, "Invalid year");
        require(_revenue >= _expenses, "Revenue cannot be less than expenses");
        
        currentReportId++;
        uint256 netProfit = _revenue - _expenses;
        
        financialReports[currentReportId] = FinancialReport({
            reportId: currentReportId,
            month: _month,
            year: _year,
            revenue: _revenue,
            expenses: _expenses,
            netProfit: netProfit,
            reportHash: _reportHash,
            timestamp: block.timestamp,
            isApproved: msg.sender == owner()
        });
        
        reportIds.push(currentReportId);
        
        emit FinancialReportSubmitted(currentReportId, _month, _year, _revenue, netProfit);
    }
    
    function authorizeReporter(address _reporter) external onlyOwner {
        authorizedReporters[_reporter] = true;
    }
    
    function revokeReporter(address _reporter) external onlyOwner {
        authorizedReporters[_reporter] = false;
    }
    
    // View Functions
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
    
    function getTokenValue() external view returns (uint256) {
        if (totalSupply() == 0) return 0;
        uint256 tokenizedValue = (assetInfo.totalValuation * assetInfo.tokenizedPercentage) / 10000;
        return tokenizedValue / totalSupply();
    }
    
    function getProposal(uint256 _proposalId) external view returns (
        string memory title,
        string memory description,
        uint256 votingDeadline,
        uint256 forVotes,
        uint256 againstVotes,
        bool executed,
        bool passed
    ) {
        Proposal memory proposal = proposals[_proposalId];
        return (
            proposal.title,
            proposal.description,
            proposal.votingDeadline,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.executed,
            proposal.passed
        );
    }
    
    function hasVoted(uint256 _proposalId, address _voter) external view returns (bool) {
        return proposalHasVoted[_proposalId][_voter];
    }
    
    function getFinancialReport(uint256 _reportId) external view returns (
        uint256 month,
        uint256 year,
        uint256 revenue,
        uint256 expenses,
        uint256 netProfit,
        string memory reportHash,
        uint256 timestamp,
        bool isApproved
    ) {
        FinancialReport memory report = financialReports[_reportId];
        return (
            report.month,
            report.year,
            report.revenue,
            report.expenses,
            report.netProfit,
            report.reportHash,
            report.timestamp,
            report.isApproved
        );
    }
    
    function getAllProposalIds() external view returns (uint256[] memory) {
        return proposalIds;
    }
    
    function getAllReportIds() external view returns (uint256[] memory) {
        return reportIds;
    }
    
    function issueTokens(address _to, uint256 _amount) external onlyOwner {
        require(totalSupply() + _amount <= maxTotalSupply, "Exceeds maximum total supply");
        _mint(_to, _amount);
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title CoffeeShopRWA
 * @dev Real World Asset tokenization for Coffee Shop
 * Features:
 * - Coffee shop ownership tokenization
 * - Revenue sharing with token holders
 * - Transparent financial reporting
 * - Governance rights for major decisions
 * - Asset backing and verification
 */
contract CoffeeShopRWA is ERC20, Ownable, ReentrancyGuard, Pausable {
    
    // Asset information
    struct AssetInfo {
        string shopName;
        string location;
        string description;
        uint256 totalValuation;      // Total shop valuation in wei
        uint256 tokenizedPercentage; // Percentage of shop tokenized (basis points, 10000 = 100%)
        string legalDocumentHash;    // IPFS hash of legal documents
        bool isVerified;             // Whether asset is verified by oracle/auditor
    }
    
    // Financial reporting
    struct FinancialReport {
        uint256 reportId;
        uint256 month;
        uint256 year;
        uint256 revenue;            // Monthly revenue in wei
        uint256 expenses;           // Monthly expenses in wei
        uint256 netProfit;          // Net profit in wei
        uint256 dividendPool;       // Amount allocated for dividends
        string reportHash;          // IPFS hash of detailed report
        uint256 timestamp;
        bool isApproved;           // Approved by auditor/oracle
    }
    
    // Governance proposal
    struct Proposal {
        uint256 id;
        string title;
        string description;
        uint256 votingDeadline;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 totalVotingPower;   // Total tokens that can vote
        bool executed;
        bool passed;
        mapping(address => bool) hasVoted;
        mapping(address => uint256) votingPower; // Voting power used
    }
    
    // Dividend distribution
    struct DividendDistribution {
        uint256 distributionId;
        uint256 totalAmount;
        uint256 pricePerToken;      // Wei per token
        uint256 timestamp;
        uint256 reportId;           // Link to financial report
        mapping(address => bool) claimed;
    }
    
    // State variables
    AssetInfo public assetInfo;
    uint256 public currentReportId;
    uint256 public currentProposalId;
    uint256 public currentDistributionId;
    
    // Minimum tokens required to create proposal (basis points of total supply)
    uint256 public proposalThreshold = 100; // 1% of total supply
    
    // Minimum voting period (in seconds)
    uint256 public constant MIN_VOTING_PERIOD = 7 days;
    
    // Maximum tokens that can be issued (prevents over-dilution)
    uint256 public maxTotalSupply;
    
    // Mappings
    mapping(uint256 => FinancialReport) public financialReports;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => DividendDistribution) public dividendDistributions;
    mapping(address => bool) public authorizedReporters; // Auditors/Oracles
    mapping(address => uint256) public lastDividendClaimed; // Track last claimed distribution
    
    // Arrays for iteration
    uint256[] public reportIds;
    uint256[] public proposalIds;
    uint256[] public distributionIds;
    
    // Events
    event AssetTokenized(
        string shopName,
        string location,
        uint256 totalValuation,
        uint256 tokenizedPercentage,
        uint256 tokensIssued
    );
    
    event FinancialReportSubmitted(
        uint256 indexed reportId,
        uint256 month,
        uint256 year,
        uint256 revenue,
        uint256 netProfit,
        string reportHash
    );
    
    event DividendDistributed(
        uint256 indexed distributionId,
        uint256 totalAmount,
        uint256 pricePerToken,
        uint256 reportId
    );
    
    event DividendClaimed(
        address indexed holder,
        uint256 indexed distributionId,
        uint256 amount
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
    
    event AssetVerified(string legalDocumentHash);
    event ReporterAuthorized(address indexed reporter);
    event ReporterRevoked(address indexed reporter);
    
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
        
        maxTotalSupply = _initialTokenSupply * 2; // Allow up to 2x initial supply
        _mint(msg.sender, _initialTokenSupply);
        
        emit AssetTokenized(_shopName, _location, _totalValuation, _tokenizedPercentage, _initialTokenSupply);
    }
    
    /**
     * @dev Submit monthly financial report
     */
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
        uint256 dividendPool = (netProfit * assetInfo.tokenizedPercentage) / 10000;
        
        financialReports[currentReportId] = FinancialReport({
            reportId: currentReportId,
            month: _month,
            year: _year,
            revenue: _revenue,
            expenses: _expenses,
            netProfit: netProfit,
            dividendPool: dividendPool,
            reportHash: _reportHash,
            timestamp: block.timestamp,
            isApproved: msg.sender == owner() ? true : false // Auto-approve if owner submits
        });
        
        reportIds.push(currentReportId);
        
        emit FinancialReportSubmitted(
            currentReportId,
            _month,
            _year,
            _revenue,
            netProfit,
            _reportHash
        );
    }
    
    /**
     * @dev Approve financial report (for external auditors)
     */
    function approveFinancialReport(uint256 _reportId) external onlyOwner {
        require(_reportId > 0 && _reportId <= currentReportId, "Invalid report ID");
        financialReports[_reportId].isApproved = true;
    }
    
    /**
     * @dev Distribute dividends based on financial report
     */
    function distributeDividends(uint256 _reportId) external payable onlyOwner nonReentrant {
        require(_reportId > 0 && _reportId <= currentReportId, "Invalid report ID");
        FinancialReport storage report = financialReports[_reportId];
        require(report.isApproved, "Report not approved");
        require(msg.value >= report.dividendPool, "Insufficient dividend amount");
        
        currentDistributionId++;
        uint256 pricePerToken = msg.value / totalSupply();
        
        DividendDistribution storage distribution = dividendDistributions[currentDistributionId];
        distribution.distributionId = currentDistributionId;
        distribution.totalAmount = msg.value;
        distribution.pricePerToken = pricePerToken;
        distribution.timestamp = block.timestamp;
        distribution.reportId = _reportId;
        
        distributionIds.push(currentDistributionId);
        
        emit DividendDistributed(currentDistributionId, msg.value, pricePerToken, _reportId);
    }
    
    /**
     * @dev Claim dividends for a specific distribution
     */
    function claimDividend(uint256 _distributionId) external nonReentrant {
        require(_distributionId > 0 && _distributionId <= currentDistributionId, "Invalid distribution ID");
        DividendDistribution storage distribution = dividendDistributions[_distributionId];
        require(!distribution.claimed[msg.sender], "Already claimed");
        
        uint256 holderBalance = balanceOf(msg.sender);
        require(holderBalance > 0, "No tokens held");
        
        uint256 dividendAmount = holderBalance * distribution.pricePerToken;
        distribution.claimed[msg.sender] = true;
        
        (bool success, ) = payable(msg.sender).call{value: dividendAmount}("");
        require(success, "Dividend transfer failed");
        
        emit DividendClaimed(msg.sender, _distributionId, dividendAmount);
    }
    
    /**
     * @dev Claim all unclaimed dividends
     */
    function claimAllDividends() external nonReentrant {
        uint256 totalDividends = 0;
        uint256 holderBalance = balanceOf(msg.sender);
        require(holderBalance > 0, "No tokens held");
        
        for (uint256 i = lastDividendClaimed[msg.sender] + 1; i <= currentDistributionId; i++) {
            DividendDistribution storage distribution = dividendDistributions[i];
            if (!distribution.claimed[msg.sender]) {
                uint256 dividendAmount = holderBalance * distribution.pricePerToken;
                totalDividends += dividendAmount;
                distribution.claimed[msg.sender] = true;
                emit DividendClaimed(msg.sender, i, dividendAmount);
            }
        }
        
        require(totalDividends > 0, "No dividends to claim");
        lastDividendClaimed[msg.sender] = currentDistributionId;
        
        (bool success, ) = payable(msg.sender).call{value: totalDividends}("");
        require(success, "Dividend transfer failed");
    }
    
    /**
     * @dev Create governance proposal
     */
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
        
        Proposal storage proposal = proposals[currentProposalId];
        proposal.id = currentProposalId;
        proposal.title = _title;
        proposal.description = _description;
        proposal.votingDeadline = votingDeadline;
        proposal.totalVotingPower = totalSupply();
        
        proposalIds.push(currentProposalId);
        
        emit ProposalCreated(currentProposalId, msg.sender, _title, votingDeadline);
        return currentProposalId;
    }
    
    /**
     * @dev Vote on proposal
     */
    function vote(uint256 _proposalId, bool _support) external validProposal(_proposalId) {
        Proposal storage proposal = proposals[_proposalId];
        require(block.timestamp <= proposal.votingDeadline, "Voting period ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        
        uint256 votingPower = balanceOf(msg.sender);
        require(votingPower > 0, "No voting power");
        
        proposal.hasVoted[msg.sender] = true;
        proposal.votingPower[msg.sender] = votingPower;
        
        if (_support) {
            proposal.forVotes += votingPower;
        } else {
            proposal.againstVotes += votingPower;
        }
        
        emit VoteCast(_proposalId, msg.sender, _support, votingPower);
    }
    
    /**
     * @dev Execute proposal after voting period
     */
    function executeProposal(uint256 _proposalId) external validProposal(_proposalId) {
        Proposal storage proposal = proposals[_proposalId];
        require(block.timestamp > proposal.votingDeadline, "Voting period not ended");
        require(!proposal.executed, "Proposal already executed");
        
        proposal.executed = true;
        
        // Simple majority rule
        if (proposal.forVotes > proposal.againstVotes) {
            proposal.passed = true;
        }
        
        emit ProposalExecuted(_proposalId, proposal.passed);
    }
    
    /**
     * @dev Verify asset with legal documents
     */
    function verifyAsset(string memory _legalDocumentHash) external onlyOwner {
        assetInfo.legalDocumentHash = _legalDocumentHash;
        assetInfo.isVerified = true;
        emit AssetVerified(_legalDocumentHash);
    }
    
    /**
     * @dev Authorize external reporter/auditor
     */
    function authorizeReporter(address _reporter) external onlyOwner {
        authorizedReporters[_reporter] = true;
        emit ReporterAuthorized(_reporter);
    }
    
    /**
     * @dev Revoke reporter authorization
     */
    function revokeReporter(address _reporter) external onlyOwner {
        authorizedReporters[_reporter] = false;
        emit ReporterRevoked(_reporter);
    }
    
    /**
     * @dev Issue additional tokens (for expansion, up to maxTotalSupply)
     */
    function issueTokens(address _to, uint256 _amount) external onlyOwner {
        require(totalSupply() + _amount <= maxTotalSupply, "Exceeds maximum total supply");
        _mint(_to, _amount);
    }
    
    // View functions
    
    /**
     * @dev Get asset information
     */
    function getAssetInfo() external view returns (
        string memory shopName,
        string memory location,
        string memory description,
        uint256 totalValuation,
        uint256 tokenizedPercentage,
        string memory legalDocumentHash,
        bool isVerified
    ) {
        return (
            assetInfo.shopName,
            assetInfo.location,
            assetInfo.description,
            assetInfo.totalValuation,
            assetInfo.tokenizedPercentage,
            assetInfo.legalDocumentHash,
            assetInfo.isVerified
        );
    }
    
    /**
     * @dev Get financial report
     */
    function getFinancialReport(uint256 _reportId) external view returns (
        uint256 month,
        uint256 year,
        uint256 revenue,
        uint256 expenses,
        uint256 netProfit,
        uint256 dividendPool,
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
            report.dividendPool,
            report.reportHash,
            report.timestamp,
            report.isApproved
        );
    }
    
    /**
     * @dev Get all financial report IDs
     */
    function getAllReportIds() external view returns (uint256[] memory) {
        return reportIds;
    }
    
    /**
     * @dev Get unclaimed dividend amount for address
     */
    function getUnclaimedDividends(address _holder) external view returns (uint256) {
        uint256 totalUnclaimed = 0;
        uint256 holderBalance = balanceOf(_holder);
        
        for (uint256 i = 1; i <= currentDistributionId; i++) {
            if (!dividendDistributions[i].claimed[_holder]) {
                totalUnclaimed += holderBalance * dividendDistributions[i].pricePerToken;
            }
        }
        
        return totalUnclaimed;
    }
    
    /**
     * @dev Get proposal details
     */
    function getProposal(uint256 _proposalId) external view returns (
        string memory title,
        string memory description,
        uint256 votingDeadline,
        uint256 forVotes,
        uint256 againstVotes,
        bool executed,
        bool passed
    ) {
        Proposal storage proposal = proposals[_proposalId];
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
    
    /**
     * @dev Check if address has voted on proposal
     */
    function hasVoted(uint256 _proposalId, address _voter) external view returns (bool) {
        return proposals[_proposalId].hasVoted[_voter];
    }
    
    /**
     * @dev Get token value based on latest valuation
     */
    function getTokenValue() external view returns (uint256) {
        if (totalSupply() == 0) return 0;
        uint256 tokenizedValue = (assetInfo.totalValuation * assetInfo.tokenizedPercentage) / 10000;
        return tokenizedValue / totalSupply();
    }
    
    // Admin functions
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function _update(address from, address to, uint256 value) internal override whenNotPaused {
        super._update(from, to, value);
    }
}

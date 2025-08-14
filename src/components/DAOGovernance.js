"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatEther, parseEther } from "viem";
import {
  Vote,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  FileText,
  DollarSign,
  Settings,
  Zap,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Minus,
  User,
  UserCheck,
  Calendar,
  TrendingUp,
} from "lucide-react";

// Proposal types mapping
const PROPOSAL_TYPES = {
  0: { name: "Financial", icon: DollarSign, color: "green" },
  1: { name: "Operational", icon: Settings, color: "blue" },
  2: { name: "Strategic", icon: TrendingUp, color: "purple" },
  3: { name: "Governance", icon: Vote, color: "indigo" },
  4: { name: "Emergency", icon: AlertTriangle, color: "red" },
};

const URGENCY_LEVELS = {
  0: { name: "Low", duration: "14 days", color: "gray" },
  1: { name: "Medium", duration: "7 days", color: "yellow" },
  2: { name: "High", duration: "3 days", color: "orange" },
  3: { name: "Emergency", duration: "24 hours", color: "red" },
};

const PROPOSAL_STATUS = {
  0: { name: "Active", icon: Clock, color: "blue" },
  1: { name: "Succeeded", icon: CheckCircle, color: "green" },
  2: { name: "Defeated", icon: XCircle, color: "red" },
  3: { name: "Executed", icon: CheckCircle, color: "green" },
  4: { name: "Cancelled", icon: XCircle, color: "gray" },
  5: { name: "Vetoed", icon: AlertTriangle, color: "red" },
};

export function DAOGovernance({ contractAddress, contractABI }) {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState("proposals");
  const [showCreateProposal, setShowCreateProposal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);

  // Contract reads
  const { data: votingPower } = useContractRead({
    address: contractAddress,
    abi: contractABI,
    functionName: "getVotingPower",
    args: [address],
    enabled: !!address,
    watch: true,
  });

  const { data: activeProposals } = useContractRead({
    address: contractAddress,
    abi: contractABI,
    functionName: "getActiveProposals",
    watch: true,
  });

  const { data: governanceConfig } = useContractRead({
    address: contractAddress,
    abi: contractABI,
    functionName: "governanceConfig",
    watch: true,
  });

  const { data: userDelegation } = useContractRead({
    address: contractAddress,
    abi: contractABI,
    functionName: "votingDelegations",
    args: [address],
    enabled: !!address,
    watch: true,
  });

  const tabs = [
    { id: "proposals", label: "Proposals", icon: Vote },
    { id: "create", label: "Create Proposal", icon: Plus },
    { id: "delegation", label: "Delegation", icon: Users },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
  ];

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <Vote className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Connect to Participate
        </h3>
        <p className="text-gray-600">
          Connect your wallet to participate in DAO governance
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Governance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Your Voting Power</p>
              <p className="text-2xl font-bold">
                {votingPower ? formatEther(votingPower) : "0"}
              </p>
            </div>
            <Vote className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Active Proposals</p>
              <p className="text-2xl font-bold">
                {activeProposals ? activeProposals.length : 0}
              </p>
            </div>
            <FileText className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Delegation Status</p>
              <p className="text-lg font-bold">
                {userDelegation && userDelegation[3] ? "Delegated" : "Direct"}
              </p>
            </div>
            <Users className="h-8 w-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Quorum Required</p>
              <p className="text-2xl font-bold">
                {governanceConfig
                  ? `${Number(governanceConfig[1]) / 100}%`
                  : "10%"}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "proposals" && (
          <ProposalsTab
            contractAddress={contractAddress}
            contractABI={contractABI}
            activeProposals={activeProposals}
            votingPower={votingPower}
            userAddress={address}
          />
        )}

        {activeTab === "create" && (
          <CreateProposalTab
            contractAddress={contractAddress}
            contractABI={contractABI}
            votingPower={votingPower}
            governanceConfig={governanceConfig}
          />
        )}

        {activeTab === "delegation" && (
          <DelegationTab
            contractAddress={contractAddress}
            contractABI={contractABI}
            userAddress={address}
            userDelegation={userDelegation}
            votingPower={votingPower}
          />
        )}

        {activeTab === "analytics" && (
          <AnalyticsTab
            contractAddress={contractAddress}
            contractABI={contractABI}
            activeProposals={activeProposals}
          />
        )}
      </div>
    </div>
  );
}

// Proposals Tab Component
function ProposalsTab({
  contractAddress,
  contractABI,
  activeProposals,
  votingPower,
  userAddress,
}) {
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [filter, setFilter] = useState("all");

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">Filter:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-md border-gray-300 text-sm"
        >
          <option value="all">All Proposals</option>
          <option value="financial">Financial</option>
          <option value="operational">Operational</option>
          <option value="strategic">Strategic</option>
          <option value="governance">Governance</option>
          <option value="emergency">Emergency</option>
        </select>
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {activeProposals && activeProposals.length > 0 ? (
          activeProposals.map((proposalId) => (
            <ProposalCard
              key={proposalId}
              proposalId={proposalId}
              contractAddress={contractAddress}
              contractABI={contractABI}
              votingPower={votingPower}
              userAddress={userAddress}
              onSelect={setSelectedProposal}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <Vote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No active proposals</p>
          </div>
        )}
      </div>

      {/* Proposal Detail Modal */}
      {selectedProposal && (
        <ProposalDetailModal
          proposalId={selectedProposal}
          contractAddress={contractAddress}
          contractABI={contractABI}
          onClose={() => setSelectedProposal(null)}
        />
      )}
    </div>
  );
}

// Proposal Card Component
function ProposalCard({
  proposalId,
  contractAddress,
  contractABI,
  votingPower,
  userAddress,
  onSelect,
}) {
  const { data: proposal } = useContractRead({
    address: contractAddress,
    abi: contractABI,
    functionName: "daoProposals",
    args: [proposalId],
    watch: true,
  });

  const { data: hasVoted } = useContractRead({
    address: contractAddress,
    abi: contractABI,
    functionName: "hasVotedOnProposal",
    args: [proposalId, userAddress],
    enabled: !!userAddress,
    watch: true,
  });

  const { writeContract, isPending } = useContractWrite();

  const handleVote = (support) => {
    writeContract({
      address: contractAddress,
      abi: contractABI,
      functionName: "voteWithReason",
      args: [proposalId, support, ""],
    });
  };

  if (!proposal) return null;

  const proposalType = PROPOSAL_TYPES[proposal[2]] || PROPOSAL_TYPES[0];
  const urgency = URGENCY_LEVELS[proposal[3]] || URGENCY_LEVELS[0];
  const TypeIcon = proposalType.icon;

  const totalVotes =
    Number(proposal[10]) + Number(proposal[11]) + Number(proposal[12]);
  const forPercentage =
    totalVotes > 0 ? (Number(proposal[10]) / totalVotes) * 100 : 0;
  const againstPercentage =
    totalVotes > 0 ? (Number(proposal[11]) / totalVotes) * 100 : 0;

  const isExpired = Date.now() > Number(proposal[8]) * 1000;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-${proposalType.color}-100`}>
            <TypeIcon className={`h-5 w-5 text-${proposalType.color}-600`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {proposal[4]}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span
                className={`px-2 py-1 rounded-full bg-${proposalType.color}-100 text-${proposalType.color}-600`}
              >
                {proposalType.name}
              </span>
              <span
                className={`px-2 py-1 rounded-full bg-${urgency.color}-100 text-${urgency.color}-600`}
              >
                {urgency.name}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">
            Proposal #{proposalId.toString()}
          </p>
          <p className="text-sm text-gray-500">
            {isExpired
              ? "Voting Ended"
              : `Ends ${new Date(
                  Number(proposal[8]) * 1000
                ).toLocaleDateString()}`}
          </p>
        </div>
      </div>

      <p className="text-gray-700 mb-4 line-clamp-3">{proposal[5]}</p>

      {/* Voting Results */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span>For: {formatEther(proposal[10])}</span>
          <span>{forPercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full"
            style={{ width: `${forPercentage}%` }}
          ></div>
        </div>

        <div className="flex justify-between text-sm">
          <span>Against: {formatEther(proposal[11])}</span>
          <span>{againstPercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-red-500 h-2 rounded-full"
            style={{ width: `${againstPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onSelect(proposalId)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View Details
        </button>

        {!isExpired && !hasVoted && Number(votingPower) > 0 && (
          <div className="flex space-x-2">
            <button
              onClick={() => handleVote(1)}
              disabled={isPending}
              className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 disabled:opacity-50"
            >
              <ThumbsUp className="h-4 w-4" />
              <span>For</span>
            </button>
            <button
              onClick={() => handleVote(0)}
              disabled={isPending}
              className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:opacity-50"
            >
              <ThumbsDown className="h-4 w-4" />
              <span>Against</span>
            </button>
            <button
              onClick={() => handleVote(2)}
              disabled={isPending}
              className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
            >
              <Minus className="h-4 w-4" />
              <span>Abstain</span>
            </button>
          </div>
        )}

        {hasVoted && (
          <span className="text-sm text-green-600 font-medium">✓ Voted</span>
        )}
      </div>
    </div>
  );
}

// Create Proposal Tab Component
function CreateProposalTab({
  contractAddress,
  contractABI,
  votingPower,
  governanceConfig,
}) {
  const [formData, setFormData] = useState({
    type: 0,
    urgency: 1,
    title: "",
    description: "",
    detailsHash: "",
    requestedAmount: "",
    targetAddress: "",
    callData: "0x",
  });

  const { writeContract, isPending } = useContractWrite();

  const handleSubmit = (e) => {
    e.preventDefault();

    const amount = formData.requestedAmount
      ? parseEther(formData.requestedAmount)
      : 0;

    writeContract({
      address: contractAddress,
      abi: contractABI,
      functionName: "createDAOProposal",
      args: [
        formData.type,
        formData.urgency,
        formData.title,
        formData.description,
        formData.detailsHash,
        amount,
        formData.targetAddress || contractAddress,
        formData.callData,
      ],
    });
  };

  const requiredTokens = governanceConfig
    ? (Number(governanceConfig[0]) / 10000) * 100
    : 1;

  const canCreateProposal =
    Number(formatEther(votingPower || 0)) >= requiredTokens;

  return (
    <div className="max-w-2xl">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Create New Proposal
        </h3>

        {!canCreateProposal && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
              <p className="text-yellow-700">
                You need at least {requiredTokens}% of total tokens (
                {requiredTokens.toFixed(2)} tokens) to create a proposal. You
                have {formatEther(votingPower || 0)} tokens.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proposal Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: parseInt(e.target.value) })
                }
                className="w-full rounded-md border-gray-300"
                required
              >
                {Object.entries(PROPOSAL_TYPES).map(([value, type]) => (
                  <option key={value} value={value}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urgency Level
              </label>
              <select
                value={formData.urgency}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    urgency: parseInt(e.target.value),
                  })
                }
                className="w-full rounded-md border-gray-300"
                required
              >
                {Object.entries(URGENCY_LEVELS).map(([value, urgency]) => (
                  <option key={value} value={value}>
                    {urgency.name} ({urgency.duration})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full rounded-md border-gray-300"
              placeholder="Brief, descriptive title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full rounded-md border-gray-300"
              placeholder="Detailed explanation of the proposal"
              required
            />
          </div>

          {formData.type === 0 && ( // Financial proposal
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requested Amount (ETH)
              </label>
              <input
                type="number"
                step="0.001"
                value={formData.requestedAmount}
                onChange={(e) =>
                  setFormData({ ...formData, requestedAmount: e.target.value })
                }
                className="w-full rounded-md border-gray-300"
                placeholder="0.0"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Details (IPFS Hash)
            </label>
            <input
              type="text"
              value={formData.detailsHash}
              onChange={(e) =>
                setFormData({ ...formData, detailsHash: e.target.value })
              }
              className="w-full rounded-md border-gray-300"
              placeholder="QmXXX... (optional)"
            />
          </div>

          <button
            type="submit"
            disabled={!canCreateProposal || isPending}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Creating..." : "Create Proposal"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Delegation Tab Component
function DelegationTab({
  contractAddress,
  contractABI,
  userAddress,
  userDelegation,
  votingPower,
}) {
  const [delegateAddress, setDelegateAddress] = useState("");

  const { writeContract, isPending } = useContractWrite();

  const handleDelegate = () => {
    writeContract({
      address: contractAddress,
      abi: contractABI,
      functionName: "delegateVoting",
      args: [delegateAddress],
    });
  };

  const handleUndelegate = () => {
    writeContract({
      address: contractAddress,
      abi: contractABI,
      functionName: "undelegateVoting",
    });
  };

  const isDelegated = userDelegation && userDelegation[3];

  return (
    <div className="max-w-2xl space-y-6">
      {/* Current Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Delegation Status
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Your Voting Power</p>
              <p className="text-sm text-gray-600">
                {formatEther(votingPower || 0)} tokens
              </p>
            </div>
            <User className="h-8 w-8 text-gray-400" />
          </div>

          {isDelegated ? (
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-blue-900">Delegated To</p>
                <p className="text-sm text-blue-600 font-mono">
                  {userDelegation[0]}
                </p>
                <p className="text-xs text-blue-500">
                  Since{" "}
                  {new Date(
                    Number(userDelegation[2]) * 1000
                  ).toLocaleDateString()}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-blue-500" />
            </div>
          ) : (
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="font-medium text-green-900">Direct Voting</p>
              <p className="text-sm text-green-600">
                You can vote directly on all proposals
              </p>
            </div>
          )}
        </div>

        {isDelegated && (
          <button
            onClick={handleUndelegate}
            disabled={isPending}
            className="mt-4 w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {isPending ? "Processing..." : "Remove Delegation"}
          </button>
        )}
      </div>

      {/* Delegate Voting Power */}
      {!isDelegated && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Delegate Your Voting Power
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delegate Address
              </label>
              <input
                type="text"
                value={delegateAddress}
                onChange={(e) => setDelegateAddress(e.target.value)}
                className="w-full rounded-md border-gray-300"
                placeholder="0x..."
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-700 font-medium">
                    Important:
                  </p>
                  <ul className="text-sm text-yellow-600 mt-1 list-disc list-inside">
                    <li>
                      You will not be able to vote directly while delegated
                    </li>
                    <li>Your delegate can vote with your full token balance</li>
                    <li>You can remove delegation at any time</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={handleDelegate}
              disabled={!delegateAddress || isPending}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? "Processing..." : "Delegate Voting Power"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Analytics Tab Component
function AnalyticsTab({ contractAddress, contractABI, activeProposals }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Governance Activity
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Active Proposals</span>
              <span className="font-semibold">
                {activeProposals ? activeProposals.length : 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">This Month</span>
              <span className="font-semibold">5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Success Rate</span>
              <span className="font-semibold text-green-600">78%</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Participation
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Avg. Turnout</span>
              <span className="font-semibold">45%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Voters</span>
              <span className="font-semibold">127</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delegations</span>
              <span className="font-semibold">23</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Proposal Types
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Financial</span>
              <span className="font-semibold">40%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Operational</span>
              <span className="font-semibold">35%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Strategic</span>
              <span className="font-semibold">25%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Governance Activity
        </h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="font-medium">Proposal #15 Executed</p>
              <p className="text-sm text-gray-600">
                Monthly dividend distribution approved - 3.2 ETH distributed
              </p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <Clock className="h-8 w-8 text-blue-500" />
            <div>
              <p className="font-medium">Proposal #16 Active</p>
              <p className="text-sm text-gray-600">
                Update operating hours for weekend service
              </p>
              <p className="text-xs text-gray-500">5 days remaining</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Proposal Detail Modal Component
function ProposalDetailModal({
  proposalId,
  contractAddress,
  contractABI,
  onClose,
}) {
  // This would show detailed proposal information in a modal
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Proposal #{proposalId.toString()}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        {/* Detailed proposal content would go here */}
        <p className="text-gray-600">Detailed proposal information...</p>
      </div>
    </div>
  );
}

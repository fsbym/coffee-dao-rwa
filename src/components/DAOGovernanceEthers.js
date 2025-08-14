"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "./Web3Context";
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
  User,
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

export function DAOGovernance({ contractAddress, currentProposalId }) {
  const { account, isConnected, readContract, writeContract } = useWeb3();
  const [activeTab, setActiveTab] = useState("proposals");
  const [showCreateProposal, setShowCreateProposal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [userBalance, setUserBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  // Form states
  const [newProposal, setNewProposal] = useState({
    title: "",
    description: "",
    type: 0,
    urgency: 1,
  });

  // Load proposals
  useEffect(() => {
    loadProposals();
    loadUserBalance();
  }, [isConnected, account, currentProposalId]);

  const loadProposals = async () => {
    if (!isConnected || !readContract) return;

    try {
      setLoading(true);
      const proposalIds = await readContract("getAllProposalIds");
      
      if (proposalIds && proposalIds.length > 0) {
        const proposalData = await Promise.all(
          proposalIds.map(async (id) => {
            const proposal = await readContract("getProposal", [id]);
            const hasVoted = account ? await readContract("hasVoted", [id, account]) : false;
            
            return {
              id: Number(id),
              title: proposal[0],
              description: proposal[1],
              votingDeadline: Number(proposal[2]),
              forVotes: proposal[3],
              againstVotes: proposal[4],
              executed: proposal[5],
              passed: proposal[6],
              hasVoted,
              isActive: Number(proposal[2]) > Math.floor(Date.now() / 1000),
            };
          })
        );
        setProposals(proposalData.reverse()); // Show newest first
      }
    } catch (error) {
      console.error("Error loading proposals:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserBalance = async () => {
    if (!isConnected || !account || !readContract) return;

    try {
      const balance = await readContract("balanceOf", [account]);
      setUserBalance(balance ? Number(ethers.formatEther(balance)) : 0);
    } catch (error) {
      console.error("Error loading user balance:", error);
    }
  };

  const handleCreateProposal = async () => {
    if (!writeContract || !newProposal.title || !newProposal.description) return;

    try {
      setLoading(true);
      
      // Calculate voting period based on urgency
      const votingPeriods = {
        0: 14 * 24 * 60 * 60, // 14 days
        1: 7 * 24 * 60 * 60,  // 7 days
        2: 3 * 24 * 60 * 60,  // 3 days
        3: 24 * 60 * 60,      // 24 hours
      };

      const votingPeriod = votingPeriods[newProposal.urgency];

      const tx = await writeContract("createProposal", [
        newProposal.title,
        newProposal.description,
        votingPeriod,
      ]);

      console.log("Proposal creation transaction:", tx);
      
      // Reset form and close modal
      setNewProposal({ title: "", description: "", type: 0, urgency: 1 });
      setShowCreateProposal(false);
      
      // Reload proposals after a delay
      setTimeout(() => {
        loadProposals();
      }, 3000);

    } catch (error) {
      console.error("Error creating proposal:", error);
      alert("Failed to create proposal: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (proposalId, support) => {
    if (!writeContract) return;

    try {
      setLoading(true);
      const tx = await writeContract("vote", [proposalId, support]);
      console.log("Vote transaction:", tx);
      
      // Reload proposals after a delay
      setTimeout(() => {
        loadProposals();
      }, 3000);

    } catch (error) {
      console.error("Error voting:", error);
      alert("Failed to vote: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteProposal = async (proposalId) => {
    if (!writeContract) return;

    try {
      setLoading(true);
      const tx = await writeContract("executeProposal", [proposalId]);
      console.log("Execute proposal transaction:", tx);
      
      // Reload proposals after a delay
      setTimeout(() => {
        loadProposals();
      }, 3000);

    } catch (error) {
      console.error("Error executing proposal:", error);
      alert("Failed to execute proposal: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeRemaining = (deadline) => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = deadline - now;
    
    if (remaining <= 0) return "Voting ended";
    
    const days = Math.floor(remaining / (24 * 60 * 60));
    const hours = Math.floor((remaining % (24 * 60 * 60)) / (60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Users className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Connect Wallet for DAO Governance
          </h3>
          <p className="text-gray-600">
            Please connect your wallet to participate in governance activities.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Vote className="w-5 h-5" />
            DAO Governance
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Your voting power: {userBalance.toFixed(2)} tokens
          </p>
        </div>
        <button
          onClick={() => setShowCreateProposal(true)}
          disabled={loading || userBalance < 4.69} // Need 1% of supply
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Proposal
        </button>
      </div>

      {/* Minimum token requirement notice */}
      {userBalance < 4.69 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">
              You need at least 4.69 tokens (1% of supply) to create proposals.
            </span>
          </div>
        </div>
      )}

      {/* Proposals List */}
      <div className="space-y-4">
        {loading && (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading proposals...</div>
          </div>
        )}
        
        {!loading && proposals.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <FileText className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-gray-900 font-medium">No proposals yet</h3>
            <p className="text-gray-500 text-sm">Be the first to create a proposal!</p>
          </div>
        )}

        {proposals.map((proposal) => (
          <div key={proposal.id} className="border rounded-lg p-4 hover:bg-gray-50">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">
                  #{proposal.id}: {proposal.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {proposal.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTimeRemaining(proposal.votingDeadline)}
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" />
                    {ethers.formatEther(proposal.forVotes)} For
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsDown className="w-3 h-3" />
                    {ethers.formatEther(proposal.againstVotes)} Against
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 ml-4">
                {proposal.isActive && !proposal.hasVoted && userBalance > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVote(proposal.id, true)}
                      disabled={loading}
                      className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs hover:bg-green-200 disabled:opacity-50"
                    >
                      Vote For
                    </button>
                    <button
                      onClick={() => handleVote(proposal.id, false)}
                      disabled={loading}
                      className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs hover:bg-red-200 disabled:opacity-50"
                    >
                      Vote Against
                    </button>
                  </div>
                )}
                
                {!proposal.isActive && !proposal.executed && (
                  <button
                    onClick={() => handleExecuteProposal(proposal.id)}
                    disabled={loading}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs hover:bg-blue-200 disabled:opacity-50"
                  >
                    Execute
                  </button>
                )}
                
                <div className="flex items-center gap-1 text-xs">
                  {proposal.executed ? (
                    proposal.passed ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        Passed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600">
                        <XCircle className="w-3 h-3" />
                        Failed
                      </span>
                    )
                  ) : proposal.isActive ? (
                    <span className="flex items-center gap-1 text-blue-600">
                      <Clock className="w-3 h-3" />
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-orange-600">
                      <Clock className="w-3 h-3" />
                      Pending
                    </span>
                  )}
                  
                  {proposal.hasVoted && (
                    <span className="text-gray-500">• Voted</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Proposal Modal */}
      {showCreateProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Proposal</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newProposal.title}
                  onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Proposal title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newProposal.description}
                  onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Detailed description of the proposal"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Urgency Level
                </label>
                <select
                  value={newProposal.urgency}
                  onChange={(e) => setNewProposal({ ...newProposal, urgency: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.entries(URGENCY_LEVELS).map(([key, level]) => (
                    <option key={key} value={key}>
                      {level.name} - {level.duration}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateProposal(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProposal}
                disabled={loading || !newProposal.title || !newProposal.description}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Proposal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
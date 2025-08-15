"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../components/Web3Context";
import { ConnectWallet } from "../components/ConnectWallet";
import { DAOGovernance } from "../components/DAOGovernanceEthers";
import {
  Building2,
  DollarSign,
  Users,
  TrendingUp,
  FileText,
  Vote,
  Coins,
  RefreshCw,
} from "lucide-react";

export default function Home() {
  const { account, isConnected, contractAddress, readContract, writeContract } = useWeb3();
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Contract data state
  const [assetInfo, setAssetInfo] = useState(null);
  const [totalSupply, setTotalSupply] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(null);
  const [tokenValue, setTokenValue] = useState(null);
  const [unclaimedDividends, setUnclaimedDividends] = useState(null);
  const [currentReportId, setCurrentReportId] = useState(null);
  const [currentProposalId, setCurrentProposalId] = useState(null);
  const [contractConnected, setContractConnected] = useState(false);
  const [buyAmount, setBuyAmount] = useState("");
  const [buying, setBuying] = useState(false);
  const [tokenPrice, setTokenPrice] = useState(null);

  // Load contract data
  useEffect(() => {
    const loadContractData = async () => {
      try {
        // Load basic contract data (complete contract)
        const [assetData, supply, value, reportId, proposalId, price] = await Promise.all([
          readContract("getAssetInfo"),
          readContract("totalSupply"),
          readContract("getTokenValue"),
          readContract("currentReportId"),
          readContract("currentProposalId"),
          readContract("tokenPrice"),
        ]);

        // Use loaded data if available, otherwise use static demo data
        setAssetInfo(
          assetData || [
            "North York Coffee Collective",
            "5120 Yonge St, North York, Toronto, ON",
            "Premium artisanal coffee roaster and café serving the North York community",
            ethers.parseEther("937.5"), // 937.5 ETH
            5000, // 50%
            true, // isVerified
          ]
        );

        setTotalSupply(supply || ethers.parseEther("468.75"));
        setTokenValue(value || ethers.parseEther("0.002")); // 1 token = 0.002 ETH
        setCurrentReportId(reportId || 0);
        setCurrentProposalId(proposalId || 0);
        setTokenPrice(price || ethers.parseEther("0.002"));

        // Check if we got real data from contract
        setContractConnected(!!assetData && !!supply);

        // Load user-specific data if connected
        if (isConnected && account) {
          const balance = await readContract("balanceOf", [account]);
          setTokenBalance(balance || ethers.parseEther("0")); // User balance
          setUnclaimedDividends(ethers.parseEther("0")); // No dividends in simplified contract
        }
      } catch (error) {
        console.error("Error loading contract data:", error);

        // Set demo data as fallback
        setAssetInfo([
          "North York Coffee Collective",
          "5120 Yonge St, North York, Toronto, ON",
          "Premium artisanal coffee roaster and café serving the North York community",
          ethers.parseEther("937.5"),
          5000,
          true,
        ]);
        setTotalSupply(ethers.parseEther("468750"));
        setTokenValue(ethers.parseEther("0.002"));
        setCurrentReportId(3);
        setCurrentProposalId(2);
      }
    };

    loadContractData();
  }, [readContract, isConnected, account, refreshTrigger]);

  // Refresh function
  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleBuyTokens = async () => {
    if (!writeContract || !buyAmount || !tokenPrice) return;

    try {
      setBuying(true);
      
      // Parse the token amount (user input) to BigInt with 18 decimals
      const tokensToMint = ethers.parseEther(buyAmount);
      
      // Calculate total cost exactly like the fixed contract does:
      // totalCost = (_tokenAmount * tokenPrice) / 1e18
      // tokensToMint is in wei (1e18), tokenPrice is in wei (0.001e18)
      // So totalCost = (tokensToMint * tokenPrice) / 1e18
      const totalCost = (tokensToMint * tokenPrice) / BigInt(10**18);

      console.log("Buying tokens:", {
        buyAmount,
        tokensToMint: tokensToMint.toString(),
        tokenPrice: tokenPrice.toString(),
        tokenPriceETH: ethers.formatEther(tokenPrice),
        totalCost: totalCost.toString(),
        totalCostETH: ethers.formatEther(totalCost),
        calculationCheck: `${buyAmount} tokens * ${ethers.formatEther(tokenPrice)} ETH = ${ethers.formatEther(totalCost)} ETH`
      });

      // Ensure totalCost is a valid BigInt and > 0
      if (totalCost <= 0n) {
        throw new Error(`Invalid total cost: ${totalCost}`);
      }

      const tx = await writeContract("buyTokens", [tokensToMint], totalCost);
      console.log("Buy tokens transaction:", tx);

      // Reset form
      setBuyAmount("");
      
      // Reload data after a delay
      setTimeout(() => {
        setRefreshTrigger((prev) => prev + 1);
      }, 3000);

    } catch (error) {
      console.error("Error buying tokens:", error);
      alert("Failed to buy tokens: " + error.message);
    } finally {
      setBuying(false);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: Building2 },
    { id: "dividends", label: "Dividends", icon: DollarSign },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "governance", label: "Governance", icon: Vote },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Building2 className="h-8 w-8 text-amber-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Coffee Shop RWA
                </h1>
                <p className="text-sm text-gray-600">
                  Real World Asset Tokenization
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                title="Refresh Data"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              <ConnectWallet />
            </div>
          </div>
        </div>
      </header>


      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Asset Information Card */}
        {assetInfo && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Coffee Shop Details
                </h3>
                <p className="text-2xl font-bold text-amber-600">
                  {assetInfo[0]}
                </p>
                <p className="text-gray-600">{assetInfo[1]}</p>
                <p className="text-sm text-gray-500 mt-2">{assetInfo[2]}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Total Valuation
                </h3>
                <p className="text-2xl font-bold text-green-600">
                  {assetInfo && assetInfo[3]
                    ? `${ethers.formatEther(assetInfo[3])} ETH`
                    : "Loading..."}
                </p>
                <p className="text-sm text-gray-500">
                  Tokenized:{" "}
                  {assetInfo[4] ? `${Number(assetInfo[4]) / 100}%` : "0%"}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Token Supply
                </h3>
                <p className="text-2xl font-bold text-blue-600">
                  {totalSupply ? ethers.formatEther(totalSupply) : "0"}
                </p>
                <p className="text-sm text-gray-500">Total Tokens</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Token Value
                </h3>
                <p className="text-2xl font-bold text-purple-600">
                  {tokenValue
                    ? `${ethers.formatEther(tokenValue)} ETH`
                    : "0 ETH"}
                </p>
                <p className="text-sm text-gray-500">Per Token</p>
              </div>
            </div>

            {assetInfo[5] && (
              <div className="mt-4 flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-700 font-medium">
                  Asset Verified
                </span>
              </div>
            )}
          </div>
        )}

        {/* User Portfolio (if connected) */}
        {isConnected && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Your Portfolio
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Coins className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-700">Token Holdings</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {tokenBalance ? ethers.formatEther(tokenBalance) : "0"}
                </p>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Portfolio Value</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {tokenBalance && tokenValue
                    ? `${ethers.formatEther(
                        (BigInt(tokenBalance) * BigInt(tokenValue)) /
                          BigInt(10 ** 18)
                      )} ETH`
                    : "0 ETH"}
                </p>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-700">Unclaimed Dividends</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {unclaimedDividends
                    ? `${ethers.formatEther(unclaimedDividends)} ETH`
                    : "0 ETH"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Buy Tokens Section (if connected) */}
        {isConnected && tokenPrice && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-lg p-6 mb-8 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Coins className="h-5 w-5 text-blue-600" />
              Buy Tokens
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Current Price: {ethers.formatEther(tokenPrice)} ETH per token
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Need 4.69 tokens minimum to create governance proposals
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of tokens to buy
                    </label>
                    <input
                      type="number"
                      value={buyAmount}
                      onChange={(e) => setBuyAmount(e.target.value)}
                      placeholder="e.g. 10"
                      min="0"
                      step="0.1"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  {buyAmount && (
                    <div className="bg-white rounded-lg p-3 border">
                      <p className="text-sm text-gray-600">
                        Total Cost: <span className="font-semibold text-blue-600">
                          {(parseFloat(buyAmount) * parseFloat(ethers.formatEther(tokenPrice))).toFixed(4)} ETH
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <button
                  onClick={handleBuyTokens}
                  disabled={buying || !buyAmount || parseFloat(buyAmount) <= 0}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg font-medium"
                >
                  {buying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Buying...
                    </>
                  ) : (
                    <>
                      <Coins className="w-5 h-5" />
                      Buy Tokens
                    </>
                  )}
                </button>
                {buyAmount && parseFloat(buyAmount) >= 4.69 && (
                  <p className="text-xs text-green-600 mt-2 text-center">
                    ✓ Sufficient tokens for governance participation
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? "border-amber-500 text-amber-600"
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
          <div className="p-6">
            {activeTab === "overview" && (
              <OverviewTab
                assetInfo={assetInfo}
                totalSupply={totalSupply}
                tokenValue={tokenValue}
                currentReportId={currentReportId}
                currentProposalId={currentProposalId}
              />
            )}

            {activeTab === "dividends" && (
              <DividendsTab
                address={account}
                isConnected={isConnected}
                contractAddress={contractAddress}
                unclaimedDividends={unclaimedDividends}
              />
            )}

            {activeTab === "reports" && (
              <ReportsTab
                contractAddress={contractAddress}
                currentReportId={currentReportId}
              />
            )}

            {activeTab === "governance" && (
              <DAOGovernance
                contractAddress={contractAddress}
                currentProposalId={currentProposalId}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({
  assetInfo,
  totalSupply,
  tokenValue,
  currentReportId,
  currentProposalId,
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Platform Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Supply</p>
                <p className="text-2xl font-bold">
                  {totalSupply
                    ? Math.floor(Number(ethers.formatEther(totalSupply)))
                    : 0}
                </p>
              </div>
              <Coins className="h-8 w-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Token Value</p>
                <p className="text-2xl font-bold">
                  {tokenValue
                    ? `${Number(ethers.formatEther(tokenValue)).toFixed(4)}`
                    : "0.0000"}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Reports</p>
                <p className="text-2xl font-bold">
                  {currentReportId ? Number(currentReportId) : 0}
                </p>
              </div>
              <FileText className="h-8 w-8 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Proposals</p>
                <p className="text-2xl font-bold">
                  {currentProposalId ? Number(currentProposalId) : 0}
                </p>
              </div>
              <Vote className="h-8 w-8 text-orange-200" />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          About Coffee Shop RWA
        </h3>
        <div className="prose max-w-none">
          <p className="text-gray-600 mb-4">
            Coffee Shop RWA is a revolutionary platform that enables real-world
            asset tokenization for coffee shops. By purchasing tokens, you
            become a shareholder in the actual coffee shop business and receive
            dividends from the shop's profits.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Key Benefits:
              </h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Receive monthly dividend payments</li>
                <li>Participate in governance decisions</li>
                <li>Trade tokens on secondary markets</li>
                <li>Transparent financial reporting</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                How It Works:
              </h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Coffee shop tokenizes part of their business</li>
                <li>Investors buy tokens representing ownership</li>
                <li>Monthly profits are distributed as dividends</li>
                <li>Token holders vote on major decisions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dividends Tab Component
function DividendsTab({
  address,
  isConnected,
  contractAddress,
  unclaimedDividends,
}) {
  const { writeContract } = useWeb3();
  const [isPending, setIsPending] = useState(false);

  const handleClaimDividends = async () => {
    try {
      setIsPending(true);
      const tx = await writeContract("claimAllDividends");
      await tx.wait();
      alert("Dividends claimed successfully!");
    } catch (error) {
      console.error("Error claiming dividends:", error);
      alert("Failed to claim dividends: " + error.message);
    } finally {
      setIsPending(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">
          Connect your wallet to view and claim dividends
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Your Dividends
        </h3>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 mb-2">Unclaimed Dividends</p>
              <p className="text-3xl font-bold">
                {unclaimedDividends
                  ? `${ethers.formatEther(unclaimedDividends)} ETH`
                  : "0 ETH"}
              </p>
            </div>
            <DollarSign className="h-12 w-12 text-green-200" />
          </div>

          {unclaimedDividends && Number(unclaimedDividends) > 0 && (
            <button
              onClick={handleClaimDividends}
              disabled={isPending}
              className="mt-4 bg-white text-green-600 px-6 py-2 rounded-lg font-semibold hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Claiming..." : "Claim All Dividends"}
            </button>
          )}
        </div>
      </div>

      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-4">
          Dividend Information
        </h4>
        <div className="prose max-w-none text-gray-600">
          <p>
            Dividends are distributed monthly based on the coffee shop's
            profits. The amount you receive depends on how many tokens you hold
            relative to the total supply.
          </p>
          <p className="mt-4">
            All dividend distributions are automatically calculated and can be
            claimed at any time. There's no deadline to claim your dividends -
            they remain available until you claim them.
          </p>
        </div>
      </div>
    </div>
  );
}

// Reports Tab Component
function ReportsTab({ contractAddress, currentReportId }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Financial Reports
        </h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-900">Latest Report</span>
          </div>
          <p className="text-blue-700">
            Report #{currentReportId ? Number(currentReportId) : 0} available
          </p>
          <p className="text-sm text-blue-600 mt-2">
            Financial reports are submitted monthly and include revenue,
            expenses, and profit distribution details.
          </p>
        </div>
      </div>

      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-4">
          Report Features
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">
              Monthly Reporting
            </h5>
            <p className="text-sm text-gray-600">
              Detailed monthly financial statements including revenue, expenses,
              and net profit calculations.
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">
              Transparent Auditing
            </h5>
            <p className="text-sm text-gray-600">
              All reports are verified by authorized auditors before dividend
              distribution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useAccount, useContractRead } from "wagmi";
import { CONTRACT_ABI, CONTRACT_ADDRESSES } from "@/lib/web3";
import { ConnectWallet } from "@/components/ConnectWallet";
import { TokenCard } from "@/components/TokenCard";
import { MintToken } from "@/components/MintToken";
import {
  Coffee,
  Home as HomeIcon,
  Plus,
  ShoppingBag,
  User,
} from "lucide-react";

export default function Home() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState("marketplace");
  const [tokensForSale, setTokensForSale] = useState([]);
  const [userTokens, setUserTokens] = useState([]);
  const [allTokens, setAllTokens] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Get tokens for sale
  const { data: forSaleTokens, refetch: refetchForSale } = useContractRead({
    address: CONTRACT_ADDRESSES.sepolia,
    abi: CONTRACT_ABI,
    functionName: "getTokensForSale",
  });

  // Get user tokens
  const { data: userTokenIds, refetch: refetchUserTokens } = useContractRead({
    address: CONTRACT_ADDRESSES.sepolia,
    abi: CONTRACT_ABI,
    functionName: "getTokensByOwner",
    args: [address],
    enabled: !!address,
  });

  // Refresh data
  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    refetchForSale();
    refetchUserTokens();
  };

  // Handle mint success
  const handleMintSuccess = () => {
    handleRefresh();
  };

  // Handle token update
  const handleTokenUpdate = () => {
    handleRefresh();
  };

  // Re-fetch when data updates
  useEffect(() => {
    if (forSaleTokens) {
      setTokensForSale(forSaleTokens);
    }
  }, [forSaleTokens, refreshKey]);

  useEffect(() => {
    if (userTokenIds) {
      setUserTokens(userTokenIds);
    }
  }, [userTokenIds, refreshKey]);

  // Merge all tokens for display
  useEffect(() => {
    const all = [...new Set([...tokensForSale, ...userTokens])];
    setAllTokens(all);
  }, [tokensForSale, userTokens]);

  const renderTokens = (tokenIds) => {
    if (!tokenIds || tokenIds.length === 0) {
      return (
        <div className="text-center py-12">
          <Coffee className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Tokens</h3>
          <p className="text-gray-600">No tokens have been minted yet</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tokenIds.map((tokenId) => (
          <TokenCard
            key={tokenId}
            tokenId={tokenId}
            onUpdate={handleTokenUpdate}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Coffee className="w-6 h-6 text-primary-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Coffee DAO RWA
              </h1>
            </div>

            {/* Wallet connection */}
            <ConnectWallet />
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab navigation */}
        <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm mb-8">
          <button
            onClick={() => setActiveTab("marketplace")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "marketplace"
                ? "bg-primary-100 text-primary-700"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <HomeIcon className="w-4 h-4" />
            Marketplace
          </button>
          <button
            onClick={() => setActiveTab("mint")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "mint"
                ? "bg-primary-100 text-primary-700"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Plus className="w-4 h-4" />
            Mint
          </button>
          {isConnected && (
            <button
              onClick={() => setActiveTab("my-tokens")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "my-tokens"
                  ? "bg-primary-100 text-primary-700"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <User className="w-4 h-4" />
              My Tokens
            </button>
          )}
        </div>

        {/* Tab content */}
        <div className="space-y-8">
          {/* Marketplace page */}
          {activeTab === "marketplace" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Coffee Token Marketplace
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Discover and trade unique coffee tokens
                  </p>
                </div>
                <button onClick={handleRefresh} className="btn-secondary">
                  Refresh
                </button>
              </div>

              {/* Tokens for sale */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Tokens for Sale ({tokensForSale?.length || 0})
                </h3>
                {renderTokens(tokensForSale)}
              </div>

              {/* All tokens */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Coffee className="w-5 h-5" />
                  All Tokens ({allTokens?.length || 0})
                </h3>
                {renderTokens(allTokens)}
              </div>
            </div>
          )}

          {/* Mint page */}
          {activeTab === "mint" && (
            <div className="max-w-2xl mx-auto">
              <MintToken onSuccess={handleMintSuccess} />
            </div>
          )}

          {/* My tokens page */}
          {activeTab === "my-tokens" && isConnected && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    My Tokens
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Manage your coffee tokens
                  </p>
                </div>
                <button onClick={handleRefresh} className="btn-secondary">
                  Refresh
                </button>
              </div>
              {renderTokens(userTokens)}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">
              © 2024 Coffee DAO RWA. Blockchain-based coffee tokenization
              platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

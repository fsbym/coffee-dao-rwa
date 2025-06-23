"use client";

import { useState, useEffect } from "react";
import { useAccount, useContractRead } from "wagmi";
import { CONTRACT_ABI, CONTRACT_ADDRESSES } from "@/lib/web3";
import { ConnectWallet } from "@/components/ConnectWallet";
import { TokenCard } from "@/components/TokenCard";
import { MintToken } from "@/components/MintToken";
import { Coffee, Home, Plus, ShoppingBag, User } from "lucide-react";

export default function Home() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState("marketplace");
  const [tokensForSale, setTokensForSale] = useState([]);
  const [userTokens, setUserTokens] = useState([]);
  const [allTokens, setAllTokens] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // 获取在售代币
  const { data: forSaleTokens, refetch: refetchForSale } = useContractRead({
    address: CONTRACT_ADDRESSES.sepolia,
    abi: CONTRACT_ABI,
    functionName: "getTokensForSale",
  });

  // 获取用户代币
  const { data: userTokenIds, refetch: refetchUserTokens } = useContractRead({
    address: CONTRACT_ADDRESSES.sepolia,
    abi: CONTRACT_ABI,
    functionName: "getTokensByOwner",
    args: [address],
    enabled: !!address,
  });

  // 刷新数据
  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    refetchForSale();
    refetchUserTokens();
  };

  // 处理铸造成功
  const handleMintSuccess = () => {
    handleRefresh();
  };

  // 处理代币更新
  const handleTokenUpdate = () => {
    handleRefresh();
  };

  // 当数据更新时重新获取
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

  // 合并所有代币用于展示
  useEffect(() => {
    const all = [...new Set([...tokensForSale, ...userTokens])];
    setAllTokens(all);
  }, [tokensForSale, userTokens]);

  const renderTokens = (tokenIds) => {
    if (!tokenIds || tokenIds.length === 0) {
      return (
        <div className="text-center py-12">
          <Coffee className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无代币</h3>
          <p className="text-gray-600">还没有代币被铸造</p>
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
      {/* 导航栏 */}
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

            {/* 钱包连接 */}
            <ConnectWallet />
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 标签页导航 */}
        <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm mb-8">
          <button
            onClick={() => setActiveTab("marketplace")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "marketplace"
                ? "bg-primary-100 text-primary-700"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Home className="w-4 h-4" />
            市场
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
            铸造
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
              我的代币
            </button>
          )}
        </div>

        {/* 标签页内容 */}
        <div className="space-y-8">
          {/* 市场页面 */}
          {activeTab === "marketplace" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    咖啡代币市场
                  </h2>
                  <p className="text-gray-600 mt-1">发现和交易独特的咖啡代币</p>
                </div>
                <button onClick={handleRefresh} className="btn-secondary">
                  刷新
                </button>
              </div>

              {/* 在售代币 */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  在售代币 ({tokensForSale?.length || 0})
                </h3>
                {renderTokens(tokensForSale)}
              </div>

              {/* 所有代币 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Coffee className="w-5 h-5" />
                  所有代币 ({allTokens?.length || 0})
                </h3>
                {renderTokens(allTokens)}
              </div>
            </div>
          )}

          {/* 铸造页面 */}
          {activeTab === "mint" && (
            <div className="max-w-2xl mx-auto">
              <MintToken onSuccess={handleMintSuccess} />
            </div>
          )}

          {/* 我的代币页面 */}
          {activeTab === "my-tokens" && isConnected && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">我的代币</h2>
                  <p className="text-gray-600 mt-1">管理你拥有的咖啡代币</p>
                </div>
                <button onClick={handleRefresh} className="btn-secondary">
                  刷新
                </button>
              </div>
              {renderTokens(userTokens)}
            </div>
          )}
        </div>
      </div>

      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">
              © 2024 Coffee DAO RWA. 基于区块链的咖啡代币化平台。
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

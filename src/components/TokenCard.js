"use client";

import { useState } from "react";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { parseEther, formatEther } from "viem";
import { CONTRACT_ABI, CONTRACT_ADDRESSES } from "@/lib/web3";
import { Coffee, ShoppingCart, Tag, User, Calendar } from "lucide-react";

export function TokenCard({ tokenId, onUpdate }) {
  const { address } = useAccount();
  const [price, setPrice] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // 读取代币元数据
  const { data: metadata, isLoading } = useContractRead({
    address: CONTRACT_ADDRESSES.sepolia, // 使用测试网地址
    abi: CONTRACT_ABI,
    functionName: "getTokenMetadata",
    args: [tokenId],
  });

  // 读取代币价格
  const { data: tokenPrice } = useContractRead({
    address: CONTRACT_ADDRESSES.sepolia,
    abi: CONTRACT_ABI,
    functionName: "tokenPrice",
  });

  // 购买代币
  const { write: buyToken, data: buyData } = useContractWrite({
    address: CONTRACT_ADDRESSES.sepolia,
    abi: CONTRACT_ABI,
    functionName: "buyToken",
  });

  // 列出代币出售
  const { write: listToken, data: listData } = useContractWrite({
    address: CONTRACT_ADDRESSES.sepolia,
    abi: CONTRACT_ABI,
    functionName: "listToken",
  });

  // 取消出售
  const { write: cancelSale, data: cancelData } = useContractWrite({
    address: CONTRACT_ADDRESSES.sepolia,
    abi: CONTRACT_ABI,
    functionName: "cancelSale",
  });

  // 等待交易完成
  useWaitForTransaction({
    hash: buyData?.hash,
    onSuccess: () => {
      onUpdate?.();
    },
  });

  useWaitForTransaction({
    hash: listData?.hash,
    onSuccess: () => {
      setIsEditing(false);
      setPrice("");
      onUpdate?.();
    },
  });

  useWaitForTransaction({
    hash: cancelData?.hash,
    onSuccess: () => {
      onUpdate?.();
    },
  });

  if (isLoading || !metadata) {
    return (
      <div className="card animate-pulse">
        <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  const isOwner = address === metadata.owner;
  const isForSale = metadata.isForSale;

  const handleBuy = () => {
    if (metadata.price) {
      buyToken({
        args: [tokenId],
        value: metadata.price,
      });
    }
  };

  const handleList = () => {
    if (price) {
      listToken({
        args: [tokenId, parseEther(price)],
      });
    }
  };

  const handleCancel = () => {
    cancelSale({
      args: [tokenId],
    });
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      {/* 代币图片 */}
      <div className="relative mb-4">
        <img
          src={metadata.image || "/placeholder-coffee.jpg"}
          alt={metadata.name}
          className="w-full h-48 object-cover rounded-lg"
          onError={(e) => {
            e.target.src = "/placeholder-coffee.jpg";
          }}
        />
        {isForSale && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-sm font-medium">
            在售
          </div>
        )}
      </div>

      {/* 代币信息 */}
      <div className="space-y-3">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            {metadata.name}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2">
            {metadata.description}
          </p>
        </div>

        {/* 价格信息 */}
        {isForSale && metadata.price && (
          <div className="flex items-center gap-2 text-lg font-semibold text-primary-600">
            <Tag className="w-5 h-5" />
            <span>{formatEther(metadata.price)} ETH</span>
          </div>
        )}

        {/* 所有者信息 */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <User className="w-4 h-4" />
          <span className="font-mono">
            {metadata.owner.slice(0, 6)}...{metadata.owner.slice(-4)}
          </span>
        </div>

        {/* 创建时间 */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>
            {new Date(metadata.createdAt * 1000).toLocaleDateString()}
          </span>
        </div>

        {/* 操作按钮 */}
        <div className="pt-4 space-y-2">
          {isOwner ? (
            // 所有者操作
            <div className="space-y-2">
              {!isForSale ? (
                // 未在售，可以列出
                <div className="space-y-2">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="number"
                        placeholder="输入价格 (ETH)"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="input-field"
                        step="0.001"
                        min="0"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleList}
                          disabled={!price}
                          className="btn-primary flex-1"
                        >
                          确认出售
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="btn-secondary flex-1"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn-primary w-full"
                    >
                      <Tag className="w-4 h-4 mr-2" />
                      列出出售
                    </button>
                  )}
                </div>
              ) : (
                // 已在售，可以取消
                <button onClick={handleCancel} className="btn-secondary w-full">
                  取消出售
                </button>
              )}
            </div>
          ) : (
            // 非所有者操作
            isForSale && (
              <button
                onClick={handleBuy}
                disabled={!metadata.price}
                className="btn-primary w-full"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                购买代币
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

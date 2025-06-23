"use client";

import { useState } from "react";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther, formatEther } from "viem";
import { CONTRACT_ABI, CONTRACT_ADDRESSES } from "@/lib/web3";
import { Coffee, ShoppingCart, Tag, User, Calendar } from "lucide-react";

export function TokenCard({ tokenId, onUpdate }) {
  const { address } = useAccount();
  const [price, setPrice] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Read token metadata
  const { data: metadata, isLoading } = useContractRead({
    address: CONTRACT_ADDRESSES.sepolia, // Use testnet address
    abi: CONTRACT_ABI,
    functionName: "getTokenMetadata",
    args: [tokenId],
  });

  // Read token price
  const { data: tokenPrice } = useContractRead({
    address: CONTRACT_ADDRESSES.sepolia,
    abi: CONTRACT_ABI,
    functionName: "tokenPrice",
  });

  // Buy token
  const { write: buyToken, data: buyData } = useContractWrite({
    address: CONTRACT_ADDRESSES.sepolia,
    abi: CONTRACT_ABI,
    functionName: "buyToken",
  });

  // List token for sale
  const { write: listToken, data: listData } = useContractWrite({
    address: CONTRACT_ADDRESSES.sepolia,
    abi: CONTRACT_ABI,
    functionName: "listToken",
  });

  // Cancel sale
  const { write: cancelSale, data: cancelData } = useContractWrite({
    address: CONTRACT_ADDRESSES.sepolia,
    abi: CONTRACT_ABI,
    functionName: "cancelSale",
  });

  // Wait for transaction completion
  useWaitForTransactionReceipt({
    hash: buyData?.hash,
    onSuccess: () => {
      onUpdate?.();
    },
  });

  useWaitForTransactionReceipt({
    hash: listData?.hash,
    onSuccess: () => {
      setIsEditing(false);
      setPrice("");
      onUpdate?.();
    },
  });

  useWaitForTransactionReceipt({
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
      {/* Token image */}
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
            For Sale
          </div>
        )}
      </div>

      {/* Token information */}
      <div className="space-y-3">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            {metadata.name}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2">
            {metadata.description}
          </p>
        </div>

        {/* Price information */}
        {isForSale && metadata.price && (
          <div className="flex items-center gap-2 text-lg font-semibold text-primary-600">
            <Tag className="w-5 h-5" />
            <span>{formatEther(metadata.price)} ETH</span>
          </div>
        )}

        {/* Owner information */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <User className="w-4 h-4" />
          <span className="font-mono">
            {metadata.owner.slice(0, 6)}...{metadata.owner.slice(-4)}
          </span>
        </div>

        {/* Creation time */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>
            {new Date(metadata.createdAt * 1000).toLocaleDateString()}
          </span>
        </div>

        {/* Action buttons */}
        <div className="pt-4 space-y-2">
          {isOwner ? (
            // Owner actions
            <div className="space-y-2">
              {!isForSale ? (
                // Not for sale, can list
                <div className="space-y-2">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="number"
                        placeholder="Enter price (ETH)"
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
                          Confirm Sale
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="btn-secondary flex-1"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn-primary w-full"
                    >
                      <Tag className="w-4 h-4 mr-2" />
                      List for Sale
                    </button>
                  )}
                </div>
              ) : (
                // Already for sale, can cancel
                <button onClick={handleCancel} className="btn-secondary w-full">
                  Cancel Sale
                </button>
              )}
            </div>
          ) : (
            // Non-owner actions
            isForSale && (
              <button
                onClick={handleBuy}
                disabled={!metadata.price}
                className="btn-primary w-full"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Buy Token
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

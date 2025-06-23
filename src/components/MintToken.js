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
import { Coffee, Upload, Plus } from "lucide-react";

export function MintToken({ onSuccess }) {
  const { address, isConnected } = useAccount();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    tokenURI: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // 读取代币价格
  const { data: tokenPrice } = useContractRead({
    address: CONTRACT_ADDRESSES.sepolia,
    abi: CONTRACT_ABI,
    functionName: "tokenPrice",
  });

  // 铸造代币
  const { write: mintToken, data: mintData } = useContractWrite({
    address: CONTRACT_ADDRESSES.sepolia,
    abi: CONTRACT_ABI,
    functionName: "mint",
  });

  // 等待交易完成
  useWaitForTransaction({
    hash: mintData?.hash,
    onSuccess: () => {
      setIsLoading(false);
      setFormData({ name: "", description: "", image: "", tokenURI: "" });
      onSuccess?.();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isConnected || !address) return;

    setIsLoading(true);
    mintToken({
      args: [
        address,
        formData.tokenURI,
        formData.name,
        formData.description,
        formData.image,
      ],
      value: tokenPrice || parseEther("0.01"),
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!isConnected) {
    return (
      <div className="card text-center">
        <Coffee className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2">连接钱包</h3>
        <p className="text-gray-600">请先连接钱包来铸造代币</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-100 rounded-lg">
          <Plus className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">铸造新代币</h2>
          <p className="text-gray-600">创建你的咖啡代币</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 代币名称 */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            代币名称 *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="例如：埃塞俄比亚耶加雪菲"
            className="input-field"
            required
          />
        </div>

        {/* 代币描述 */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            代币描述 *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="描述你的咖啡代币..."
            rows="3"
            className="input-field resize-none"
            required
          />
        </div>

        {/* 代币图片 */}
        <div>
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            代币图片 URL *
          </label>
          <input
            type="url"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleInputChange}
            placeholder="https://example.com/coffee-image.jpg"
            className="input-field"
            required
          />
        </div>

        {/* Token URI */}
        <div>
          <label
            htmlFor="tokenURI"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Token URI *
          </label>
          <input
            type="url"
            id="tokenURI"
            name="tokenURI"
            value={formData.tokenURI}
            onChange={handleInputChange}
            placeholder="https://example.com/metadata.json"
            className="input-field"
            required
          />
        </div>

        {/* 价格信息 */}
        {tokenPrice && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">铸造费用</span>
              <span className="font-semibold text-primary-600">
                {formatEther(tokenPrice)} ETH
              </span>
            </div>
          </div>
        )}

        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={
            isLoading ||
            !formData.name ||
            !formData.description ||
            !formData.image ||
            !formData.tokenURI
          }
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              铸造中...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Coffee className="w-4 h-4 mr-2" />
              铸造代币
            </div>
          )}
        </button>
      </form>

      {/* 提示信息 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">💡 提示</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 确保图片URL可以正常访问</li>
          <li>• Token URI应指向包含元数据的JSON文件</li>
          <li>• 铸造费用将用于平台维护</li>
        </ul>
      </div>
    </div>
  );
}

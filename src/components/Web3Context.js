"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ABI } from "@/lib/web3";

// 合约地址配置 - 优先使用环境变量
const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const Web3Context = createContext();

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
}

export function Web3ContextProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Contract address
  const contractAddress = CONTRACT_ADDRESS;

  // Initialize provider
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(web3Provider);
    }
  }, []);

  // Check connection on mount
  useEffect(() => {
    checkConnection();
  }, [provider]);

  const checkConnection = async () => {
    if (provider) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          await connectWallet();
        }
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (!provider) return;

    try {
      // Get signer
      const web3Signer = await provider.getSigner();
      const address = await web3Signer.getAddress();

      // Create contract instance
      const contractInstance = new ethers.Contract(
        contractAddress,
        CONTRACT_ABI,
        web3Signer
      );

      setAccount(address);
      setSigner(web3Signer);
      setContract(contractInstance);
      setIsConnected(true);

      return { address, signer: web3Signer, contract: contractInstance };
    } catch (error) {
      console.error("Error connecting wallet:", error);
      throw error;
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
    setContract(null);
    setIsConnected(false);
  };

  // Contract read functions
  const readContract = async (functionName, args = []) => {
    if (!contract) {
      console.warn("Contract not initialized");
      return null;
    }

    try {
      const result = await contract[functionName](...args);
      return result;
    } catch (error) {
      console.error(`Error reading ${functionName}:`, error);

      // 检查是否是网络连接问题
      if (error.message.includes("could not decode result data")) {
        console.error("Contract may not be deployed on current network");
        console.error("Contract address:", contractAddress);
        console.error(
          "Make sure Hardhat local node is running and contract is deployed"
        );
      }

      return null;
    }
  };

  // Contract write functions
  const writeContract = async (functionName, args = [], value = null) => {
    if (!contract) throw new Error("Wallet not connected");

    try {
      const options = {};
      if (value) options.value = value;

      const tx = await contract[functionName](...args, options);
      return tx;
    } catch (error) {
      console.error(`Error writing ${functionName}:`, error);
      throw error;
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          connectWallet();
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, []);

  const value = {
    account,
    provider,
    signer,
    contract,
    isConnected,
    contractAddress,
    connectWallet,
    disconnectWallet,
    readContract,
    writeContract,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

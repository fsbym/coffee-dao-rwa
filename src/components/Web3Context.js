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

  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia testnet chain ID
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xaa36a7',
                chainName: 'Sepolia Testnet',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://rpc.sepolia.org'],
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
        } catch (addError) {
          console.error('Failed to add Sepolia network:', addError);
          throw addError;
        }
      } else {
        console.error('Failed to switch to Sepolia network:', switchError);
        throw switchError;
      }
    }
  };

  const connectWallet = async () => {
    if (!provider) return;

    try {
      // Check and switch to Sepolia network
      await switchToSepolia();

      // Request account access
      await window.ethereum.request({ method: "eth_requestAccounts" });

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
    // List of Sepolia RPC endpoints to try
    const rpcEndpoints = [
      'https://eth-sepolia.g.alchemy.com/v2/0lq3XO8ACaCFnnxPuZIof',
      'https://rpc.sepolia.org',
      'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'
    ];

    for (const rpcUrl of rpcEndpoints) {
      try {
        console.log(`Trying RPC: ${rpcUrl.includes('alchemy') ? 'Alchemy' : rpcUrl.includes('infura') ? 'Infura' : 'Public RPC'}`);
        
        const sepoliaProvider = new ethers.JsonRpcProvider(rpcUrl);
        const readOnlyContract = new ethers.Contract(
          contractAddress,
          CONTRACT_ABI,
          sepoliaProvider
        );

        const result = await readOnlyContract[functionName](...args);
        console.log(`✅ Successfully called ${functionName} via ${rpcUrl.includes('alchemy') ? 'Alchemy' : 'other RPC'}`);
        return result;
      } catch (error) {
        console.warn(`❌ Failed with ${rpcUrl.includes('alchemy') ? 'Alchemy' : 'other RPC'}:`, error.message);
        continue; // Try next RPC
      }
    }

    console.error(`❌ All RPC endpoints failed for ${functionName}`);
    return null;
  };

  // Contract write functions
  const writeContract = async (functionName, args = [], value = null) => {
    if (!contract) throw new Error("Wallet not connected");

    try {
      const options = {};
      if (value !== null && value !== undefined) {
        options.value = value;
      }

      console.log(`Calling ${functionName} with:`, {
        args,
        options,
        valueETH: value ? ethers.formatEther(value) : '0'
      });

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

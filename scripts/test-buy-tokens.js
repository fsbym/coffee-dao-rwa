const hre = require("hardhat");

async function main() {
  const contractAddress = "0xD78336B2aFF38Fa1B6DC2b2Bd8c3d7D397426b12";
  
  console.log("🔍 Testing buyTokens function...");
  
  try {
    const [signer] = await hre.ethers.getSigners();
    const contract = await hre.ethers.getContractAt("CoffeeShopRWAComplete", contractAddress);
    
    console.log("📊 Contract info:");
    const tokenPrice = await contract.tokenPrice();
    console.log("Token Price:", hre.ethers.formatEther(tokenPrice), "ETH");
    
    // Test buying 1 token
    const tokensToBuy = hre.ethers.parseEther("1"); // 1 token in wei
    const totalCost = (tokensToBuy * tokenPrice) / BigInt(10**18);
    
    console.log("\n💰 Purchase calculation:");
    console.log("Tokens to buy:", hre.ethers.formatEther(tokensToBuy));
    console.log("Token price:", hre.ethers.formatEther(tokenPrice), "ETH");
    console.log("Total cost:", hre.ethers.formatEther(totalCost), "ETH");
    console.log("Total cost (wei):", totalCost.toString());
    
    // Check current balance
    const balance = await hre.ethers.provider.getBalance(signer.address);
    console.log("\n💳 Wallet info:");
    console.log("Signer address:", signer.address);
    console.log("ETH balance:", hre.ethers.formatEther(balance), "ETH");
    
    if (balance < totalCost) {
      console.log("❌ Insufficient balance for purchase");
      return;
    }
    
    // Try to estimate gas first
    console.log("\n⛽ Estimating gas...");
    try {
      const gasEstimate = await contract.buyTokens.estimateGas(tokensToBuy, {
        value: totalCost
      });
      console.log("Gas estimate:", gasEstimate.toString());
    } catch (gasError) {
      console.error("❌ Gas estimation failed:", gasError.message);
      
      // Let's check what the contract expects
      console.log("\n🔍 Contract expects:");
      console.log("- Token amount:", tokensToBuy.toString());
      console.log("- Value sent:", totalCost.toString());
      
      // Manual calculation check
      const expectedCost = tokensToBuy * tokenPrice / BigInt(10**18);
      console.log("- Expected cost (manual):", expectedCost.toString());
      
      return;
    }
    
    // Try actual purchase
    console.log("\n🛒 Attempting purchase...");
    const tx = await contract.buyTokens(tokensToBuy, {
      value: totalCost,
      gasLimit: 300000
    });
    
    console.log("✅ Transaction sent:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed in block:", receipt.blockNumber);
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    if (error.data) {
      console.error("Error data:", error.data);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
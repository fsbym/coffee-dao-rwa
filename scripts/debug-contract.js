const hre = require("hardhat");

async function main() {
  const contractAddress = "0x6587Fa04285eCca0a7D78EbBfBF802094F4F3B8D";
  
  try {
    const contract = await hre.ethers.getContractAt("CoffeeShopRWAComplete", contractAddress);
    
    // Get exact values from contract
    const tokenPrice = await contract.tokenPrice();
    console.log("🔍 Contract State:");
    console.log("Token Price (raw):", tokenPrice.toString());
    console.log("Token Price (ETH):", hre.ethers.formatEther(tokenPrice));
    
    // Test different token amounts
    console.log("\n📊 Testing different amounts:");
    
    const amounts = ["0.001", "0.01", "0.1", "1"];
    
    for (const amount of amounts) {
      const tokensToMint = hre.ethers.parseEther(amount);
      const calculatedCost = (tokensToMint * tokenPrice) / BigInt(10**18);
      
      console.log(`\n${amount} tokens:`);
      console.log("  Tokens (wei):", tokensToMint.toString());
      console.log("  Cost (wei):", calculatedCost.toString()); 
      console.log("  Cost (ETH):", hre.ethers.formatEther(calculatedCost));
      
      // Try to simulate what the contract does
      const contractCalculation = tokensToMint * tokenPrice;
      console.log("  Contract calc (raw):", contractCalculation.toString());
      console.log("  Contract expects (ETH):", hre.ethers.formatEther(contractCalculation));
    }
    
    // Let's also check if the calculation in the contract matches
    console.log("\n🔬 Contract Logic Analysis:");
    console.log("Contract does: totalCost = _tokenAmount * tokenPrice");
    
    const oneToken = hre.ethers.parseEther("1"); // 1e18
    const contractExpects = oneToken * tokenPrice; // 1e18 * 1e15 = 1e33
    console.log("For 1 token, contract expects:", contractExpects.toString(), "wei");
    console.log("That's:", hre.ethers.formatEther(contractExpects), "ETH");
    
    console.log("\n❗ PROBLEM FOUND!");
    console.log("We're dividing by 1e18, but contract doesn't!");
    console.log("Contract expects the RAW multiplication result!");
    
  } catch (error) {
    console.error("❌ Debug failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
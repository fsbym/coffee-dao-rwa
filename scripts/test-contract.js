const hre = require("hardhat");

async function main() {
  const contractAddress = "0x6587Fa04285eCca0a7D78EbBfBF802094F4F3B8D";
  
  console.log("🔍 Testing contract at:", contractAddress);
  
  try {
    const contract = await hre.ethers.getContractAt("CoffeeShopRWAComplete", contractAddress);
    
    console.log("📊 Contract calls:");
    
    // Test basic function calls
    const tokenPrice = await contract.tokenPrice();
    console.log("✅ Token Price:", hre.ethers.formatEther(tokenPrice), "ETH");
    
    const totalSupply = await contract.totalSupply();
    console.log("✅ Total Supply:", hre.ethers.formatEther(totalSupply));
    
    const maxSupply = await contract.maxTotalSupply();
    console.log("✅ Max Total Supply:", hre.ethers.formatEther(maxSupply));
    
    const name = await contract.name();
    console.log("✅ Token Name:", name);
    
    const symbol = await contract.symbol();
    console.log("✅ Token Symbol:", symbol);
    
    const owner = await contract.owner();
    console.log("✅ Owner:", owner);
    
    const assetInfo = await contract.getAssetInfo();
    console.log("✅ Shop Name:", assetInfo[0]);
    console.log("✅ Location:", assetInfo[1]);
    console.log("✅ Description:", assetInfo[2]);
    console.log("✅ Total Valuation:", hre.ethers.formatEther(assetInfo[3]), "ETH");
    console.log("✅ Tokenized Percentage:", assetInfo[4].toString(), "basis points");
    console.log("✅ Is Verified:", assetInfo[5]);
    
    console.log("\n🎉 All contract calls successful!");
    
  } catch (error) {
    console.error("❌ Contract test failed:", error.message);
    console.error("Full error:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
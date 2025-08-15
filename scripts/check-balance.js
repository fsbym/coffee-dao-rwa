const hre = require("hardhat");

async function main() {
  const contractAddress = "0xD78336B2aFF38Fa1B6DC2b2Bd8c3d7D397426b12";
  
  try {
    const [signer] = await hre.ethers.getSigners();
    const contract = await hre.ethers.getContractAt("CoffeeShopRWAComplete", contractAddress);
    
    console.log("📊 Contract Status:");
    console.log("Your address:", signer.address);
    
    // Get contract info
    const totalSupply = await contract.totalSupply();
    const maxSupply = await contract.maxTotalSupply();
    const yourBalance = await contract.balanceOf(signer.address);
    const owner = await contract.owner();
    
    console.log("\n💰 Token Information:");
    console.log("Total Supply:", hre.ethers.formatEther(totalSupply));
    console.log("Max Supply:", hre.ethers.formatEther(maxSupply));
    console.log("Your Balance:", hre.ethers.formatEther(yourBalance));
    console.log("Contract Owner:", owner);
    console.log("You are owner:", signer.address === owner);
    
    // Calculate percentages
    const yourPercentage = (Number(hre.ethers.formatEther(yourBalance)) / Number(hre.ethers.formatEther(totalSupply))) * 100;
    console.log("\n📈 Ownership:");
    console.log(`You own: ${yourPercentage.toFixed(2)}% of total supply`);
    
    if (yourPercentage > 99) {
      console.log("🎉 You own nearly all the tokens!");
      console.log("This is normal for a test deployment where you are the owner.");
    }
    
  } catch (error) {
    console.error("❌ Failed to check balance:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
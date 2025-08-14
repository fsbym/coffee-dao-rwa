const hre = require("hardhat");

async function main() {
  console.log("🔧 Testing step 1 contract...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const shopName = "Test Shop";
  const location = "Test Location";
  const description = "Test Description";
  const totalValuation = hre.ethers.parseEther("100");
  const tokenizedPercentage = 5000;
  const initialTokenSupply = hre.ethers.parseEther("50");

  const TestCoffeeStep1 = await hre.ethers.getContractFactory("TestCoffeeStep1");

  try {
    console.log("Deploying TestCoffeeStep1...");
    const contract = await TestCoffeeStep1.deploy(
      shopName,
      location,
      description,
      totalValuation,
      tokenizedPercentage,
      initialTokenSupply,
      { gasLimit: 3000000 }
    );

    console.log("Waiting for deployment...");
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    console.log("✅ Contract deployed at:", contractAddress);

    // Test basic functionality
    console.log("Token name:", await contract.name());
    console.log("Total supply:", hre.ethers.formatEther(await contract.totalSupply()));
    
    const assetInfo = await contract.assetInfo();
    console.log("Shop name:", assetInfo.shopName);

  } catch (error) {
    console.error("❌ Step 1 deployment failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
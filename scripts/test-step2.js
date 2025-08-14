const hre = require("hardhat");

async function main() {
  console.log("🔧 Testing step 2 contract (with ReentrancyGuard and Pausable)...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const shopName = "Test Shop Step2";
  const location = "Test Location";
  const description = "Test Description";
  const totalValuation = hre.ethers.parseEther("100");
  const tokenizedPercentage = 5000;
  const initialTokenSupply = hre.ethers.parseEther("50");

  const TestCoffeeStep2 = await hre.ethers.getContractFactory("TestCoffeeStep2");

  try {
    console.log("Deploying TestCoffeeStep2...");
    const contract = await TestCoffeeStep2.deploy(
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
    console.log("Max total supply:", hre.ethers.formatEther(await contract.maxTotalSupply()));

  } catch (error) {
    console.error("❌ Step 2 deployment failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
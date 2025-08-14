const hre = require("hardhat");

async function main() {
  console.log("🔧 Testing simple contract deployment...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const SimpleTest = await hre.ethers.getContractFactory("SimpleTest");

  try {
    const simpleTest = await SimpleTest.deploy({
      gasLimit: 3000000,
    });

    console.log("Waiting for deployment...");
    await simpleTest.waitForDeployment();
    
    const contractAddress = await simpleTest.getAddress();
    console.log("✅ Contract deployed at:", contractAddress);

    console.log("Token name:", await simpleTest.name());
    console.log("Token symbol:", await simpleTest.symbol());

  } catch (error) {
    console.error("❌ Simple deployment failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
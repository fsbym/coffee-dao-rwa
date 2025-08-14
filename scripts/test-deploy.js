const hre = require("hardhat");

async function main() {
  console.log("🔧 Testing basic deployment...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Test with minimal parameters
  const shopName = "Test Shop";
  const location = "Test Location";
  const description = "Test Description";
  const totalValuation = hre.ethers.parseEther("100"); // 100 ETH
  const tokenizedPercentage = 5000; // 50%
  const initialTokenSupply = hre.ethers.parseEther("100"); // 100 tokens

  console.log("Deploying CoffeeShopRWA...");
  const CoffeeShopRWA = await hre.ethers.getContractFactory("CoffeeShopRWA");

  try {
    const coffeeShopRWA = await CoffeeShopRWA.deploy(
      shopName,
      location,
      description,
      totalValuation,
      tokenizedPercentage,
      initialTokenSupply,
      {
        gasLimit: 3000000,
      }
    );

    console.log("Waiting for deployment...");
    await coffeeShopRWA.waitForDeployment();
    
    const contractAddress = await coffeeShopRWA.getAddress();
    console.log("✅ Contract deployed at:", contractAddress);

    // Test basic functionality
    console.log("Token name:", await coffeeShopRWA.name());
    console.log("Token symbol:", await coffeeShopRWA.symbol());
    console.log("Total supply:", hre.ethers.formatEther(await coffeeShopRWA.totalSupply()));

  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    
    // If it's a revert, try to get more info
    if (error.code === 'CALL_EXCEPTION') {
      console.log("This is likely a constructor requirement failure");
      console.log("Checking constructor parameters:");
      console.log("- shopName:", shopName);
      console.log("- location:", location);
      console.log("- description:", description);
      console.log("- totalValuation:", totalValuation.toString());
      console.log("- tokenizedPercentage:", tokenizedPercentage);
      console.log("- initialTokenSupply:", initialTokenSupply.toString());
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting Simple Coffee Shop RWA deployment to Sepolia...\n");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Simple parameters
  const shopName = "North York Coffee Collective";
  const location = "5120 Yonge St, North York, Toronto, ON";
  const description = "Premium artisanal coffee roaster and café serving the North York community.";
  const totalValuation = hre.ethers.parseEther("937.5"); // $1.875M at $2000/ETH
  const tokenizedPercentage = 5000; // 50% (basis points)
  const initialTokenSupply = hre.ethers.parseEther("468.75"); // 50% of valuation in tokens

  console.log("📊 Deployment Parameters:");
  console.log(`   Shop Name: ${shopName}`);
  console.log(`   Location: ${location}`);
  console.log(`   Total Valuation: ${hre.ethers.formatEther(totalValuation)} ETH`);
  console.log(`   Tokenized Percentage: ${tokenizedPercentage / 100}%`);
  console.log(`   Initial Token Supply: ${hre.ethers.formatEther(initialTokenSupply)} tokens\n`);

  // Deploy CoffeeShopRWASimple contract
  console.log("🔨 Deploying CoffeeShopRWASimple contract...");
  const CoffeeShopRWASimple = await hre.ethers.getContractFactory("CoffeeShopRWASimple");

  try {
    const coffeeShopRWA = await CoffeeShopRWASimple.deploy(
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

    console.log("⏳ Waiting for deployment confirmation...");
    await coffeeShopRWA.waitForDeployment();
    const contractAddress = await coffeeShopRWA.getAddress();

    console.log("✅ CoffeeShopRWASimple deployed successfully!");
    console.log("📍 Contract address:", contractAddress);
    console.log("🔗 Sepolia Etherscan:", `https://sepolia.etherscan.io/address/${contractAddress}`);

    // Display contract info
    console.log("\n📋 Contract Information:");
    console.log("   Token Name:", await coffeeShopRWA.name());
    console.log("   Token Symbol:", await coffeeShopRWA.symbol());
    console.log("   Total Supply:", hre.ethers.formatEther(await coffeeShopRWA.totalSupply()));
    console.log("   Owner:", await coffeeShopRWA.owner());

    // Test getAssetInfo
    const assetInfo = await coffeeShopRWA.getAssetInfo();
    console.log("   Shop Name from contract:", assetInfo[0]);

    // Update .env.local with contract address
    const envPath = path.join(__dirname, "..", ".env.local");
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, "utf8");
      envContent = envContent.replace(
        /NEXT_PUBLIC_CONTRACT_ADDRESS=.*/,
        `NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`
      );
      fs.writeFileSync(envPath, envContent);
      console.log("📝 Updated .env.local with contract address");
    } else {
      // Create .env.local if it doesn't exist
      const envContent = `NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}\n`;
      fs.writeFileSync(envPath, envContent);
      console.log("📝 Created .env.local with contract address");
    }

    console.log("\n🎉 Sepolia deployment completed successfully!");

  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment script failed:", error);
    process.exit(1);
  });
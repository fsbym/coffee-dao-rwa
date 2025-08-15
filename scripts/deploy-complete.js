const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting Complete Coffee Shop RWA with DAO deployment to Sepolia...\n");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Parameters for North York Coffee Collective
  const shopName = "North York Coffee Collective";
  const location = "5120 Yonge St, North York, Toronto, ON";
  const description = "Premium artisanal coffee roaster and café serving the North York community with full DAO governance.";
  const totalValuation = hre.ethers.parseEther("937.5"); // $1.875M at $2000/ETH
  const tokenizedPercentage = 5000; // 50% (basis points)
  const initialTokenSupply = hre.ethers.parseEther("468.75"); // 50% of valuation in tokens
  const tokenPrice = hre.ethers.parseEther("0.001"); // 0.001 ETH per token (~$2 per token at $2000/ETH)

  console.log("📊 Deployment Parameters:");
  console.log(`   Shop Name: ${shopName}`);
  console.log(`   Location: ${location}`);
  console.log(`   Total Valuation: ${hre.ethers.formatEther(totalValuation)} ETH`);
  console.log(`   Tokenized Percentage: ${tokenizedPercentage / 100}%`);
  console.log(`   Initial Token Supply: ${hre.ethers.formatEther(initialTokenSupply)} tokens`);
  console.log(`   Token Price: ${hre.ethers.formatEther(tokenPrice)} ETH per token\n`);

  // Deploy CoffeeShopRWAComplete contract
  console.log("🔨 Deploying CoffeeShopRWAComplete contract...");
  const CoffeeShopRWAComplete = await hre.ethers.getContractFactory("CoffeeShopRWAComplete");

  try {
    const coffeeShopRWA = await CoffeeShopRWAComplete.deploy(
      shopName,
      location,
      description,
      totalValuation,
      tokenizedPercentage,
      initialTokenSupply,
      tokenPrice,
      {
        gasLimit: 5000000, // Increased gas limit for complex contract
      }
    );

    console.log("⏳ Waiting for deployment confirmation...");
    await coffeeShopRWA.waitForDeployment();
    const contractAddress = await coffeeShopRWA.getAddress();

    console.log("✅ CoffeeShopRWAComplete deployed successfully!");
    console.log("📍 Contract address:", contractAddress);
    console.log("🔗 Sepolia Etherscan:", `https://sepolia.etherscan.io/address/${contractAddress}`);

    // Display contract info
    console.log("\n📋 Contract Information:");
    console.log("   Token Name:", await coffeeShopRWA.name());
    console.log("   Token Symbol:", await coffeeShopRWA.symbol());
    console.log("   Total Supply:", hre.ethers.formatEther(await coffeeShopRWA.totalSupply()));
    console.log("   Token Price:", hre.ethers.formatEther(await coffeeShopRWA.tokenPrice()), "ETH");
    console.log("   Current Proposal ID:", await coffeeShopRWA.currentProposalId());
    console.log("   Current Report ID:", await coffeeShopRWA.currentReportId());
    console.log("   Owner:", await coffeeShopRWA.owner());

    // Test getAssetInfo
    const assetInfo = await coffeeShopRWA.getAssetInfo();
    console.log("   Shop Name from contract:", assetInfo[0]);
    console.log("   Location from contract:", assetInfo[1]);

    // Update .env.local with new contract address
    const envPath = path.join(__dirname, "..", ".env.local");
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, "utf8");
      envContent = envContent.replace(
        /NEXT_PUBLIC_CONTRACT_ADDRESS=.*/,
        `NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`
      );
      fs.writeFileSync(envPath, envContent);
      console.log("📝 Updated .env.local with new contract address");
    } else {
      // Create .env.local if it doesn't exist
      const envContent = `NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}\n`;
      fs.writeFileSync(envPath, envContent);
      console.log("📝 Created .env.local with new contract address");
    }

    console.log("\n🏛️ DAO Features Available:");
    console.log("• Create proposals (requires 1% of total supply)");
    console.log("• Vote on proposals (voting power = token balance)");
    console.log("• Execute proposals after voting period");
    console.log("• Submit financial reports (authorized reporters)");
    console.log("• View governance history");

    console.log("\n💰 Purchase Features:");
    console.log("• Buy tokens directly with ETH");
    console.log(`• Current price: ${hre.ethers.formatEther(tokenPrice)} ETH per token`);
    console.log("• Automatic minting and refund of excess ETH");

    console.log("\n🎯 Next Steps:");
    console.log("1. ✅ Contract address updated in .env.local");
    console.log("2. Get Sepolia ETH from faucet if needed: https://sepoliafaucet.com/");
    console.log("3. Update frontend ABI to include governance functions");
    console.log("4. Restart your development server: npm run dev");
    console.log("5. Connect your wallet and switch to Sepolia network");
    console.log("6. Test both purchase and governance functionality");

    console.log("\n🎉 Complete DAO deployment successful!");

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
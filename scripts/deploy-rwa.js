const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting Coffee Shop RWA deployment...\n");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log(
    "💰 Account balance:",
    hre.ethers.formatEther(
      await hre.ethers.provider.getBalance(deployer.address)
    ),
    "ETH\n"
  );

  // Realistic coffee shop parameters based on industry data
  const shopName = "Brooklyn Roasters Hub";
  const location = "Williamsburg, Brooklyn, NY";
  const description =
    "Premium artisanal coffee roaster and café specializing in single-origin beans, locally sourced pastries, and community-focused atmosphere.";

  // Financial parameters (realistic medium-sized coffee shop)
  const totalValuation = hre.ethers.parseEther("937.5"); // $1.875M at $2000/ETH
  const tokenizedPercentage = 5000; // 50% (basis points)
  const initialTokenSupply = hre.ethers.parseEther("468750"); // 50% of valuation in tokens

  console.log("📊 Deployment Parameters:");
  console.log(`   Shop Name: ${shopName}`);
  console.log(`   Location: ${location}`);
  console.log(
    `   Total Valuation: ${hre.ethers.formatEther(totalValuation)} ETH`
  );
  console.log(`   Tokenized Percentage: ${tokenizedPercentage / 100}%`);
  console.log(
    `   Initial Token Supply: ${hre.ethers.formatEther(
      initialTokenSupply
    )} tokens\n`
  );

  // Deploy CoffeeShopRWA contract
  console.log("🔨 Deploying CoffeeShopRWA contract...");
  const CoffeeShopRWA = await hre.ethers.getContractFactory("CoffeeShopRWA");
  const coffeeShopRWA = await CoffeeShopRWA.deploy(
    shopName,
    location,
    description,
    totalValuation,
    tokenizedPercentage,
    initialTokenSupply
  );

  await coffeeShopRWA.waitForDeployment();
  const contractAddress = await coffeeShopRWA.getAddress();

  console.log("✅ CoffeeShopRWA deployed successfully!");
  console.log("📍 Contract address:", contractAddress);
  console.log(
    "⛽ Gas used for deployment:",
    (await coffeeShopRWA.deploymentTransaction().wait()).gasUsed.toString()
  );

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
  }

  // Display contract info
  console.log("\n📋 Contract Information:");
  console.log("   Token Name:", await coffeeShopRWA.name());
  console.log("   Token Symbol:", await coffeeShopRWA.symbol());
  console.log(
    "   Total Supply:",
    hre.ethers.formatEther(await coffeeShopRWA.totalSupply())
  );
  console.log("   Owner:", await coffeeShopRWA.owner());

  // Next steps
  console.log("\n🎯 Next Steps:");
  console.log("1. ✅ Contract address updated in .env.local");
  console.log(
    "2. Get a WalletConnect Project ID from https://cloud.walletconnect.com/"
  );
  console.log("3. Add the Project ID to .env.local:");
  console.log("   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id");
  console.log("4. Start the development server: npm run dev");
  console.log("5. Test the application at http://localhost:3000");

  if (hre.network.name === "localhost") {
    console.log("6. Import account to MetaMask:");
    console.log("   - Network: http://localhost:8545");
    console.log("   - Chain ID: 31337");
    console.log("   - Currency: ETH");
  }

  console.log("\n🎉 Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

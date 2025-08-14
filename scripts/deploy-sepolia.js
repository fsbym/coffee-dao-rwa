const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting Coffee Shop RWA deployment to Sepolia...\n");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");

  if (balance < hre.ethers.parseEther("0.01")) {
    console.log(
      "⚠️  WARNING: Low balance. You may need more Sepolia ETH from a faucet."
    );
    console.log("   Get Sepolia ETH from: https://sepoliafaucet.com/");
  }
  console.log();

  // Realistic coffee shop parameters based on industry data
  const shopName = "Brooklyn Roasters Hub";
  const location = "Williamsburg, Brooklyn, NY";
  const description =
    "Premium artisanal coffee roaster and café specializing in single-origin beans, locally sourced pastries, and community-focused atmosphere.";

  // Financial parameters (realistic medium-sized coffee shop)
  const totalValuation = hre.ethers.parseEther("937.5"); // $1.875M at $2000/ETH
  const tokenizedPercentage = 5000; // 50% (basis points)
  const initialTokenSupply = hre.ethers.parseEther("468.75"); // 50% of valuation in tokens (fixed from 468750)

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

  // Deploy with gas estimation
  const deployTransaction = CoffeeShopRWA.getDeployTransaction(
    shopName,
    location,
    description,
    totalValuation,
    tokenizedPercentage,
    initialTokenSupply
  );

  const estimatedGas = await deployer.estimateGas(deployTransaction);
  console.log("⛽ Estimated gas:", estimatedGas.toString());

  const coffeeShopRWA = await CoffeeShopRWA.deploy(
    shopName,
    location,
    description,
    totalValuation,
    tokenizedPercentage,
    initialTokenSupply,
    {
      gasLimit:
        estimatedGas < 100000n ? 2000000n : (estimatedGas * 150n) / 100n, // Use 2M gas or 50% buffer
    }
  );

  console.log("⏳ Waiting for deployment confirmation...");
  await coffeeShopRWA.waitForDeployment();
  const contractAddress = await coffeeShopRWA.getAddress();

  console.log("✅ CoffeeShopRWA deployed successfully!");
  console.log("📍 Contract address:", contractAddress);
  console.log(
    "🔗 Sepolia Etherscan:",
    `https://sepolia.etherscan.io/address/${contractAddress}`
  );

  const deployTx = coffeeShopRWA.deploymentTransaction();
  if (deployTx) {
    console.log("⛽ Gas used for deployment:", deployTx.gasLimit.toString());
    console.log("🧾 Transaction hash:", deployTx.hash);
  }

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

  // Display contract info
  console.log("\n📋 Contract Information:");
  try {
    console.log("   Token Name:", await coffeeShopRWA.name());
    console.log("   Token Symbol:", await coffeeShopRWA.symbol());
    console.log(
      "   Total Supply:",
      hre.ethers.formatEther(await coffeeShopRWA.totalSupply())
    );
    console.log("   Owner:", await coffeeShopRWA.owner());

    // Test getAssetInfo
    const assetInfo = await coffeeShopRWA.getAssetInfo();
    console.log("   Shop Name from contract:", assetInfo[0]);
  } catch (error) {
    console.log("ℹ️  Contract info will be available after confirmation");
  }

  // Contract verification instructions
  console.log("\n🔍 Contract Verification:");
  console.log("To verify the contract on Etherscan, run:");
  console.log(
    `npx hardhat verify --network sepolia ${contractAddress} "${shopName}" "${location}" "${description}" "${totalValuation}" "${tokenizedPercentage}" "${initialTokenSupply}"`
  );

  // Auto-verify if API key is available
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("\n⏳ Auto-verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [
          shopName,
          location,
          description,
          totalValuation,
          tokenizedPercentage,
          initialTokenSupply,
        ],
      });
      console.log("✅ Contract verified on Etherscan!");
    } catch (error) {
      console.log("❌ Verification failed:", error.message);
      console.log("You can verify manually later using the command above.");
    }
  } else {
    console.log(
      "ℹ️  Add ETHERSCAN_API_KEY to .env.local for auto-verification"
    );
  }

  // Next steps
  console.log("\n🎯 Next Steps:");
  console.log("1. ✅ Contract address updated in .env.local");
  console.log(
    "2. Get Sepolia ETH from faucet if needed: https://sepoliafaucet.com/"
  );
  console.log("3. Restart your development server: npm run dev");
  console.log("4. Test the application at http://localhost:3000");
  console.log("5. Connect your wallet and switch to Sepolia network");
  console.log(
    `6. View contract on Sepolia Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`
  );

  console.log("\n🎉 Sepolia deployment completed successfully!");
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

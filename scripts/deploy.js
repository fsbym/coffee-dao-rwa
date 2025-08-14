const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting Coffee Shop RWA contract deployment...");

  // Get the contract factory
  const CoffeeShopRWA = await hre.ethers.getContractFactory("CoffeeShopRWA");

  // Contract constructor parameters - BASED ON REAL COFFEE SHOP DATA
  // Data sourced from industry averages and similar to successful independent coffee shops
  const shopName = "Brooklyn Roasters Hub";
  const location = "Williamsburg, Brooklyn";
  const description =
    "Popular coffee roastery with multiple revenue streams, averaging $750k annual revenue with 10% net margin";

  // Real financial data (converted to ETH at ~$2000/ETH):
  // Annual Revenue: $750,000 (~37.5 ETH)
  // Monthly Revenue: $62,500 (~31.25 ETH/month)
  // Monthly Expenses: $56,250 (~28.125 ETH/month)
  // Monthly Net Profit: $6,250 (~3.125 ETH/month)
  // Business Valuation: $1,875,000 (2.5x revenue multiple, ~937.5 ETH)
  const totalValuation = hre.ethers.parseEther("937.5"); // $1.875M at $2000/ETH
  const tokenizedPercentage = 5000; // 50% of the business tokenized (5000 basis points)
  const initialTokenSupply = hre.ethers.parseEther("468750"); // $2 per token value

  console.log("📋 Deployment parameters:");
  console.log(`   Shop Name: ${shopName}`);
  console.log(`   Location: ${location}`);
  console.log(
    `   Total Valuation: ${hre.ethers.formatEther(totalValuation)} ETH`
  );
  console.log(`   Tokenized Percentage: ${tokenizedPercentage / 100}%`);
  console.log(
    `   Initial Token Supply: ${hre.ethers.formatEther(
      initialTokenSupply
    )} tokens`
  );
  console.log(`   Network: ${hre.network.name}`);

  // Deploy the contract
  console.log("\n⏳ Deploying contract...");
  const coffeeShopRWA = await CoffeeShopRWA.deploy(
    shopName,
    location,
    description,
    totalValuation,
    tokenizedPercentage,
    initialTokenSupply
  );

  // Wait for deployment to complete
  await coffeeShopRWA.waitForDeployment();
  const contractAddress = await coffeeShopRWA.getAddress();

  console.log("✅ Contract deployed successfully!");
  console.log(`📍 Contract Address: ${contractAddress}`);

  // Get deployment info
  const [deployer] = await hre.ethers.getSigners();
  const deployerBalance = await hre.ethers.provider.getBalance(
    deployer.address
  );
  const tokenBalance = await coffeeShopRWA.balanceOf(deployer.address);

  console.log("\n📊 Deployment Summary:");
  console.log(`   Deployer: ${deployer.address}`);
  console.log(
    `   Deployer Balance: ${hre.ethers.formatEther(deployerBalance)} ETH`
  );
  console.log(
    `   Token Balance: ${hre.ethers.formatEther(tokenBalance)} tokens`
  );
  console.log(`   Token Name: ${await coffeeShopRWA.name()}`);
  console.log(`   Token Symbol: ${await coffeeShopRWA.symbol()}`);
  console.log(
    `   Total Supply: ${hre.ethers.formatEther(
      await coffeeShopRWA.totalSupply()
    )}`
  );

  // Verify asset info
  const assetInfo = await coffeeShopRWA.getAssetInfo();
  console.log("\n🏪 Asset Information:");
  console.log(`   Shop Name: ${assetInfo[0]}`);
  console.log(`   Location: ${assetInfo[1]}`);
  console.log(`   Valuation: ${hre.ethers.formatEther(assetInfo[3])} ETH`);
  console.log(`   Tokenized %: ${assetInfo[4] / 100}%`);
  console.log(`   Verified: ${assetInfo[6]}`);

  // Calculate token value
  const tokenValue = await coffeeShopRWA.getTokenValue();
  console.log(
    `   Token Value: ${hre.ethers.formatEther(tokenValue)} ETH per token`
  );

  // Save deployment information
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    constructorArgs: {
      shopName,
      location,
      description,
      totalValuation: totalValuation.toString(),
      tokenizedPercentage,
      initialTokenSupply: initialTokenSupply.toString(),
    },
    assetInfo: {
      shopName: assetInfo[0],
      location: assetInfo[1],
      description: assetInfo[2],
      totalValuation: assetInfo[3].toString(),
      tokenizedPercentage: assetInfo[4].toString(),
      legalDocumentHash: assetInfo[5],
      isVerified: assetInfo[6],
    },
    tokenInfo: {
      name: await coffeeShopRWA.name(),
      symbol: await coffeeShopRWA.symbol(),
      totalSupply: (await coffeeShopRWA.totalSupply()).toString(),
      maxTotalSupply: (await coffeeShopRWA.maxTotalSupply()).toString(),
      tokenValue: tokenValue.toString(),
    },
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info to file
  const deploymentFile = path.join(
    deploymentsDir,
    `${hre.network.name}-deployment.json`
  );
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n💾 Deployment info saved to: ${deploymentFile}`);

  // Update .env.example with the contract address
  const envExamplePath = path.join(__dirname, "..", "env.example");
  if (fs.existsSync(envExamplePath)) {
    let envContent = fs.readFileSync(envExamplePath, "utf8");
    envContent = envContent.replace(
      /NEXT_PUBLIC_CONTRACT_ADDRESS=.*/,
      `NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`
    );
    fs.writeFileSync(envExamplePath, envContent);
    console.log("📝 Updated env.example with contract address");
  }

  // Contract verification instructions
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n🔍 To verify the contract on Etherscan, run:");
    console.log(
      `npx hardhat verify --network ${hre.network.name} ${contractAddress} "${shopName}" "${location}" "${description}" "${totalValuation}" "${tokenizedPercentage}" "${initialTokenSupply}"`
    );

    // Auto-verify if on a supported network
    if (
      process.env.ETHERSCAN_API_KEY &&
      (hre.network.name === "sepolia" || hre.network.name === "mainnet")
    ) {
      console.log("\n⏳ Auto-verifying contract...");
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
    }
  }

  // Next steps
  console.log("\n🎯 Next Steps:");
  console.log("1. Copy the contract address to your .env.local file:");
  console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
  console.log("2. Make sure you have a WalletConnect Project ID in .env.local");
  console.log("3. Restart your development server: npm run dev");
  console.log("4. Test the application at http://localhost:3000");

  if (hre.network.name === "sepolia") {
    console.log(
      "5. Get test ETH from Sepolia faucet: https://sepoliafaucet.com/"
    );
    console.log(
      `6. View contract on Sepolia Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`
    );
  }

  console.log("\n🎉 Deployment completed successfully!");
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

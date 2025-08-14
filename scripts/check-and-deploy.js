const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🔍 Checking network and contract deployment...\n");

  try {
    // Check if we can connect to the network
    const provider = hre.ethers.provider;
    const network = await provider.getNetwork();
    console.log("✅ Connected to network:", network.name || "localhost");
    console.log("   Chain ID:", network.chainId.toString());

    // Check if contract exists at the expected address
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const code = await provider.getCode(contractAddress);

    if (code === "0x") {
      console.log("❌ No contract found at:", contractAddress);
      console.log("🚀 Deploying new contract...\n");

      // Deploy the contract
      await deployContract();
    } else {
      console.log("✅ Contract found at:", contractAddress);
      console.log("   Contract size:", code.length, "bytes");

      // Test contract functionality
      await testContract(contractAddress);
    }
  } catch (error) {
    console.error("❌ Network connection failed:", error.message);
    console.log("\n💡 Solutions:");
    console.log("1. Start Hardhat node: npx hardhat node");
    console.log(
      "2. Or run this script with: npx hardhat run scripts/check-and-deploy.js --network localhost"
    );
  }
}

async function deployContract() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  // Contract parameters
  const shopName = "Brooklyn Roasters Hub";
  const location = "Williamsburg, Brooklyn, NY";
  const description = "Premium artisanal coffee roaster and café";
  const totalValuation = hre.ethers.parseEther("937.5");
  const tokenizedPercentage = 5000; // 50%
  const initialTokenSupply = hre.ethers.parseEther("468750");

  const CoffeeShopRWA = await hre.ethers.getContractFactory("CoffeeShopRWA");
  const contract = await CoffeeShopRWA.deploy(
    shopName,
    location,
    description,
    totalValuation,
    tokenizedPercentage,
    initialTokenSupply
  );

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("✅ Contract deployed at:", address);
  console.log(
    "⛽ Gas used:",
    contract.deploymentTransaction().gasLimit.toString()
  );

  // Test the deployed contract
  await testContract(address);
}

async function testContract(contractAddress) {
  try {
    console.log("🧪 Testing contract functionality...");

    const contract = await hre.ethers.getContractAt(
      "CoffeeShopRWA",
      contractAddress
    );

    // Test basic functions
    const name = await contract.name();
    const symbol = await contract.symbol();
    const totalSupply = await contract.totalSupply();

    console.log("✅ Contract tests passed:");
    console.log("   Name:", name);
    console.log("   Symbol:", symbol);
    console.log("   Total Supply:", hre.ethers.formatEther(totalSupply));

    // Test getAssetInfo
    try {
      const assetInfo = await contract.getAssetInfo();
      console.log("✅ Asset info accessible:");
      console.log("   Shop Name:", assetInfo[0]);
      console.log("   Location:", assetInfo[1]);
    } catch (error) {
      console.log("❌ Asset info test failed:", error.message);
    }
  } catch (error) {
    console.error("❌ Contract test failed:", error.message);
  }
}

main()
  .then(() => {
    console.log("\n🎉 Check complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });

const hre = require("hardhat");

async function main() {
  console.log("Starting CoffeeToken contract deployment...");

  // Get contract factory
  const CoffeeToken = await hre.ethers.getContractFactory("CoffeeToken");

  // Deploy contract
  const coffeeToken = await CoffeeToken.deploy();

  // Wait for deployment to complete
  await coffeeToken.waitForDeployment();

  // Get contract address
  const address = await coffeeToken.getAddress();

  console.log("✅ CoffeeToken contract deployed successfully!");
  console.log("Contract address:", address);
  console.log("Network:", hre.network.name);

  // Verify contract (if supported)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await coffeeToken.deploymentTransaction().wait(6);

    console.log("Starting contract verification...");
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [],
      });
      console.log("✅ Contract verification successful!");
    } catch (error) {
      console.log("❌ Contract verification failed:", error.message);
    }
  }

  console.log("\n📋 Deployment Information:");
  console.log("Contract Name: CoffeeToken");
  console.log("Contract Address:", address);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", await hre.ethers.provider.getSigner().getAddress());

  // Save deployment information to file
  const fs = require("fs");
  const deploymentInfo = {
    contractName: "CoffeeToken",
    address: address,
    network: hre.network.name,
    deployer: await hre.ethers.provider.getSigner().getAddress(),
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(
    `deployment-${hre.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log(
    `\n📄 Deployment information saved to: deployment-${hre.network.name}.json`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

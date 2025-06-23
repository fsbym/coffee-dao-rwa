const hre = require("hardhat");

async function main() {
  console.log("开始部署 CoffeeToken 合约...");

  // 获取合约工厂
  const CoffeeToken = await hre.ethers.getContractFactory("CoffeeToken");

  // 部署合约
  const coffeeToken = await CoffeeToken.deploy();

  // 等待部署完成
  await coffeeToken.waitForDeployment();

  // 获取合约地址
  const address = await coffeeToken.getAddress();

  console.log("✅ CoffeeToken 合约部署成功!");
  console.log("合约地址:", address);
  console.log("网络:", hre.network.name);

  // 验证合约（如果支持）
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("等待区块确认...");
    await coffeeToken.deploymentTransaction().wait(6);

    console.log("开始验证合约...");
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [],
      });
      console.log("✅ 合约验证成功!");
    } catch (error) {
      console.log("❌ 合约验证失败:", error.message);
    }
  }

  console.log("\n📋 部署信息:");
  console.log("合约名称: CoffeeToken");
  console.log("合约地址:", address);
  console.log("网络:", hre.network.name);
  console.log("部署者:", await hre.ethers.provider.getSigner().getAddress());

  // 保存部署信息到文件
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

  console.log(`\n📄 部署信息已保存到: deployment-${hre.network.name}.json`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  });

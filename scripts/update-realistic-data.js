const hre = require("hardhat");

/**
 * Script to update contract with realistic coffee shop financial data
 * Based on industry averages and public company reports
 */

async function main() {
  console.log("📊 Updating contract with realistic coffee shop data...");

  // Realistic coffee shop financial models based on industry data
  const coffeeShopModels = {
    // Small independent coffee shop
    small: {
      shopName: "Central Park Coffee Co.",
      location: "Upper West Side, New York",
      description:
        "Cozy neighborhood coffee shop with artisanal blends and local pastries",
      annualRevenue: 350000, // $350k annual revenue
      monthlyRevenue: 29167, // $350k / 12
      monthlyExpenses: 26250, // 90% of revenue (10% net profit margin)
      totalValuation: 875000, // 2.5x annual revenue (typical small business multiple)
      tokenizedPercentage: 4000, // 40% tokenized
      initialTokenSupply: 350000, // 1 token per $1 tokenized value
    },

    // Medium successful coffee shop
    medium: {
      shopName: "Brooklyn Roasters Hub",
      location: "Williamsburg, Brooklyn",
      description:
        "Popular coffee roastery with multiple revenue streams and loyal customer base",
      annualRevenue: 750000, // $750k annual revenue
      monthlyRevenue: 62500, // $750k / 12
      monthlyExpenses: 56250, // 75% of revenue (25% gross profit, 10% net profit)
      totalValuation: 1875000, // 2.5x annual revenue
      tokenizedPercentage: 5000, // 50% tokenized
      initialTokenSupply: 468750, // 1 token per $2 tokenized value
    },

    // High-end specialty coffee shop (closer to Starbucks performance)
    premium: {
      shopName: "Manhattan Coffee Exchange",
      location: "Financial District, Manhattan",
      description:
        "Premium coffee experience with high foot traffic location and specialty drinks",
      annualRevenue: 1200000, // $1.2M annual revenue
      monthlyRevenue: 100000, // $1.2M / 12
      monthlyExpenses: 85000, // 85% of revenue (15% net profit margin)
      totalValuation: 3600000, // 3x annual revenue (premium location multiple)
      tokenizedPercentage: 3000, // 30% tokenized (owners keep majority)
      initialTokenSupply: 1080000, // 1 token per $1 tokenized value
    },
  };

  // Select model (you can change this)
  const selectedModel = coffeeShopModels.medium; // Using medium-sized shop as example

  console.log("📋 Selected Coffee Shop Model:");
  console.log(`   Name: ${selectedModel.shopName}`);
  console.log(`   Location: ${selectedModel.location}`);
  console.log(
    `   Annual Revenue: $${selectedModel.annualRevenue.toLocaleString()}`
  );
  console.log(
    `   Monthly Revenue: $${selectedModel.monthlyRevenue.toLocaleString()}`
  );
  console.log(
    `   Monthly Expenses: $${selectedModel.monthlyExpenses.toLocaleString()}`
  );
  console.log(
    `   Monthly Net Profit: $${(
      selectedModel.monthlyRevenue - selectedModel.monthlyExpenses
    ).toLocaleString()}`
  );
  console.log(
    `   Net Profit Margin: ${(
      ((selectedModel.monthlyRevenue - selectedModel.monthlyExpenses) /
        selectedModel.monthlyRevenue) *
      100
    ).toFixed(1)}%`
  );
  console.log(
    `   Total Valuation: $${selectedModel.totalValuation.toLocaleString()}`
  );
  console.log(
    `   Tokenized Percentage: ${selectedModel.tokenizedPercentage / 100}%`
  );
  console.log(
    `   Token Supply: ${selectedModel.initialTokenSupply.toLocaleString()}`
  );

  // Convert USD to ETH (assuming 1 ETH = $2000, you should update this with current price)
  const ethPrice = 2000; // USD per ETH - UPDATE THIS WITH CURRENT PRICE

  const valuationInETH = selectedModel.totalValuation / ethPrice;
  const monthlyRevenueInETH = selectedModel.monthlyRevenue / ethPrice;
  const monthlyExpensesInETH = selectedModel.monthlyExpenses / ethPrice;

  console.log("\n💰 Converted to ETH (at $2,000/ETH):");
  console.log(`   Valuation: ${valuationInETH.toFixed(2)} ETH`);
  console.log(`   Monthly Revenue: ${monthlyRevenueInETH.toFixed(3)} ETH`);
  console.log(`   Monthly Expenses: ${monthlyExpensesInETH.toFixed(3)} ETH`);
  console.log(
    `   Monthly Profit: ${(monthlyRevenueInETH - monthlyExpensesInETH).toFixed(
      3
    )} ETH`
  );

  // Contract deployment parameters
  const deploymentParams = {
    shopName: selectedModel.shopName,
    location: selectedModel.location,
    description: selectedModel.description,
    totalValuation: hre.ethers.parseEther(valuationInETH.toString()),
    tokenizedPercentage: selectedModel.tokenizedPercentage,
    initialTokenSupply: hre.ethers.parseEther(
      selectedModel.initialTokenSupply.toString()
    ),
  };

  console.log("\n🚀 Ready for deployment with realistic data!");
  console.log(
    "To deploy with this data, update your deploy.js script with these parameters:"
  );
  console.log("\nDeployment Parameters:");
  console.log(`shopName: "${deploymentParams.shopName}"`);
  console.log(`location: "${deploymentParams.location}"`);
  console.log(`description: "${deploymentParams.description}"`);
  console.log(
    `totalValuation: hre.ethers.parseEther("${valuationInETH.toFixed(2)}")`
  );
  console.log(`tokenizedPercentage: ${deploymentParams.tokenizedPercentage}`);
  console.log(
    `initialTokenSupply: hre.ethers.parseEther("${selectedModel.initialTokenSupply}")`
  );

  // Calculate expected monthly dividends per token
  const monthlyProfitInETH = monthlyRevenueInETH - monthlyExpensesInETH;
  const tokenizedProfitShare =
    monthlyProfitInETH * (selectedModel.tokenizedPercentage / 10000);
  const dividendPerToken =
    tokenizedProfitShare / selectedModel.initialTokenSupply;

  console.log("\n📈 Expected Token Performance:");
  console.log(
    `   Monthly Dividend Pool: ${tokenizedProfitShare.toFixed(6)} ETH`
  );
  console.log(
    `   Dividend per Token: ${dividendPerToken.toFixed(8)} ETH/month`
  );
  console.log(
    `   Annual Dividend per Token: ${(dividendPerToken * 12).toFixed(6)} ETH`
  );
  console.log(
    `   Token Value: ${(
      (valuationInETH * selectedModel.tokenizedPercentage) /
      10000 /
      selectedModel.initialTokenSupply
    ).toFixed(6)} ETH`
  );

  // ROI calculation
  const tokenValue =
    (valuationInETH * selectedModel.tokenizedPercentage) /
    10000 /
    selectedModel.initialTokenSupply;
  const annualDividendYield = ((dividendPerToken * 12) / tokenValue) * 100;
  console.log(`   Annual Dividend Yield: ${annualDividendYield.toFixed(2)}%`);

  // Sample monthly financial report
  console.log("\n📊 Sample Monthly Financial Report:");
  const sampleReport = {
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    revenue: hre.ethers.parseEther(monthlyRevenueInETH.toFixed(6)),
    expenses: hre.ethers.parseEther(monthlyExpensesInETH.toFixed(6)),
    netProfit: hre.ethers.parseEther(
      (monthlyRevenueInETH - monthlyExpensesInETH).toFixed(6)
    ),
  };

  console.log(`   Month/Year: ${sampleReport.month}/${sampleReport.year}`);
  console.log(
    `   Revenue: ${hre.ethers.formatEther(sampleReport.revenue)} ETH`
  );
  console.log(
    `   Expenses: ${hre.ethers.formatEther(sampleReport.expenses)} ETH`
  );
  console.log(
    `   Net Profit: ${hre.ethers.formatEther(sampleReport.netProfit)} ETH`
  );

  return {
    deploymentParams,
    monthlyReport: sampleReport,
    selectedModel,
  };
}

// Industry benchmarks based on public data
function getIndustryBenchmarks() {
  return {
    // Based on Starbucks 2023 annual report
    starbucksData: {
      totalStores: 38587, // Global stores
      totalRevenue: 35976000000, // $35.976B total revenue 2023
      averageStoreRevenue: 932000, // ~$932k per store average
      operatingMargin: 0.145, // 14.5% operating margin
      netMargin: 0.113, // 11.3% net margin
    },

    // Industry averages for independent coffee shops
    independentShopAverages: {
      averageRevenue: 400000, // $400k average annual revenue
      netMargin: 0.05, // 5% net margin (lower than chains due to less efficiency)
      grossMargin: 0.65, // 65% gross margin
      laborCostPercentage: 0.3, // 30% of revenue
      rentCostPercentage: 0.2, // 20% of revenue
      cogsCostPercentage: 0.35, // 35% of revenue (cost of goods sold)
    },
  };
}

// Export for use in other scripts
module.exports = {
  main,
  getIndustryBenchmarks,
};

// Run if called directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Error:", error);
      process.exit(1);
    });
}

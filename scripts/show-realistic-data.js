/**
 * Coffee Shop RWA - Realistic Data Analysis
 * Demonstrates real-world financial data without hardhat dependencies
 */

console.log("📊 Coffee Shop RWA - Real-World Financial Analysis");
console.log("=".repeat(60));

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

console.log("\n📋 Selected Coffee Shop Model:");
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

// Calculate expected monthly dividends per token
const monthlyProfitInETH = monthlyRevenueInETH - monthlyExpensesInETH;
const tokenizedProfitShare =
  monthlyProfitInETH * (selectedModel.tokenizedPercentage / 10000);
const dividendPerToken =
  tokenizedProfitShare / selectedModel.initialTokenSupply;

console.log("\n📈 Expected Token Performance:");
console.log(`   Monthly Dividend Pool: ${tokenizedProfitShare.toFixed(6)} ETH`);
console.log(`   Dividend per Token: ${dividendPerToken.toFixed(8)} ETH/month`);
console.log(
  `   Annual Dividend per Token: ${(dividendPerToken * 12).toFixed(6)} ETH`
);

// Token value calculation
const tokenValue =
  (valuationInETH * selectedModel.tokenizedPercentage) /
  10000 /
  selectedModel.initialTokenSupply;
console.log(`   Token Value: ${tokenValue.toFixed(6)} ETH`);

// ROI calculation
const annualDividendYield = ((dividendPerToken * 12) / tokenValue) * 100;
console.log(`   Annual Dividend Yield: ${annualDividendYield.toFixed(2)}%`);

// Sample monthly financial report
console.log("\n📊 Sample Monthly Financial Report:");
const sampleReport = {
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  revenueETH: monthlyRevenueInETH.toFixed(6),
  expensesETH: monthlyExpensesInETH.toFixed(6),
  netProfitETH: (monthlyRevenueInETH - monthlyExpensesInETH).toFixed(6),
};

console.log(`   Month/Year: ${sampleReport.month}/${sampleReport.year}`);
console.log(
  `   Revenue: ${
    sampleReport.revenueETH
  } ETH ($${selectedModel.monthlyRevenue.toLocaleString()})`
);
console.log(
  `   Expenses: ${
    sampleReport.expensesETH
  } ETH ($${selectedModel.monthlyExpenses.toLocaleString()})`
);
console.log(
  `   Net Profit: ${sampleReport.netProfitETH} ETH ($${(
    selectedModel.monthlyRevenue - selectedModel.monthlyExpenses
  ).toLocaleString()})`
);

// Industry benchmarks comparison
console.log("\n🏢 Industry Benchmarks Comparison:");
console.log("Based on Starbucks Corp. 2023 10-K Filing:");
console.log(`   Starbucks Avg Store Revenue: $932,000/year`);
console.log(
  `   Our Model: $${selectedModel.annualRevenue.toLocaleString()}/year (${(
    (selectedModel.annualRevenue / 932000) *
    100
  ).toFixed(1)}% of Starbucks)`
);
console.log(`   Starbucks Net Margin: 11.3%`);
console.log(
  `   Our Model: ${(
    ((selectedModel.monthlyRevenue - selectedModel.monthlyExpenses) /
      selectedModel.monthlyRevenue) *
    100
  ).toFixed(1)}% (Conservative)`
);

console.log("\nBased on IBISWorld Industry Report 2024:");
console.log(`   Industry Average Revenue: $695,000/year`);
console.log(
  `   Our Model: $${selectedModel.annualRevenue.toLocaleString()}/year (${(
    (selectedModel.annualRevenue / 695000) *
    100
  ).toFixed(1)}% of industry average)`
);
console.log(`   Industry Growth Rate: 4.7% CAGR`);
console.log(`   Industry Establishments: 65,042 coffee shops`);

// Investment summary
console.log("\n💼 Investment Summary:");
console.log(`   Initial Token Price: $${(tokenValue * ethPrice).toFixed(2)}`);
console.log(
  `   Monthly Dividend (per $1000 invested): $${(
    (dividendPerToken * ethPrice * 1000) /
    (tokenValue * ethPrice)
  ).toFixed(2)}`
);
console.log(
  `   Annual Return (dividends only): ${annualDividendYield.toFixed(2)}%`
);
console.log(
  `   Comparable to: High-yield REITs (6-8%) or Corporate Bonds (4-6%)`
);

// Risk factors
console.log("\n⚠️  Risk Factors:");
console.log("   - Individual shop performance may vary significantly");
console.log("   - Economic downturns can reduce coffee shop sales");
console.log("   - Local competition and rent increases affect profitability");
console.log("   - Model based on historical data, not future guarantees");

console.log("\n" + "=".repeat(60));
console.log("✅ Analysis Complete - Data sources cited in README.md");
console.log("📚 For detailed methodology, see docs/data-methodology.md");

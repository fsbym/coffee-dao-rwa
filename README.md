# Coffee DAO RWA - 咖啡代币化平台

一个基于区块链的咖啡代币化平台，让每一杯咖啡都有独特的数字身份。

## 🌟 项目特色

- **无后端设计**: 完全基于区块链和 IPFS，无需传统服务器
- **ERC-721 代币**: 每个咖啡代币都是独特的 NFT
- **去中心化交易**: 直接在链上进行买卖交易
- **现代化 UI**: 使用 Tailwind CSS 构建的响应式界面
- **钱包集成**: 支持 MetaMask 等主流钱包

## 🚀 功能特性

### 核心功能

- ✅ **铸造代币**: 创建独特的咖啡代币
- ✅ **代币交易**: 在平台上买卖代币
- ✅ **代币管理**: 查看和管理自己的代币
- ✅ **市场浏览**: 发现和探索咖啡代币

### 技术特性

- ✅ **智能合约**: 基于 OpenZeppelin 的 ERC-721 合约
- ✅ **Web3 集成**: 使用 Wagmi 和 RainbowKit
- ✅ **响应式设计**: 支持移动端和桌面端
- ✅ **实时更新**: 交易后自动刷新数据

## 🛠️ 技术栈

### 前端

- **Next.js 15**: React 框架
- **Tailwind CSS**: 样式框架
- **Wagmi**: Web3 React Hooks
- **RainbowKit**: 钱包连接 UI
- **Viem**: 以太坊客户端

### 智能合约

- **Solidity 0.8.20**: 智能合约语言
- **OpenZeppelin**: 安全合约库
- **ERC-721**: NFT 标准

## 📦 安装和运行

### 1. 克隆项目

```bash
git clone <repository-url>
cd coffee-dao-rwa
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address
```

### 4. 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 🔧 智能合约部署

### 1. 安装 Hardhat

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

### 2. 初始化 Hardhat

```bash
npx hardhat init
```

### 3. 配置网络

在 `hardhat.config.js` 中配置网络：

```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: [PRIVATE_KEY],
    },
  },
};
```

### 4. 部署合约

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### 5. 更新合约地址

将部署得到的合约地址更新到 `src/lib/web3.js` 中。

## 📱 使用指南

### 连接钱包

1. 点击右上角的"连接钱包"按钮
2. 选择你的钱包（MetaMask、WalletConnect 等）
3. 确认连接

### 铸造代币

1. 切换到"铸造"标签页
2. 填写代币信息：
   - 代币名称
   - 代币描述
   - 代币图片 URL
   - Token URI
3. 支付铸造费用
4. 确认交易

### 交易代币

1. 在"市场"页面浏览代币
2. 点击"购买代币"进行购买
3. 或点击"列出出售"出售你的代币

## 🎨 自定义

### 修改主题颜色

在 `tailwind.config.js` 中修改颜色配置：

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // 自定义主色调
      }
    }
  }
}
```

### 修改合约

1. 编辑 `contracts/CoffeeToken.sol`
2. 重新编译和部署
3. 更新前端 ABI

## 🔒 安全考虑

- 所有交易都在区块链上进行，确保透明和不可篡改
- 使用 OpenZeppelin 的安全合约库
- 支持多签名钱包
- 建议在测试网充分测试后再部署到主网

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🆘 支持

如果遇到问题，请：

1. 检查钱包是否连接到正确的网络
2. 确保有足够的 ETH 支付 gas 费
3. 查看浏览器控制台是否有错误信息

## 🔮 未来计划

- [ ] 支持更多区块链网络
- [ ] 添加代币稀有度系统
- [ ] 集成 IPFS 存储
- [ ] 添加社交功能
- [ ] 移动端应用

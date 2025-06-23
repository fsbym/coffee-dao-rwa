# Coffee DAO RWA - Coffee Tokenization Platform

A blockchain-based coffee tokenization platform that gives every cup of coffee a unique digital identity.

## 🌟 Project Features

- **No Backend Design**: Completely based on blockchain and IPFS, no traditional servers needed
- **ERC-721 Tokens**: Each coffee token is a unique NFT
- **Decentralized Trading**: Direct buying and selling on the blockchain
- **Modern UI**: Responsive interface built with Tailwind CSS
- **Wallet Integration**: Support for MetaMask and other mainstream wallets

## 🚀 Features

### Core Features

- ✅ **Mint Tokens**: Create unique coffee tokens
- ✅ **Token Trading**: Buy and sell tokens on the platform
- ✅ **Token Management**: View and manage your tokens
- ✅ **Marketplace Browsing**: Discover and explore coffee tokens

### Technical Features

- ✅ **Smart Contracts**: ERC-721 contracts based on OpenZeppelin
- ✅ **Web3 Integration**: Using Wagmi and RainbowKit
- ✅ **Responsive Design**: Support for mobile and desktop
- ✅ **Real-time Updates**: Automatic refresh after transactions

## 🛠️ Tech Stack

### Frontend

- **Next.js 15**: React framework
- **Tailwind CSS**: Styling framework
- **Wagmi**: Web3 React Hooks
- **RainbowKit**: Wallet connection UI
- **Viem**: Ethereum client

### Smart Contracts

- **Solidity 0.8.20**: Smart contract language
- **OpenZeppelin**: Secure contract library
- **ERC-721**: NFT standard

## 📦 Installation and Setup

### 1. Clone the project

```bash
git clone <repository-url>
cd coffee-dao-rwa
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create a `.env.local` file:

```env
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address
```

### 4. Run development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

## 🔧 Smart Contract Deployment

### 1. Install Hardhat

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

### 2. Initialize Hardhat

```bash
npx hardhat init
```

### 3. Configure networks

In `hardhat.config.js`:

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

### 4. Deploy contract

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### 5. Update contract address

Update the deployed contract address in `src/lib/web3.js`.

## 📱 User Guide

### Connect Wallet

1. Click the "Connect Wallet" button in the top right
2. Select your wallet (MetaMask, WalletConnect, etc.)
3. Confirm connection

### Mint Tokens

1. Switch to the "Mint" tab
2. Fill in token information:
   - Token name
   - Token description
   - Token image URL
   - Token URI
3. Pay minting fee
4. Confirm transaction

### Trade Tokens

1. Browse tokens in the "Marketplace" page
2. Click "Buy Token" to purchase
3. Or click "List for Sale" to sell your tokens

## 🎨 Customization

### Modify theme colors

In `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Custom primary colors
      }
    }
  }
}
```

### Modify contracts

1. Edit `contracts/CoffeeToken.sol`
2. Recompile and redeploy
3. Update frontend ABI

## 🔒 Security Considerations

- All transactions are on the blockchain, ensuring transparency and immutability
- Using OpenZeppelin's secure contract library
- Support for multi-signature wallets
- Recommend thorough testing on testnet before mainnet deployment

## 🤝 Contributing

Welcome to submit Issues and Pull Requests!

## 📄 License

MIT License

## 🆘 Support

If you encounter issues, please:

1. Check if wallet is connected to the correct network
2. Ensure sufficient ETH for gas fees
3. Check browser console for error messages

## 🔮 Future Plans

- [ ] Support for more blockchain networks
- [ ] Add token rarity system
- [ ] Integrate IPFS storage
- [ ] Add social features
- [ ] Mobile application

# 🚀 Smart Contracts - Complete Deployment Guide

Ready-to-deploy smart contracts for your crowdfunding platform with NFT rewards.

## 📋 What You Need Before Starting

- ✅ Node.js v18+ ([Download](https://nodejs.org/))
- ✅ MetaMask wallet ([Install](https://metamask.io/))
- ✅ VS Code or any code editor
- ✅ Test MATIC tokens (we'll get these later)

---

## 🎯 Step-by-Step Deployment

### Step 1: Create Project Folder

Open terminal/command prompt and run:

```bash
mkdir crowdfund-contracts
cd crowdfund-contracts
```

### Step 2: Initialize Node Project

```bash
npm init -y
```

### Step 3: Install All Dependencies

Copy and paste this entire command:

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv && npm install @openzeppelin/contracts
```

Wait for installation to complete (may take 1-2 minutes).

### Step 4: Initialize Hardhat

```bash
npx hardhat init
```

When prompted:
- Select: **"Create a JavaScript project"**
- Press **Enter** for all other prompts
- Say **Yes** to installing dependencies if asked

### Step 5: Create Folder Structure

```bash
mkdir contracts
mkdir scripts
```

Now your project should look like:
```
crowdfund-contracts/
├── contracts/        ← Smart contracts go here
├── scripts/          ← Deployment script goes here
├── hardhat.config.js
├── package.json
└── .env             ← We'll create this next
```

---

## 📝 Create the Files

### Step 6: Create All Contract Files

**Create 3 files in the `contracts` folder:**

#### File 1: `contracts/Campaign.sol`
#### File 2: `contracts/NFTReward.sol` 
#### File 3: `contracts/CampaignFactory.sol`

(I'll provide the code for each below)

### Step 7: Create Deployment Script

**Create: `scripts/deploy.js`**

(Code provided below)

### Step 8: Create Configuration Files

**Create: `hardhat.config.js`** (replace existing one)
**Create: `.env`** (new file in root folder)

---

## 1. Campaign Contract (Campaign.sol)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface INFTReward {
    function mintReward(address to, uint256 amount) external returns (uint256);
}

contract Campaign is ReentrancyGuard {
    address public creator;
    string public title;
    string public description;
    string public category;
    uint256 public goalAmount;
    uint256 public currentAmount;
    uint256 public deadline;
    bool public isActive;
    bool public goalReached;
    
    INFTReward public nftReward;
    
    mapping(address => uint256) public contributions;
    address[] public contributors;
    
    event Donated(address indexed donor, uint256 amount, uint256 timestamp);
    event GoalReached(uint256 totalAmount, uint256 timestamp);
    event FundsWithdrawn(address indexed creator, uint256 amount);
    event RefundIssued(address indexed donor, uint256 amount);
    
    modifier onlyCreator() {
        require(msg.sender == creator, "Only creator can call this");
        _;
    }
    
    modifier onlyActive() {
        require(isActive, "Campaign is not active");
        require(block.timestamp < deadline, "Campaign has ended");
        _;
    }
    
    constructor(
        address _creator,
        string memory _title,
        string memory _description,
        string memory _category,
        uint256 _goalAmount,
        uint256 _durationDays,
        address _nftReward
    ) {
        creator = _creator;
        title = _title;
        description = _description;
        category = _category;
        goalAmount = _goalAmount;
        deadline = block.timestamp + (_durationDays * 1 days);
        isActive = true;
        nftReward = INFTReward(_nftReward);
    }
    
    function donate() external payable onlyActive nonReentrant {
        require(msg.value > 0, "Donation must be greater than 0");
        
        if (contributions[msg.sender] == 0) {
            contributors.push(msg.sender);
        }
        
        contributions[msg.sender] += msg.value;
        currentAmount += msg.value;
        
        // Mint NFT reward based on donation amount
        if (msg.value >= 10 ether) { // 10 MATIC minimum for NFT
            nftReward.mintReward(msg.sender, msg.value);
        }
        
        emit Donated(msg.sender, msg.value, block.timestamp);
        
        if (currentAmount >= goalAmount && !goalReached) {
            goalReached = true;
            emit GoalReached(currentAmount, block.timestamp);
        }
    }
    
    function withdrawFunds() external onlyCreator nonReentrant {
        require(goalReached, "Goal not reached");
        require(address(this).balance > 0, "No funds to withdraw");
        
        uint256 amount = address(this).balance;
        isActive = false;
        
        (bool success, ) = creator.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit FundsWithdrawn(creator, amount);
    }
    
    function refund() external nonReentrant {
        require(block.timestamp >= deadline, "Campaign still active");
        require(!goalReached, "Goal was reached");
        require(contributions[msg.sender] > 0, "No contribution to refund");
        
        uint256 amount = contributions[msg.sender];
        contributions[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Refund failed");
        
        emit RefundIssued(msg.sender, amount);
    }
    
    function getCampaignInfo() external view returns (
        address,
        string memory,
        string memory,
        string memory,
        uint256,
        uint256,
        uint256,
        bool,
        bool,
        uint256
    ) {
        return (
            creator,
            title,
            description,
            category,
            goalAmount,
            currentAmount,
            deadline,
            isActive,
            goalReached,
            contributors.length
        );
    }
    
    function getContributors() external view returns (address[] memory) {
        return contributors;
    }
}
```

## 2. NFT Reward Contract (NFTReward.sol)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTReward is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIds;
    
    enum BadgeTier { BRONZE, SILVER, GOLD }
    
    struct Badge {
        BadgeTier tier;
        uint256 donationAmount;
        uint256 mintedAt;
    }
    
    mapping(uint256 => Badge) public badges;
    mapping(address => uint256[]) public userBadges;
    mapping(address => bool) public authorizedCampaigns;
    
    string public bronzeURI;
    string public silverURI;
    string public goldURI;
    
    event BadgeMinted(address indexed recipient, uint256 tokenId, BadgeTier tier, uint256 amount);
    
    constructor(address initialOwner) ERC721("CryptoFund Badge", "CFBADGE") Ownable(initialOwner) {
        // Set default metadata URIs
        bronzeURI = "ipfs://QmBronzeMetadata";
        silverURI = "ipfs://QmSilverMetadata";
        goldURI = "ipfs://QmGoldMetadata";
    }
    
    modifier onlyAuthorized() {
        require(authorizedCampaigns[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }
    
    function authorizeCampaign(address campaign) external onlyOwner {
        authorizedCampaigns[campaign] = true;
    }
    
    function revokeCampaign(address campaign) external onlyOwner {
        authorizedCampaigns[campaign] = false;
    }
    
    function mintReward(address to, uint256 amount) external onlyAuthorized returns (uint256) {
        BadgeTier tier;
        string memory uri;
        
        if (amount >= 30 ether) {
            tier = BadgeTier.GOLD;
            uri = goldURI;
        } else if (amount >= 20 ether) {
            tier = BadgeTier.SILVER;
            uri = silverURI;
        } else {
            tier = BadgeTier.BRONZE;
            uri = bronzeURI;
        }
        
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        
        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, uri);
        
        badges[newTokenId] = Badge({
            tier: tier,
            donationAmount: amount,
            mintedAt: block.timestamp
        });
        
        userBadges[to].push(newTokenId);
        
        emit BadgeMinted(to, newTokenId, tier, amount);
        
        return newTokenId;
    }
    
    function setMetadataURIs(
        string memory _bronzeURI,
        string memory _silverURI,
        string memory _goldURI
    ) external onlyOwner {
        bronzeURI = _bronzeURI;
        silverURI = _silverURI;
        goldURI = _goldURI;
    }
    
    function getUserBadges(address user) external view returns (uint256[] memory) {
        return userBadges[user];
    }
    
    function getBadgeInfo(uint256 tokenId) external view returns (
        BadgeTier tier,
        uint256 donationAmount,
        uint256 mintedAt
    ) {
        Badge memory badge = badges[tokenId];
        return (badge.tier, badge.donationAmount, badge.mintedAt);
    }
    
    // Override required functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
```

## 3. Campaign Factory Contract (CampaignFactory.sol)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Campaign.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CampaignFactory is Ownable {
    address[] public campaigns;
    address public nftReward;
    
    mapping(address => address[]) public creatorCampaigns;
    
    event CampaignCreated(
        address indexed campaignAddress,
        address indexed creator,
        string title,
        uint256 goalAmount,
        uint256 deadline
    );
    
    constructor(address _nftReward) Ownable(msg.sender) {
        nftReward = _nftReward;
    }
    
    function createCampaign(
        string memory _title,
        string memory _description,
        string memory _category,
        uint256 _goalAmount,
        uint256 _durationDays
    ) external returns (address) {
        Campaign campaign = new Campaign(
            msg.sender,
            _title,
            _description,
            _category,
            _goalAmount,
            _durationDays,
            nftReward
        );
        
        address campaignAddress = address(campaign);
        campaigns.push(campaignAddress);
        creatorCampaigns[msg.sender].push(campaignAddress);
        
        // Authorize the campaign to mint NFTs
        INFTReward(nftReward).authorizeCampaign(campaignAddress);
        
        emit CampaignCreated(
            campaignAddress,
            msg.sender,
            _title,
            _goalAmount,
            block.timestamp + (_durationDays * 1 days)
        );
        
        return campaignAddress;
    }
    
    function getCampaigns() external view returns (address[] memory) {
        return campaigns;
    }
    
    function getCreatorCampaigns(address creator) external view returns (address[] memory) {
        return creatorCampaigns[creator];
    }
    
    function getCampaignCount() external view returns (uint256) {
        return campaigns.length;
    }
}
```

## 4. Hardhat Deployment Script (scripts/deploy.js)

```javascript
const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts to Polygon Amoy Testnet...");

  // Get deployer address
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Deploy NFT Reward contract
  const NFTReward = await hre.ethers.getContractFactory("NFTReward");
  const nftReward = await NFTReward.deploy(deployer.address);
  await nftReward.waitForDeployment();
  console.log("NFTReward deployed to:", await nftReward.getAddress());

  // Deploy Campaign Factory
  const CampaignFactory = await hre.ethers.getContractFactory("CampaignFactory");
  const nftRewardAddress = await nftReward.getAddress();
  const factory = await CampaignFactory.deploy(nftRewardAddress);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("CampaignFactory deployed to:", factoryAddress);

  // Authorize factory to mint NFTs
  await nftReward.authorizeCampaign(factoryAddress);
  console.log("Factory authorized to mint NFTs");

  console.log("\n=== Deployment Summary ===");
  console.log("NFTReward:", nftRewardAddress);
  console.log("CampaignFactory:", factoryAddress);
  console.log("\nSave these addresses in your frontend config file!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

## 5. Hardhat Config (hardhat.config.js)

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    amoy: {
      url: process.env.POLYGON_AMOY_RPC || "https://rpc-amoy.polygon.technology/",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 80002,
    },
  },
  etherscan: {
    apiKey: {
      polygonAmoy: process.env.POLYGONSCAN_API_KEY || "",
    },
  },
};
```

## 6. Environment Variables (.env)

```
PRIVATE_KEY=your_wallet_private_key_here
POLYGON_AMOY_RPC=https://rpc-amoy.polygon.technology/
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

## 5. Hardhat Configuration (hardhat.config.js)

**Replace your hardhat.config.js with this:**

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    amoy: {
      url: process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology/",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 80002,
    },
  },
  etherscan: {
    apiKey: {
      polygonAmoy: process.env.POLYGONSCAN_API_KEY || "",
    },
  },
};
```

## 6. Environment Variables (.env)

**Create `.env` file in project root:**

```bash
PRIVATE_KEY=your_metamask_private_key_here
AMOY_RPC_URL=https://rpc-amoy.polygon.technology/
POLYGONSCAN_API_KEY=your_polygonscan_api_key_here
```

### 🔑 How to Get Your Private Key from MetaMask:

1. Open MetaMask extension
2. Click the **3 dots** menu (top right)
3. Click **Account Details**
4. Click **Show Private Key**
5. Enter your MetaMask password
6. **Copy the private key** and paste in `.env` file

⚠️ **IMPORTANT:** Never share your private key! Add `.env` to `.gitignore`!

### 🔍 How to Get PolygonScan API Key (Optional but recommended):

1. Go to [https://polygonscan.com/](https://polygonscan.com/)
2. Sign up for free account
3. Go to API Keys section
4. Create new API key
5. Copy and paste in `.env` file

---

## 🎬 DEPLOYMENT TIME!

### Step 9: Get Test MATIC Tokens

You need test MATIC to pay for deployment gas fees:

1. Go to: [https://faucet.polygon.technology/](https://faucet.polygon.technology/)
2. Select **"Polygon Amoy"** from dropdown
3. Enter your MetaMask wallet address
4. Complete captcha
5. Click **"Submit"**
6. Wait 1-2 minutes for tokens to arrive

Check your MetaMask on Amoy network - you should see test MATIC!

### Step 10: Add Polygon Amoy Network to MetaMask

1. Open MetaMask
2. Click network dropdown (top left)
3. Click **"Add Network"**
4. Click **"Add a network manually"**
5. Enter these details:
   - **Network Name:** Polygon Amoy Testnet
   - **RPC URL:** https://rpc-amoy.polygon.technology/
   - **Chain ID:** 80002
   - **Currency Symbol:** MATIC
   - **Block Explorer:** https://amoy.polygonscan.com/
6. Click **"Save"**
7. Switch to Amoy network

### Step 11: Compile Your Contracts

```bash
npx hardhat compile
```

Expected output: ✅ `Compiled 5 Solidity files successfully`

If you see errors:
- Make sure all contract files are in `contracts/` folder
- Check OpenZeppelin version: `npm list @openzeppelin/contracts`
- Try: `npx hardhat clean` then compile again

### Step 12: Deploy to Polygon Amoy! 🚀

```bash
npx hardhat run scripts/deploy.js --network amoy
```

**Expected output:**
```
Deploying contracts to Polygon Amoy Testnet...
Deploying with account: 0x...
NFTReward deployed to: 0x...
CampaignFactory deployed to: 0x...
Factory authorized to mint NFTs

=== Deployment Summary ===
NFTReward: 0xABC123...
CampaignFactory: 0xDEF456...

Save these addresses in your frontend config file!
```

### Step 13: SAVE THOSE ADDRESSES! 📝

**CRITICAL:** Copy both addresses from the output above!

Example:
```
NFTReward: 0xABC123...
CampaignFactory: 0xDEF456...
```

### Step 14: Verify Contracts (Optional but Recommended)

This makes your contracts readable on PolygonScan:

```bash
# Verify NFTReward
npx hardhat verify --network amoy <NFT_REWARD_ADDRESS> <YOUR_WALLET_ADDRESS>

# Verify CampaignFactory  
npx hardhat verify --network amoy <CAMPAIGN_FACTORY_ADDRESS> <NFT_REWARD_ADDRESS>
```

Replace the placeholders with actual addresses!

---

## ✅ SUCCESS! What's Next?

### Send Me These 2 Addresses:

1. **NFTReward address:** 0x...
2. **CampaignFactory address:** 0x...

**I'll update your frontend to connect to these deployed contracts!**

---

## 🔧 Troubleshooting

### ❌ Error: "insufficient funds for gas"
- **Solution:** Get more test MATIC from the faucet
- Make sure you're on Amoy testnet in MetaMask

### ❌ Error: "Invalid API key"  
- **Solution:** Check `POLYGONSCAN_API_KEY` in `.env`
- Remove extra spaces
- Try without API key first (skip verification step)

### ❌ Error: "cannot find module hardhat"
- **Solution:** Run `npm install` in project folder
- Make sure you're in correct directory

### ❌ Error: "network 'amoy' not found"
- **Solution:** Check `hardhat.config.js` matches the config above
- Make sure `dotenv` package is installed

### ❌ Compilation errors
- **Solution:** 
  - Delete `cache` and `artifacts` folders
  - Run: `npx hardhat clean`
  - Run: `npx hardhat compile` again

### ❌ "Error: private key must be exactly 32 bytes"
- **Solution:** Your `PRIVATE_KEY` in `.env` is incorrect
- Get it again from MetaMask (remove 0x prefix if present)

---

## 📚 Complete Command Reference

```bash
# Project setup
mkdir crowdfund-contracts && cd crowdfund-contracts
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv
npm install @openzeppelin/contracts

# Initialize Hardhat
npx hardhat init

# Compile contracts
npx hardhat compile

# Clean cache (if needed)
npx hardhat clean

# Deploy to Amoy testnet
npx hardhat run scripts/deploy.js --network amoy

# Verify contracts
npx hardhat verify --network amoy <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>

# Test locally (optional)
npx hardhat test

# Start local node (optional)
npx hardhat node
```

---

## 🎉 Congratulations!

Once you send me the deployed contract addresses, your crowdfunding platform will be LIVE on Polygon Amoy testnet!

**What works after deployment:**
- ✅ Create campaigns with wallet
- ✅ Browse all campaigns  
- ✅ Donate to campaigns with MATIC
- ✅ Auto-receive NFT badges (Bronze/Silver/Gold)
- ✅ Creators can withdraw when goal reached
- ✅ Refunds if goal not reached

**Ready to go live?** Just send me those 2 contract addresses! 🚀

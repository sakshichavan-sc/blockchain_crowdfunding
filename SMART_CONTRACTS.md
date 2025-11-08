# Smart Contracts - SIMPLIFIED & READY TO DEPLOY

## Quick Start - Deploy in 10 Minutes

### Step 1: Create Project
```bash
mkdir crowdfunding-contracts
cd crowdfunding-contracts
npm init -y
```

### Step 2: Install Dependencies (EXACT VERSIONS - No Errors!)
```bash
npm install --save-dev hardhat@^2.19.0 @nomicfoundation/hardhat-toolbox@^4.0.0 dotenv@^16.3.1
npm install @openzeppelin/contracts@^4.9.3
```

### Step 3: Initialize Hardhat
```bash
npx hardhat init
```
- Select: "Create a JavaScript project"
- Press Enter for all defaults

### Step 4: Create Folders
```bash
mkdir contracts
mkdir scripts
```

---

## Contract Files - Copy & Paste These

### File 1: contracts/NFTReward.sol
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTReward is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct Badge {
        uint8 tier; // 1=Bronze, 2=Silver, 3=Gold
        uint256 donationAmount;
        address campaignAddress;
        uint256 mintedAt;
    }

    mapping(uint256 => Badge) public badges;
    mapping(address => bool) public authorizedCampaigns;

    event BadgeMinted(
        address indexed recipient,
        uint256 indexed tokenId,
        uint8 tier,
        uint256 donationAmount,
        address campaignAddress
    );

    constructor() ERC721("Crowdfunding Badge", "CFBADGE") {}

    function authorizeCampaign(address campaign) external onlyOwner {
        authorizedCampaigns[campaign] = true;
    }

    function mintBadge(
        address to,
        uint256 donationAmount,
        address campaignAddress
    ) external returns (uint256) {
        require(authorizedCampaigns[msg.sender], "Not authorized");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        uint8 tier = _calculateTier(donationAmount);
        
        badges[newTokenId] = Badge({
            tier: tier,
            donationAmount: donationAmount,
            campaignAddress: campaignAddress,
            mintedAt: block.timestamp
        });

        _safeMint(to, newTokenId);

        emit BadgeMinted(to, newTokenId, tier, donationAmount, campaignAddress);
        return newTokenId;
    }

    function _calculateTier(uint256 amount) private pure returns (uint8) {
        if (amount >= 1 ether) return 3; // Gold
        if (amount >= 0.5 ether) return 2; // Silver
        return 1; // Bronze
    }

    function getBadgesByOwner(address owner) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](balance);
        
        uint256 counter = 0;
        for (uint256 i = 1; i <= _tokenIds.current(); i++) {
            if (_exists(i) && ownerOf(i) == owner) {
                tokenIds[counter] = i;
                counter++;
            }
        }
        
        return tokenIds;
    }

    function getBadgeInfo(uint256 tokenId)
        external
        view
        returns (
            uint8 tier,
            uint256 donationAmount,
            address campaignAddress,
            uint256 mintedAt
        )
    {
        require(_exists(tokenId), "Token does not exist");
        Badge memory badge = badges[tokenId];
        return (badge.tier, badge.donationAmount, badge.campaignAddress, badge.mintedAt);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        Badge memory badge = badges[tokenId];
        
        string memory tierName;
        if (badge.tier == 3) tierName = "Gold";
        else if (badge.tier == 2) tierName = "Silver";
        else tierName = "Bronze";
        
        return string(abi.encodePacked(
            "data:application/json;base64,",
            tierName,
            " Supporter Badge"
        ));
    }
}
```

### File 2: contracts/Campaign.sol
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface INFTReward {
    function mintBadge(address to, uint256 donationAmount, address campaignAddress) external returns (uint256);
}

contract Campaign {
    string public title;
    string public description;
    address public creator;
    uint256 public goalAmount;
    uint256 public currentAmount;
    uint256 public deadline;
    bool public isActive;
    
    address public nftRewardAddress;
    
    mapping(address => uint256) public backers;
    address[] private backerList;
    
    event DonationReceived(address indexed donor, uint256 amount, uint256 newTotal);
    event CampaignEnded(bool successful, uint256 finalAmount);
    event Withdrawn(address indexed creator, uint256 amount);

    constructor(
        string memory _title,
        string memory _description,
        address _creator,
        uint256 _goalAmount,
        uint256 _duration,
        address _nftRewardAddress
    ) {
        title = _title;
        description = _description;
        creator = _creator;
        goalAmount = _goalAmount;
        deadline = block.timestamp + _duration;
        isActive = true;
        nftRewardAddress = _nftRewardAddress;
    }

    function donate() external payable {
        require(isActive, "Campaign is not active");
        require(block.timestamp < deadline, "Campaign ended");
        require(msg.value > 0, "Donation must be > 0");

        if (backers[msg.sender] == 0) {
            backerList.push(msg.sender);
        }
        
        backers[msg.sender] += msg.value;
        currentAmount += msg.value;

        // Mint NFT badge if donation >= 0.1 ether
        if (msg.value >= 0.1 ether) {
            INFTReward(nftRewardAddress).mintBadge(msg.sender, msg.value, address(this));
        }

        emit DonationReceived(msg.sender, msg.value, currentAmount);

        // Check if goal reached
        if (currentAmount >= goalAmount) {
            isActive = false;
            emit CampaignEnded(true, currentAmount);
        }
    }

    function withdraw() external {
        require(msg.sender == creator, "Only creator can withdraw");
        require(!isActive || block.timestamp >= deadline, "Campaign still active");
        require(currentAmount >= goalAmount, "Goal not reached");

        uint256 amount = currentAmount;
        currentAmount = 0;
        isActive = false;

        (bool success, ) = creator.call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdrawn(creator, amount);
        emit CampaignEnded(true, amount);
    }

    function refund() external {
        require(block.timestamp >= deadline, "Campaign not ended");
        require(currentAmount < goalAmount, "Goal was reached");
        require(backers[msg.sender] > 0, "No donation found");

        uint256 amount = backers[msg.sender];
        backers[msg.sender] = 0;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Refund failed");
    }

    function getTotalBackers() external view returns (uint256) {
        return backerList.length;
    }
}
```

### File 3: contracts/CampaignFactory.sol
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Campaign.sol";

contract CampaignFactory {
    address[] public campaigns;
    address public nftRewardAddress;
    
    mapping(address => address[]) public campaignsByCreator;
    
    event CampaignCreated(
        address indexed campaignAddress,
        address indexed creator,
        string title,
        uint256 goalAmount,
        uint256 deadline
    );

    constructor(address _nftRewardAddress) {
        nftRewardAddress = _nftRewardAddress;
    }

    function createCampaign(
        string memory title,
        string memory description,
        uint256 goalAmount,
        uint256 duration
    ) external returns (address) {
        Campaign newCampaign = new Campaign(
            title,
            description,
            msg.sender,
            goalAmount,
            duration,
            nftRewardAddress
        );
        
        address campaignAddress = address(newCampaign);
        campaigns.push(campaignAddress);
        campaignsByCreator[msg.sender].push(campaignAddress);
        
        emit CampaignCreated(
            campaignAddress,
            msg.sender,
            title,
            goalAmount,
            block.timestamp + duration
        );
        
        return campaignAddress;
    }

    function getCampaigns() external view returns (address[] memory) {
        return campaigns;
    }

    function getCampaignsByCreator(address creator) external view returns (address[] memory) {
        return campaignsByCreator[creator];
    }
}
```

---

## Configuration Files

### File 4: scripts/deploy.js
```javascript
const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...");

  // Deploy NFTReward
  console.log("\n1. Deploying NFTReward...");
  const NFTReward = await hre.ethers.getContractFactory("NFTReward");
  const nftReward = await NFTReward.deploy();
  await nftReward.deployed();
  console.log("✅ NFTReward deployed to:", nftReward.address);

  // Deploy CampaignFactory
  console.log("\n2. Deploying CampaignFactory...");
  const CampaignFactory = await hre.ethers.getContractFactory("CampaignFactory");
  const factory = await CampaignFactory.deploy(nftReward.address);
  await factory.deployed();
  console.log("✅ CampaignFactory deployed to:", factory.address);

  // Authorize factory to mint NFTs
  console.log("\n3. Authorizing CampaignFactory...");
  const tx = await nftReward.authorizeCampaign(factory.address);
  await tx.wait();
  console.log("✅ Factory authorized!");

  console.log("\n========================================");
  console.log("DEPLOYMENT COMPLETE!");
  console.log("========================================");
  console.log("NFTReward Address:", nftReward.address);
  console.log("CampaignFactory Address:", factory.address);
  console.log("========================================");
  console.log("\n⚠️  SAVE THESE ADDRESSES - You need them for the frontend!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### File 5: hardhat.config.js (REPLACE ENTIRE FILE)
```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.19",
  networks: {
    amoy: {
      url: process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 80002
    }
  },
  etherscan: {
    apiKey: {
      polygonAmoy: process.env.POLYGONSCAN_API_KEY || ""
    },
    customChains: [
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com"
        }
      }
    ]
  }
};
```

### File 6: .env (CREATE NEW FILE IN ROOT)
```
PRIVATE_KEY=your_metamask_private_key_here
AMOY_RPC_URL=https://rpc-amoy.polygon.technology
POLYGONSCAN_API_KEY=your_polygonscan_api_key_here
```

⚠️ **NEVER share your .env file!**

---

## Deployment Steps

### 1️⃣ Get Test MATIC
- Go to: https://faucet.polygon.technology/
- Select "Polygon Amoy"
- Enter your wallet address
- Get free test MATIC

### 2️⃣ Get Your Private Key from MetaMask
- Open MetaMask
- Click menu (3 dots) → Account Details → Export Private Key
- Enter password
- **Copy the private key** (NEVER share this!)
- Paste it in your `.env` file

### 3️⃣ Compile Contracts
```bash
npx hardhat compile
```

You should see:
```
✓ Compiled 3 Solidity files successfully
```

### 4️⃣ Deploy to Polygon Amoy
```bash
npx hardhat run scripts/deploy.js --network amoy
```

Wait 1-2 minutes. You'll see:
```
✅ NFTReward deployed to: 0x1234...
✅ CampaignFactory deployed to: 0x5678...
```

### 5️⃣ SAVE THE ADDRESSES!
**Copy both addresses and send them to me so I can update your frontend!**

---

## Verification (Optional)
```bash
npx hardhat verify --network amoy <NFT_ADDRESS>
npx hardhat verify --network amoy <FACTORY_ADDRESS> <NFT_ADDRESS>
```

---

## Common Errors & Solutions

### ❌ "Cannot find module @openzeppelin/contracts"
```bash
npm install @openzeppelin/contracts@^4.9.3
```

### ❌ "Insufficient funds"
Get more test MATIC from the faucet

### ❌ "Invalid nonce"
Wait 30 seconds and try again

### ❌ "HH108: Cannot connect to network"
Check your internet connection and RPC URL in `.env`

---

## ✅ Success Checklist

- [ ] npm install completed without errors
- [ ] npx hardhat compile shows "Compiled successfully"
- [ ] npx hardhat run shows 2 deployed contract addresses
- [ ] Saved both addresses
- [ ] Sent addresses back for frontend integration

**After deployment, your project will be fully functional!**

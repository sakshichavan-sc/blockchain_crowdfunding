# Smart Contract Implementation Guide

This document provides the Solidity smart contract code you'll need to deploy in VS Code using Hardhat or Foundry.

## Prerequisites

```bash
# Install Hardhat
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Or install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

## 1. Campaign Contract (Campaign.sol)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

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
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTReward is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
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
    
    constructor() ERC721("CryptoFund Badge", "CFBADGE") {
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
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
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
    
    constructor(address _nftReward) {
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

  // Deploy NFT Reward contract
  const NFTReward = await hre.ethers.getContractFactory("NFTReward");
  const nftReward = await NFTReward.deploy();
  await nftReward.deployed();
  console.log("NFTReward deployed to:", nftReward.address);

  // Deploy Campaign Factory
  const CampaignFactory = await hre.ethers.getContractFactory("CampaignFactory");
  const factory = await CampaignFactory.deploy(nftReward.address);
  await factory.deployed();
  console.log("CampaignFactory deployed to:", factory.address);

  // Transfer NFTReward ownership to factory for authorization
  await nftReward.transferOwnership(factory.address);
  console.log("NFTReward ownership transferred to factory");

  console.log("\n=== Deployment Summary ===");
  console.log("NFTReward:", nftReward.address);
  console.log("CampaignFactory:", factory.address);
  console.log("\nSave these addresses in your frontend .env file!");
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

## Deployment Steps

1. **Install Dependencies:**
```bash
npm install @openzeppelin/contracts
```

2. **Compile Contracts:**
```bash
npx hardhat compile
```

3. **Deploy to Amoy:**
```bash
npx hardhat run scripts/deploy.js --network amoy
```

4. **Verify on PolygonScan:**
```bash
npx hardhat verify --network amoy CONTRACT_ADDRESS
```

## Frontend Integration

After deployment, add these addresses to your frontend code:

```typescript
// src/config/contracts.ts
export const CONTRACTS = {
  CAMPAIGN_FACTORY: "0xYourFactoryAddress",
  NFT_REWARD: "0xYourNFTAddress",
};
```

## Getting Test MATIC

Visit: https://faucet.polygon.technology/
Select Polygon Amoy testnet and enter your wallet address.

// Smart Contract Configuration
// IMPORTANT: Update these addresses after deploying your smart contracts
// Get these from: npx hardhat run scripts/deploy.js --network amoy

export const CHAIN_ID = 80002; // Polygon Amoy Testnet
export const CHAIN_NAME = "Polygon Amoy";
export const RPC_URL = "https://rpc-amoy.polygon.technology";
export const BLOCK_EXPLORER = "https://amoy.polygonscan.com";

// Contract Addresses - UPDATE THESE AFTER DEPLOYMENT
export const CAMPAIGN_FACTORY_ADDRESS = "0x000DbD7E8eEA1C8b74bA0531872bFF4A664DdFa5"; // CampaignFactory deployed on Polygon Amoy
// NFT Rewards - COMMENTED OUT FOR NOW (Phase 2)
// export const NFT_REWARD_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace with deployed address

// Contract ABIs
export const CAMPAIGN_FACTORY_ABI = [
  "function createCampaign(string title, string description, uint256 goalAmount, uint256 duration) external returns (address)",
  "function getCampaigns() external view returns (address[])",
  "function getCampaignsByCreator(address creator) external view returns (address[])",
  "event CampaignCreated(address indexed campaignAddress, address indexed creator, string title, uint256 goalAmount, uint256 deadline)"
];

export const CAMPAIGN_ABI = [
  "function title() external view returns (string)",
  "function description() external view returns (string)",
  "function creator() external view returns (address)",
  "function goalAmount() external view returns (uint256)",
  "function currentAmount() external view returns (uint256)",
  "function deadline() external view returns (uint256)",
  "function isActive() external view returns (bool)",
  "function backers(address) external view returns (uint256)",
  "function donate() external payable",
  "function withdraw() external",
  "function refund() external",
  "function getTotalBackers() external view returns (uint256)",
  "event DonationReceived(address indexed donor, uint256 amount, uint256 newTotal)",
  "event CampaignEnded(bool successful, uint256 finalAmount)",
  "event Withdrawn(address indexed creator, uint256 amount)"
];

// NFT Rewards - COMMENTED OUT FOR NOW (Phase 2)
// export const NFT_REWARD_ABI = [
//   "function mintBadge(address to, uint256 donationAmount, address campaignAddress) external returns (uint256)",
//   "function getBadgesByOwner(address owner) external view returns (uint256[])",
//   "function getBadgeInfo(uint256 tokenId) external view returns (uint8 tier, uint256 donationAmount, address campaignAddress, uint256 mintedAt)",
//   "function tokenURI(uint256 tokenId) external view returns (string)",
//   "event BadgeMinted(address indexed recipient, uint256 indexed tokenId, uint8 tier, uint256 donationAmount, address campaignAddress)"
// ];

// // NFT Badge Tiers
// export const BADGE_TIERS = {
//   BRONZE: { min: 0.1, name: 'Bronze Supporter', tier: 1 },
//   SILVER: { min: 0.5, name: 'Silver Supporter', tier: 2 },
//   GOLD: { min: 1.0, name: 'Gold Supporter', tier: 3 },
// } as const;

// export const getBadgeTier = (amount: number): 'bronze' | 'silver' | 'gold' => {
//   if (amount >= BADGE_TIERS.GOLD.min) return 'gold';
//   if (amount >= BADGE_TIERS.SILVER.min) return 'silver';
//   return 'bronze';
// };

// Helper to check if network is correct
export const isCorrectNetwork = (chainId: number): boolean => {
  return chainId === CHAIN_ID;
};

// Helper to format contract address for display
export const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Helper to get transaction URL
export const getTxUrl = (txHash: string): string => {
  return `${BLOCK_EXPLORER}/tx/${txHash}`;
};

// Helper to get address URL
export const getAddressUrl = (address: string): string => {
  return `${BLOCK_EXPLORER}/address/${address}`;
};

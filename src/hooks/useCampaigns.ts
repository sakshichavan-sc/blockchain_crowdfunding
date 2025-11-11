import { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  CAMPAIGN_FACTORY_ADDRESS,
  CAMPAIGN_FACTORY_ABI,
  CAMPAIGN_ABI,
  RPC_URL,
} from "@/config/contracts";

export interface Campaign {
  id: string;
  address: string;
  title: string;
  description: string;
  category: string;
  goalAmount: number;
  currentAmount: number;
  deadline: Date;
  creator: string;
  backers: number;
  isActive: boolean;
}

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create provider using Polygon Amoy RPC
      const provider = new ethers.JsonRpcProvider(RPC_URL);

      // Get factory contract
      const factory = new ethers.Contract(
        CAMPAIGN_FACTORY_ADDRESS,
        CAMPAIGN_FACTORY_ABI,
        provider
      );

      // Get all campaign addresses
      const campaignAddresses = await factory.getCampaigns();
      console.log(`Found ${campaignAddresses.length} campaigns`);

      // Fetch details for each campaign
      const campaignDetails = await Promise.all(
        campaignAddresses.map(async (address: string, index: number) => {
          try {
            const campaign = new ethers.Contract(
              address,
              CAMPAIGN_ABI,
              provider
            );

            const [
              title,
              description,
              creator,
              goalAmount,
              currentAmount,
              deadline,
              isActive,
              totalBackers,
            ] = await Promise.all([
              campaign.title(),
              campaign.description(),
              campaign.creator(),
              campaign.goalAmount(),
              campaign.currentAmount(),
              campaign.deadline(),
              campaign.isActive(),
              campaign.getTotalBackers(),
            ]);

            return {
              id: index.toString(),
              address,
              title,
              description,
              category: "general", // You can enhance this later
              goalAmount: parseFloat(ethers.formatEther(goalAmount)),
              currentAmount: parseFloat(ethers.formatEther(currentAmount)),
              deadline: new Date(Number(deadline) * 1000),
              creator,
              backers: Number(totalBackers),
              isActive,
            };
          } catch (err) {
            console.error(`Error fetching campaign ${address}:`, err);
            return null;
          }
        })
      );

      // Filter out failed fetches and set campaigns
      const validCampaigns = campaignDetails.filter(
        (c): c is Campaign => c !== null
      );
      setCampaigns(validCampaigns);
    } catch (err: any) {
      console.error("Error fetching campaigns:", err);
      setError(err.message || "Failed to fetch campaigns");
    } finally {
      setLoading(false);
    }
  };

  return { campaigns, loading, error, refetch: fetchCampaigns };
};

// Backend API Configuration
// Update this URL when deploying to production
export const API_BASE_URL = "http://localhost:5000/api";

// API Response Types
export interface Campaign {
  _id?: string;
  campaignAddress: string;
  title: string;
  description: string;
  category: string;
  goalAmount: number;
  currentAmount: number;
  deadline: string;
  creator: string;
  backers: number;
  image?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Donation {
  _id?: string;
  campaignAddress: string;
  campaignTitle: string;
  donor: string;
  amount: number;
  transactionHash: string;
  timestamp: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface NFTBadge {
  _id?: string;
  tokenId: number;
  tier: 'bronze' | 'silver' | 'gold';
  amount: number;
  owner: string;
  campaignAddress: string;
  transactionHash: string;
  mintedAt: string;
}

export interface DonorStats {
  totalDonated: number;
  campaignsBacked: number;
  nftBadges: number;
  donations: Donation[];
  badges: NFTBadge[];
}

// API Client
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Campaign APIs
  campaigns = {
    // Get all campaigns with optional filters
    getAll: async (params?: {
      category?: string;
      isActive?: boolean;
      sortBy?: string;
    }): Promise<Campaign[]> => {
      const queryParams = new URLSearchParams();
      if (params?.category) queryParams.append('category', params.category);
      if (params?.isActive !== undefined) queryParams.append('isActive', String(params.isActive));
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      
      const query = queryParams.toString();
      return this.request<Campaign[]>(`/campaigns${query ? `?${query}` : ''}`);
    },

    // Get campaign by address
    getByAddress: async (address: string): Promise<Campaign> => {
      return this.request<Campaign>(`/campaigns/${address}`);
    },

    // Create new campaign (called after blockchain deployment)
    create: async (campaignData: Partial<Campaign>): Promise<Campaign> => {
      return this.request<Campaign>('/campaigns', {
        method: 'POST',
        body: JSON.stringify(campaignData),
      });
    },

    // Update campaign (for amounts, backers, etc.)
    update: async (address: string, updates: Partial<Campaign>): Promise<Campaign> => {
      return this.request<Campaign>(`/campaigns/${address}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },

    // Sync all campaigns from blockchain
    syncAll: async (): Promise<{ synced: number; campaigns: Campaign[] }> => {
      return this.request('/campaigns/sync', {
        method: 'POST',
      });
    },

    // Get campaign statistics
    getStats: async (): Promise<{
      totalCampaigns: number;
      activeCampaigns: number;
      totalFunded: number;
      totalBackers: number;
    }> => {
      return this.request('/campaigns/stats');
    },
  };

  // Donor APIs
  donors = {
    // Get all donations for a donor
    getDonations: async (address: string): Promise<Donation[]> => {
      return this.request<Donation[]>(`/donors/${address}/donations`);
    },

    // Get all NFT badges for a donor
    getBadges: async (address: string): Promise<NFTBadge[]> => {
      return this.request<NFTBadge[]>(`/donors/${address}/badges`);
    },

    // Get donor statistics
    getStats: async (address: string): Promise<DonorStats> => {
      return this.request<DonorStats>(`/donors/${address}/stats`);
    },

    // Record a new donation (called after blockchain transaction)
    recordDonation: async (donationData: Partial<Donation>): Promise<Donation> => {
      return this.request<Donation>(`/donors/${donationData.donor}/donations`, {
        method: 'POST',
        body: JSON.stringify(donationData),
      });
    },
  };
}

// Export singleton instance
export const api = new ApiClient(API_BASE_URL);

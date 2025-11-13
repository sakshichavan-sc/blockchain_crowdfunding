import { useState } from "react";
import { CampaignCard } from "@/components/campaigns/CampaignCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/layout/Navbar";
import { TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { useCampaigns } from "@/hooks/useCampaigns";

const categories = [
  "all",
  "general",
  "education",
  "health",
  "business",
  "market",
  "tech",
  "other",
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"trending" | "new">("trending");
  const { campaigns, loading, error } = useCampaigns();

  const filteredCampaigns = campaigns.filter(
    (campaign) =>
      selectedCategory === "all" || campaign.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-background" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000">
              Fund the Future with Crypto
            </h1>
            <p className="text-xl text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
              Decentralized crowdfunding on Polygon. Back projects, earn NFT
              rewards, and build a better tomorrow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
              <Button
                size="lg"
                className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity text-lg px-8"
              >
                <Sparkles className="h-5 w-5" />
                Explore Campaigns
              </Button>
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Create Campaign
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-border/50 bg-card/30">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">250+</div>
              <div className="text-sm text-muted-foreground">
                Active Campaigns
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">1.2M</div>
              <div className="text-sm text-muted-foreground">
                MATIC Raised
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-success">5,400+</div>
              <div className="text-sm text-muted-foreground">Backers</div>
            </div>
            {/* NFT Stats - COMMENTED OUT FOR NOW (Phase 2) */}
            {/* <div>
              <div className="text-3xl font-bold text-gold">3,200+</div>
              <div className="text-sm text-muted-foreground">NFTs Minted</div>
            </div> */}
          </div>
        </div>
      </section>

      {/* Campaigns Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              Discover Campaigns
            </h2>
            <p className="text-muted-foreground">
              Back projects that matter to you
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant={sortBy === "trending" ? "default" : "secondary"}
              onClick={() => setSortBy("trending")}
              className="gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Trending
            </Button>
            <Button
              variant={sortBy === "new" ? "default" : "secondary"}
              onClick={() => setSortBy("new")}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              New
            </Button>
          </div>
        </div>

        <Tabs
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          className="mb-8"
        >
          <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent">
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="capitalize data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">
              Loading campaigns from blockchain...
            </span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive mb-2">Failed to load campaigns</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>

            {filteredCampaigns.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {campaigns.length === 0
                    ? "No campaigns created yet. Be the first to create one!"
                    : "No campaigns found in this category"}
                </p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

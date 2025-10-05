import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BadgeDisplay } from "@/components/nft/BadgeDisplay";
import { Award, TrendingUp, Heart } from "lucide-react";

// Mock data
const mockBadges = [
  { tier: "gold" as const, amount: 35, tokenId: 1234 },
  { tier: "silver" as const, amount: 22, tokenId: 5678 },
  { tier: "bronze" as const, amount: 15, tokenId: 9012 },
];

const mockDonations = [
  {
    campaignId: "1",
    campaignTitle: "Build a School in Rural India",
    amount: 35,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: "active",
  },
  {
    campaignId: "2",
    campaignTitle: "Medical Equipment for Local Clinic",
    amount: 22,
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    status: "active",
  },
  {
    campaignId: "5",
    campaignTitle: "Open Source Educational Platform",
    amount: 15,
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    status: "successful",
  },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("badges");

  const totalDonated = mockDonations.reduce(
    (sum, donation) => sum + donation.amount,
    0
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              My Dashboard
            </h1>
            <p className="text-muted-foreground">
              Track your donations and NFT rewards
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Donated
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {totalDonated} MATIC
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-success/10 to-info/10 border-success/20">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-success/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Campaigns Backed
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {mockDonations.length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-gold/10 to-warning/10 border-gold/20">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-gold/20 flex items-center justify-center">
                  <Award className="h-6 w-6 text-gold" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">NFT Badges</p>
                  <p className="text-2xl font-bold text-foreground">
                    {mockBadges.length}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="badges" className="gap-2">
                <Award className="h-4 w-4" />
                My NFT Badges
              </TabsTrigger>
              <TabsTrigger value="donations" className="gap-2">
                <Heart className="h-4 w-4" />
                Donation History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="badges">
              <BadgeDisplay badges={mockBadges} />
            </TabsContent>

            <TabsContent value="donations">
              <div className="space-y-4">
                {mockDonations.map((donation, index) => (
                  <Card
                    key={index}
                    className="p-6 bg-card/50 backdrop-blur-sm border-border/50"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">
                          {donation.campaignTitle}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {donation.date.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            {donation.amount} MATIC
                          </p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {donation.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Clock, Target, Users, ArrowLeft, Award } from "lucide-react";

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [donationAmount, setDonationAmount] = useState("");
  const [isDonating, setIsDonating] = useState(false);

  // Mock data - replace with blockchain data
  const campaign = {
    id: id || "1",
    title: "Build a School in Rural India",
    description:
      "Help us construct a primary school to provide quality education to 500+ children in underserved communities. This project will transform lives and create lasting impact in the region.",
    category: "education",
    goalAmount: 100,
    currentAmount: 65,
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    creator: "0x1234567890abcdef",
    backers: 45,
    image: "",
  };

  const progress = (campaign.currentAmount / campaign.goalAmount) * 100;
  const daysLeft = Math.ceil(
    (campaign.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const handleDonate = async () => {
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid donation amount",
        variant: "destructive",
      });
      return;
    }

    setIsDonating(true);

    // Simulate blockchain transaction
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const amount = parseFloat(donationAmount);
    let badge = "";
    if (amount >= 30) badge = "Gold";
    else if (amount >= 20) badge = "Silver";
    else if (amount >= 10) badge = "Bronze";

    toast({
      title: "Donation Successful!",
      description: badge
        ? `Thank you for donating ${amount} MATIC! You earned a ${badge} badge NFT!`
        : `Thank you for donating ${amount} MATIC!`,
    });

    setIsDonating(false);
    setDonationAmount("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Campaigns
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl overflow-hidden">
              {campaign.image ? (
                <img
                  src={campaign.image}
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-primary/30">
                  {campaign.title.charAt(0)}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-primary text-primary-foreground capitalize">
                  {campaign.category}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Created by {campaign.creator.slice(0, 6)}...
                  {campaign.creator.slice(-4)}
                </span>
              </div>

              <h1 className="text-4xl font-bold text-foreground mb-4">
                {campaign.title}
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed">
                {campaign.description}
              </p>
            </div>

            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Campaign Details
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Campaign ID</span>
                  <span className="font-mono text-sm">{campaign.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Creator</span>
                  <span className="font-mono text-sm">
                    {campaign.creator.slice(0, 10)}...{campaign.creator.slice(-8)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="secondary">Active</Badge>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50 sticky top-20">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-3xl font-bold text-foreground">
                      {campaign.currentAmount}
                    </span>
                    <span className="text-muted-foreground">
                      / {campaign.goalAmount} MATIC
                    </span>
                  </div>
                  <Progress value={progress} className="h-3 mb-2" />
                  <p className="text-sm font-medium text-primary">
                    {progress.toFixed(1)}% funded
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center py-4 border-y border-border/50">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Days Left</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {daysLeft}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">Backers</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {campaign.backers}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="amount">Donation Amount (MATIC)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="10"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    className="bg-background"
                  />

                  <Button
                    onClick={handleDonate}
                    disabled={isDonating}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity text-lg py-6"
                  >
                    {isDonating ? "Processing..." : "Donate Now"}
                  </Button>

                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Award className="h-4 w-4" />
                      NFT Reward Tiers
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>🥉 Bronze Badge: 10+ MATIC</p>
                      <p>🥈 Silver Badge: 20+ MATIC</p>
                      <p>🥇 Gold Badge: 30+ MATIC</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

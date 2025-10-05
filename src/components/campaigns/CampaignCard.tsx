import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Target, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Campaign {
  id: string;
  title: string;
  description: string;
  category: string;
  goalAmount: number;
  currentAmount: number;
  deadline: Date;
  creator: string;
  backers: number;
  image?: string;
}

interface CampaignCardProps {
  campaign: Campaign;
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    education: "hsl(var(--category-education))",
    health: "hsl(var(--category-health))",
    business: "hsl(var(--category-business))",
    market: "hsl(var(--category-market))",
    tech: "hsl(var(--category-tech))",
    other: "hsl(var(--category-other))",
  };
  return colors[category.toLowerCase()] || colors.other;
};

export const CampaignCard = ({ campaign }: CampaignCardProps) => {
  const navigate = useNavigate();
  const progress = (campaign.currentAmount / campaign.goalAmount) * 100;
  const daysLeft = Math.ceil(
    (campaign.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_-10px_hsl(var(--primary)/0.3)]">
      <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden">
        {campaign.image ? (
          <img src={campaign.image} alt={campaign.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-primary/30">
            {campaign.title.charAt(0)}
          </div>
        )}
        <Badge
          className="absolute top-4 right-4"
          style={{
            backgroundColor: getCategoryColor(campaign.category),
            color: "hsl(var(--foreground))",
          }}
        >
          {campaign.category}
        </Badge>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-1">
            {campaign.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {campaign.description}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold text-foreground">
              {campaign.currentAmount} / {campaign.goalAmount} MATIC
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="text-sm font-medium text-primary">
            {progress.toFixed(1)}% funded
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{daysLeft > 0 ? `${daysLeft} days left` : "Ended"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{campaign.backers} backers</span>
          </div>
        </div>

        <Button
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
          onClick={() => navigate(`/campaign/${campaign.id}`)}
        >
          View Details
        </Button>
      </div>
    </Card>
  );
};

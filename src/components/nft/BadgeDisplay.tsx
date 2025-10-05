import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";

interface NFTBadge {
  tier: "bronze" | "silver" | "gold";
  amount: number;
  tokenId?: number;
  image?: string;
}

interface BadgeDisplayProps {
  badges: NFTBadge[];
}

const getBadgeStyle = (tier: string) => {
  const styles = {
    bronze: {
      bg: "hsl(var(--bronze))",
      gradient: "from-orange-600 to-orange-400",
      text: "Bronze Supporter",
    },
    silver: {
      bg: "hsl(var(--silver))",
      gradient: "from-gray-400 to-gray-200",
      text: "Silver Supporter",
    },
    gold: {
      bg: "hsl(var(--gold))",
      gradient: "from-yellow-500 to-yellow-300",
      text: "Gold Supporter",
    },
  };
  return styles[tier as keyof typeof styles] || styles.bronze;
};

export const BadgeDisplay = ({ badges }: BadgeDisplayProps) => {
  if (badges.length === 0) {
    return (
      <Card className="p-8 text-center bg-card/50 backdrop-blur-sm border-border/50">
        <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No Badges Yet
        </h3>
        <p className="text-sm text-muted-foreground">
          Donate to campaigns to earn NFT badges!
        </p>
        <div className="mt-6 space-y-2 text-sm text-muted-foreground">
          <p>🥉 Bronze: Donate 10+ MATIC</p>
          <p>🥈 Silver: Donate 20+ MATIC</p>
          <p>🥇 Gold: Donate 30+ MATIC</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {badges.map((badge, index) => {
        const style = getBadgeStyle(badge.tier);
        return (
          <Card
            key={index}
            className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300"
          >
            <div
              className={`aspect-square bg-gradient-to-br ${style.gradient} flex items-center justify-center relative`}
            >
              <Award className="h-24 w-24 text-white drop-shadow-lg" />
              {badge.tokenId && (
                <Badge className="absolute top-4 right-4 bg-black/50 text-white border-0">
                  #{badge.tokenId}
                </Badge>
              )}
            </div>
            <div className="p-4 text-center">
              <h4 className="font-semibold text-foreground mb-1">
                {style.text}
              </h4>
              <p className="text-sm text-muted-foreground">
                {badge.amount} MATIC donated
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

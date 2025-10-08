import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Presentation = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    // Slide 1: Title
    {
      title: "CryptoFund",
      subtitle: "Decentralized Crowdfunding Platform",
      content: (
        <div className="space-y-8">
          <p className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Blockchain-Powered Crowdfunding with NFT Rewards
          </p>
          <div className="text-2xl space-y-2">
            <p className="font-semibold">Team Members:</p>
            <p className="text-muted-foreground">[Your Team Name]</p>
          </div>
        </div>
      ),
      gradient: "from-primary/20 via-background to-background"
    },
    // Slide 2: Product Opportunity
    {
      title: "Product Opportunity",
      content: (
        <div className="space-y-6 text-xl">
          <p className="text-2xl font-semibold">The Crowdfunding Market</p>
          <ul className="space-y-4 list-none">
            <li>• $17.2 billion global crowdfunding market in 2023</li>
            <li>• 65% of campaigns fail due to lack of trust</li>
            <li>• High platform fees (5-12%) reduce creator funding</li>
            <li>• Limited transparency in fund management</li>
            <li>• Growing demand for Web3 solutions</li>
          </ul>
        </div>
      ),
      gradient: "from-blue-500/10 via-background to-background"
    },
    // Slide 3: Product Idea
    {
      title: "Product Idea",
      content: (
        <div className="space-y-6 text-xl">
          <p className="text-2xl font-semibold mb-4">Transparent & Rewarding Crowdfunding</p>
          <div className="space-y-4">
            <p>A decentralized crowdfunding platform built on Polygon blockchain that ensures:</p>
            <ul className="space-y-3 list-none">
              <li>✓ Complete transparency of fund flow</li>
              <li>✓ Lower fees through smart contracts</li>
              <li>✓ NFT badges as donor rewards</li>
              <li>✓ Immutable campaign records</li>
              <li>✓ Direct creator-donor connection</li>
            </ul>
          </div>
        </div>
      ),
      gradient: "from-purple-500/10 via-background to-background"
    },
    // Slide 4: Target Market
    {
      title: "Target Market & Stakeholders",
      content: (
        <div className="space-y-6 text-lg">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="text-xl font-semibold text-primary">Campaign Creators</p>
              <ul className="space-y-2 list-none">
                <li>• Startups & entrepreneurs</li>
                <li>• Social cause organizations</li>
                <li>• Artists & content creators</li>
              </ul>
            </div>
            <div className="space-y-3">
              <p className="text-xl font-semibold text-primary">Donors</p>
              <ul className="space-y-2 list-none">
                <li>• Crypto enthusiasts</li>
                <li>• Impact investors</li>
                <li>• Early adopters</li>
              </ul>
            </div>
          </div>
          <div className="space-y-3 mt-6">
            <p className="text-xl font-semibold text-primary">End Users</p>
            <p>Anyone seeking transparent, low-fee crowdfunding with blockchain verification and collectible rewards</p>
          </div>
        </div>
      ),
      gradient: "from-green-500/10 via-background to-background"
    },
    // Slide 5: Pain Points
    {
      title: "Pain Points",
      content: (
        <div className="space-y-5 text-xl">
          <div className="space-y-4">
            <div className="border-l-4 border-destructive pl-4">
              <p className="font-semibold">High Platform Fees</p>
              <p className="text-muted-foreground text-lg">Traditional platforms charge 5-12% + payment processing</p>
            </div>
            <div className="border-l-4 border-destructive pl-4">
              <p className="font-semibold">Lack of Transparency</p>
              <p className="text-muted-foreground text-lg">No visibility into fund usage and allocation</p>
            </div>
            <div className="border-l-4 border-destructive pl-4">
              <p className="font-semibold">Trust Issues</p>
              <p className="text-muted-foreground text-lg">Donors uncertain about fund delivery</p>
            </div>
            <div className="border-l-4 border-destructive pl-4">
              <p className="font-semibold">Limited Donor Recognition</p>
              <p className="text-muted-foreground text-lg">No lasting proof or rewards for contributions</p>
            </div>
          </div>
        </div>
      ),
      gradient: "from-red-500/10 via-background to-background"
    },
    // Slide 6: Value Proposition
    {
      title: "Value Proposition",
      content: (
        <div className="space-y-6 text-xl">
          <p className="text-2xl font-bold text-primary">Why CryptoFund?</p>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="text-4xl">🔒</div>
              <p className="font-semibold">Trustless & Transparent</p>
              <p className="text-muted-foreground text-base">Blockchain-verified transactions</p>
            </div>
            <div className="space-y-3">
              <div className="text-4xl">💰</div>
              <p className="font-semibold">Lower Fees</p>
              <p className="text-muted-foreground text-base">Smart contracts reduce costs</p>
            </div>
            <div className="space-y-3">
              <div className="text-4xl">🎖️</div>
              <p className="font-semibold">NFT Rewards</p>
              <p className="text-muted-foreground text-base">Collectible donor badges</p>
            </div>
            <div className="space-y-3">
              <div className="text-4xl">⚡</div>
              <p className="font-semibold">Fast & Global</p>
              <p className="text-muted-foreground text-base">Instant worldwide access</p>
            </div>
          </div>
        </div>
      ),
      gradient: "from-yellow-500/10 via-background to-background"
    },
    // Slide 7: Key Features
    {
      title: "Key Features",
      content: (
        <div className="space-y-4 text-lg">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="font-semibold text-primary mb-2">Campaign Creation</p>
              <p className="text-muted-foreground text-sm">Deploy smart contract campaigns with goals & deadlines</p>
            </div>
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="font-semibold text-primary mb-2">Crypto Donations</p>
              <p className="text-muted-foreground text-sm">Accept MATIC with instant on-chain confirmation</p>
            </div>
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="font-semibold text-primary mb-2">NFT Badges</p>
              <p className="text-muted-foreground text-sm">Auto-mint collectible rewards for donors</p>
            </div>
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="font-semibold text-primary mb-2">Real-time Tracking</p>
              <p className="text-muted-foreground text-sm">Monitor campaign progress & blockchain sync</p>
            </div>
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="font-semibold text-primary mb-2">Creator Dashboard</p>
              <p className="text-muted-foreground text-sm">Manage campaigns and view analytics</p>
            </div>
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="font-semibold text-primary mb-2">MetaMask Integration</p>
              <p className="text-muted-foreground text-sm">Seamless wallet connection & transactions</p>
            </div>
          </div>
        </div>
      ),
      gradient: "from-cyan-500/10 via-background to-background"
    },
    // Slide 8: Workflow
    {
      title: "App Workflow",
      content: (
        <div className="space-y-4 text-base">
          <div className="flex items-center justify-center gap-4">
            <div className="text-center space-y-2 flex-1">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto text-2xl">1</div>
              <p className="font-semibold">Connect Wallet</p>
              <p className="text-muted-foreground text-sm">MetaMask + Polygon</p>
            </div>
            <div className="text-2xl text-muted-foreground">→</div>
            <div className="text-center space-y-2 flex-1">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto text-2xl">2</div>
              <p className="font-semibold">Create/Browse</p>
              <p className="text-muted-foreground text-sm">Campaigns</p>
            </div>
            <div className="text-2xl text-muted-foreground">→</div>
            <div className="text-center space-y-2 flex-1">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto text-2xl">3</div>
              <p className="font-semibold">Smart Contract</p>
              <p className="text-muted-foreground text-sm">Deployment</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="text-center space-y-2 flex-1">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto text-2xl">4</div>
              <p className="font-semibold">Donate</p>
              <p className="text-muted-foreground text-sm">Send MATIC</p>
            </div>
            <div className="text-2xl text-muted-foreground">→</div>
            <div className="text-center space-y-2 flex-1">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto text-2xl">5</div>
              <p className="font-semibold">NFT Minted</p>
              <p className="text-muted-foreground text-sm">Automatic Badge</p>
            </div>
            <div className="text-2xl text-muted-foreground">→</div>
            <div className="text-center space-y-2 flex-1">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto text-2xl">6</div>
              <p className="font-semibold">Track Progress</p>
              <p className="text-muted-foreground text-sm">Dashboard</p>
            </div>
          </div>
          <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20 text-center">
            <p className="text-sm text-muted-foreground">Backend syncs blockchain data to MongoDB for fast queries & analytics</p>
          </div>
        </div>
      ),
      gradient: "from-indigo-500/10 via-background to-background"
    },
    // Slide 9: Technical Stack
    {
      title: "Technical Stack",
      content: (
        <div className="space-y-5 text-base">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-3">
              <p className="font-bold text-primary text-lg">Frontend</p>
              <ul className="space-y-1 list-none text-muted-foreground">
                <li>• React + TypeScript</li>
                <li>• Vite</li>
                <li>• Tailwind CSS</li>
                <li>• shadcn/ui</li>
                <li>• ethers.js</li>
              </ul>
            </div>
            <div className="space-y-3">
              <p className="font-bold text-primary text-lg">Backend</p>
              <ul className="space-y-1 list-none text-muted-foreground">
                <li>• Node.js + Express</li>
                <li>• MongoDB</li>
                <li>• RESTful API</li>
                <li>• Web3 Integration</li>
              </ul>
            </div>
            <div className="space-y-3">
              <p className="font-bold text-primary text-lg">Blockchain</p>
              <ul className="space-y-1 list-none text-muted-foreground">
                <li>• Solidity 0.8.20</li>
                <li>• Polygon Amoy Testnet</li>
                <li>• Hardhat</li>
                <li>• ERC-721 NFTs</li>
                <li>• MetaMask</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="font-semibold mb-2">Smart Contracts</p>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <p>• CampaignFactory.sol - Deploy campaigns</p>
              <p>• Campaign.sol - Manage funds & donations</p>
              <p>• NFTReward.sol - Mint donor badges</p>
            </div>
          </div>
        </div>
      ),
      gradient: "from-violet-500/10 via-background to-background"
    },
    // Slide 10: Conclusion
    {
      title: "Thank You",
      content: (
        <div className="space-y-8 text-center">
          <div className="space-y-4">
            <p className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              CryptoFund
            </p>
            <p className="text-xl text-muted-foreground">
              Revolutionizing Crowdfunding with Blockchain
            </p>
          </div>
          <div className="space-y-4 text-lg">
            <p className="font-semibold">Key Takeaways</p>
            <div className="space-y-2 text-muted-foreground">
              <p>✓ Transparent & trustless crowdfunding</p>
              <p>✓ Lower fees through smart contracts</p>
              <p>✓ NFT rewards for donors</p>
              <p>✓ Built on Polygon for scalability</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-primary mt-8">
            Questions?
          </div>
        </div>
      ),
      gradient: "from-primary/20 via-background to-background"
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") nextSlide();
    if (e.key === "ArrowLeft") prevSlide();
  };

  useState(() => {
    window.addEventListener("keydown", handleKeyPress as any);
    return () => window.removeEventListener("keydown", handleKeyPress as any);
  });

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-8">
      <div className={`w-full max-w-6xl h-[600px] rounded-2xl shadow-2xl bg-gradient-to-br ${slides[currentSlide].gradient} p-12 flex flex-col justify-between border border-border/50`}>
        <div>
          <h1 className="text-5xl font-bold mb-8 text-foreground">
            {slides[currentSlide].title}
          </h1>
          {slides[currentSlide].subtitle && (
            <h2 className="text-2xl text-muted-foreground mb-8">
              {slides[currentSlide].subtitle}
            </h2>
          )}
          <div className="text-foreground">
            {slides[currentSlide].content}
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? "w-8 bg-primary"
                    : "w-2 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
          
          <Button
            variant="outline"
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="mt-6 text-center text-sm text-muted-foreground">
        Slide {currentSlide + 1} of {slides.length} • Use arrow keys or buttons to navigate
      </div>
    </div>
  );
};

export default Presentation;

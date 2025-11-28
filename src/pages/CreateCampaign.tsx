import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Rocket } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ethers } from "ethers";
import { CAMPAIGN_FACTORY_ADDRESS, CAMPAIGN_FACTORY_ABI, CHAIN_ID, CHAIN_NAME, isCorrectNetwork, getTxUrl } from "@/config/contracts";

export default function CreateCampaign() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Date>();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    goalAmount: "",
    deadline: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (!formData.title || !formData.description || !formData.category || !formData.goalAmount || !date) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        toast({
          title: "MetaMask Not Found",
          description: "Please install MetaMask to create campaigns",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Request account access
      await window.ethereum.request({ method: "eth_requestAccounts" });

      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Ensure correct network (Polygon Amoy)
      const network = await provider.getNetwork();
      if (!isCorrectNetwork(Number(network.chainId))) {
        toast({
          title: "Wrong Network",
          description: `Please switch MetaMask to ${CHAIN_NAME} (chain ID ${CHAIN_ID}).`,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Create contract instance
      const factory = new ethers.Contract(
        CAMPAIGN_FACTORY_ADDRESS,
        CAMPAIGN_FACTORY_ABI,
        signer
      );

      // Convert deadline to Unix timestamp (in seconds)
      const deadlineTimestamp = Math.floor(date.getTime() / 1000);
      const nowInSeconds = Math.floor(Date.now() / 1000);
      const durationSeconds = deadlineTimestamp - nowInSeconds;

      if (durationSeconds <= 0) {
        toast({
          title: "Invalid Deadline",
          description: "Please choose a future date for your campaign deadline",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Convert goal amount to Wei
      const goalAmountWei = ethers.parseEther(formData.goalAmount);

      toast({
        title: "Creating Campaign...",
        description: "Please confirm the transaction in MetaMask",
      });

      // Call createCampaign function
      const tx = await factory.createCampaign(
        formData.title,
        formData.description,
        goalAmountWei,
        durationSeconds
      );

      toast({
        title: "Transaction Submitted",
        description: "Waiting for confirmation...",
      });

      // Wait for transaction to be mined
      const receipt = await tx.wait();

      toast({
        title: "Campaign Created!",
        description: "Your campaign has been deployed on Polygon Amoy",
        action: (
          <a
            href={getTxUrl(receipt.hash)}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            View Transaction
          </a>
        ),
      });

      setIsSubmitting(false);
      navigate("/");
    } catch (error: any) {
      console.error("Error creating campaign:", error);
      
      let errorMessage = "Failed to create campaign";
      if (error.code === "ACTION_REJECTED") {
        errorMessage = "Transaction was rejected";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Create Campaign
            </h1>
            <p className="text-muted-foreground">
              Launch your crowdfunding campaign on the blockchain
            </p>
          </div>

          <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Campaign Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Build a School in Rural India"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Tell people about your campaign..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={6}
                  className="bg-background resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="market">Market</SelectItem>
                      <SelectItem value="tech">Technology</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal">Funding Goal (MATIC) *</Label>
                  <Input
                    id="goal"
                    type="number"
                    placeholder="100"
                    value={formData.goalAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, goalAmount: e.target.value })
                    }
                    className="bg-background"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Campaign Deadline *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-background",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <h3 className="font-semibold text-foreground">
                  Campaign Rules
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>
                    ✓ If funding goal is met before deadline, you can withdraw
                    funds
                  </li>
                  <li>
                    ✓ If goal is not met by deadline, all backers receive
                    automatic refunds
                  </li>
                  <li>
                    ✓ Backers earn NFT badges based on donation amount (10+,
                    20+, 30+ MATIC)
                  </li>
                </ul>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity text-lg py-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Deploying Campaign..."
                ) : (
                  <>
                    <Rocket className="mr-2 h-5 w-5" />
                    Launch Campaign
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

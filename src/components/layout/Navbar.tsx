import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { WalletConnect } from "@/components/web3/WalletConnect";
import { Coins, Plus, User, Home } from "lucide-react";

export const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:shadow-glow transition-shadow">
              <Coins className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CryptoFund
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              Explore
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate("/create")}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Campaign
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="gap-2"
            >
              <User className="h-4 w-4" />
              Dashboard
            </Button>
          </div>

          <WalletConnect />
        </div>
      </div>
    </nav>
  );
};

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Wallet } from "lucide-react";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const POLYGON_AMOY_PARAMS = {
  chainId: "0x13882", // 80002 in hex
  chainName: "Polygon Amoy Testnet",
  nativeCurrency: {
    name: "MATIC",
    symbol: "MATIC",
    decimals: 18,
  },
  rpcUrls: ["https://rpc-amoy.polygon.technology/"],
  blockExplorerUrls: ["https://amoy.polygonscan.com/"],
};

export const WalletConnect = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    }
  };

  const switchToAmoy = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: POLYGON_AMOY_PARAMS.chainId }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [POLYGON_AMOY_PARAMS],
          });
        } catch (addError) {
          throw new Error("Failed to add Polygon Amoy network");
        }
      } else {
        throw switchError;
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask to use this DApp",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      
      await switchToAmoy();
      
      setAccount(accounts[0]);
      toast({
        title: "Wallet Connected",
        description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
      });
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  return (
    <div>
      {account ? (
        <Button
          variant="secondary"
          onClick={disconnectWallet}
          className="gap-2"
        >
          <Wallet className="h-4 w-4" />
          {account.slice(0, 6)}...{account.slice(-4)}
        </Button>
      ) : (
        <Button
          onClick={connectWallet}
          disabled={isConnecting}
          className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
        >
          <Wallet className="h-4 w-4" />
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      )}
    </div>
  );
};

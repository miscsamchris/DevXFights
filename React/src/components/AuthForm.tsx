"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FaUser } from "react-icons/fa";
import { motion } from "framer-motion";
import { WalletSelector } from "./WalletSelector";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export const AuthForm = () => {
  const [username, setUsername] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { account, connected } = useWallet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!connected || !account) {
      setErrorMessage("Please connect your wallet first");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post("/api/auth", {
        username,
        walletAddress: account.address
      });

      localStorage.setItem("user", JSON.stringify({
        username: response.data.user.username,
        walletAddress: response.data.user.walletAddress
      }));
      
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Error during authentication:", error);
      setErrorMessage(error.response?.data?.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#1E293B] p-8 rounded-xl shadow-2xl max-w-md w-full mx-auto">
      
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <FaUser className="absolute top-3 left-3 text-[#E2E8F0]" />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 pl-10 rounded-lg bg-[#0F172A] text-[#E2E8F0] border border-[#6D28D9] focus:border-[#4C1D95] focus:ring-2 focus:ring-[#4C1D95] transition-all duration-300"
            placeholder="Username"
            required
          />
        </div>

        <WalletSelector />

        {errorMessage && (
          <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
        )}

        <motion.button
          type="submit"
          className="w-full bg-[#6D28D9] hover:bg-[#4C1D95] text-[#E2E8F0] py-2 px-4 rounded-lg transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Start Your Journey"}
        </motion.button>
      </form>
    </div>
  );
};

"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logoImg from "../../assets/images/Telegage_logo.png";
import { motion } from "framer-motion";
import { GitHubProfile } from "../../components/GitHubProfile";
import { Switch } from "@/components/ui/switch";
import { BattleView } from "../../components/BattleView";
import { Balance } from "../../components/Balance";

export default function DashboardPage() {
  const [username, setUsername] = useState("");
  const router = useRouter();
  const [view, setView] = useState<"profile" | "battle">("profile");

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/auth");
    } else {
      const { username } = JSON.parse(user);
      setUsername(username);
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-black selection:bg-white selection:text-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,0.7),rgba(0,0,0,1))]" />
      
      <div className="relative container mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Image src={logoImg} alt="Logo" className="h-12 w-auto" />
              <div className="flex flex-col">
                <span className="text-gray-400 text-sm">Connected as</span>
                <span className="text-white font-medium">{username}</span>
              </div>
            </div>
            <Balance />
          </div>

          {/* Toggle Switch */}
          <div className="flex justify-center items-center gap-4 mb-8">
            <motion.span 
              className={`text-white transition-opacity duration-200 ${view === "profile" ? "opacity-100" : "opacity-50"}`}
              whileHover={{ opacity: 1 }}
            >
              My Profile
            </motion.span>
            <Switch
              checked={view === "battle"}
              onCheckedChange={(checked) => setView(checked ? "battle" : "profile")}
              className="bg-gray-700 data-[state=checked]:bg-white"
            />
            <motion.span 
              className={`text-white transition-opacity duration-200 ${view === "battle" ? "opacity-100" : "opacity-50"}`}
              whileHover={{ opacity: 1 }}
            >
              Battle
            </motion.span>
          </div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6"
          >
            {view === "profile" ? (
              <GitHubProfile username={username} />
            ) : (
              <BattleView />
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black selection:bg-white selection:text-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,0.7),rgba(0,0,0,1))]" />
      
      <div className="relative container mx-auto px-4 sm:px-6 py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          <motion.h1 
            className="text-7xl md:text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 mb-8"
            initial={{ letterSpacing: '0.2em' }}
            animate={{ letterSpacing: '0.1em' }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            DevX Battle
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-gray-400 mb-16 max-w-2xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Transform your GitHub achievements into battle power and compete globally
          </motion.p>

          <motion.div 
            className="flex justify-center space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <Link href="/auth">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative px-12 py-4 overflow-hidden rounded-full bg-white text-black font-medium transition-all hover:shadow-2xl hover:shadow-white/20"
              >
                <span className="relative z-10">Begin Battle</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white via-gray-100 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            </Link>
          </motion.div>

          <motion.div 
            className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            {[
              {
                title: "Battle Cards",
                description: "GitHub metrics become your strength",
                icon: "⚔️"
              },
              {
                title: "Live Battles",
                description: "Real-time developer challenges",
                icon: "🔥"
              },
              {
                title: "Rankings",
                description: "Climb the global leaderboard",
                icon: "👑"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -4, scale: 1.02 }}
                className="p-8 rounded-3xl bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-800/50 transition-all hover:border-gray-700/50 hover:shadow-xl hover:shadow-white/5"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-medium text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 text-sm font-light">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

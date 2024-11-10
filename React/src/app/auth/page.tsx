"use client";
import { AuthForm } from "@/components/AuthForm";
import { motion } from "framer-motion";


export default function AuthPage() {
  return (
    <div className="min-h-screen bg-black selection:bg-white selection:text-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,0.7),rgba(0,0,0,1))]" />
      
      <div className="relative container mx-auto px-4 sm:px-6 py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-md mx-auto"
        >
          <motion.h1 
            className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 mb-8 text-center"
            initial={{ letterSpacing: '0.1em' }}
            animate={{ letterSpacing: '0.05em' }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            Welcome Back
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8"
          >
            <AuthForm />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
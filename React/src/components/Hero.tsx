"use client"

import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"



export const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const translateY = useTransform(scrollYProgress, [0, 1], [-40, 40])

  return (
    <div
      className="bg-black text-white bg-[linear-gradient(to_bottom,#000,#200D42_34%,#4F21A1_65%,#A45EDB_82%)] py-[72px] sm:py-24 relative overflow-clip"
      ref={containerRef}
    >
      <div className="absolute h-[500px] w-[850px] sm:w-[1536px] sm:h-[768px] lg:w-[2600px] lg:h-[800px] rounded-[100%] bg-black left-1/2 -translate-x-1/2 border border-[#B48CDE] border-opacity-50 bg-[radial-gradient(closest-side,#000_90%,#9560EB)] top-[calc(100%-96px)] sm:top-[calc(100%-120px)]"></div>
      <div className="container relative">
        
        <div className="flex justify-center mt-8">
          <div className="inline-flex relative">
          <h1 className="text-6xl sm:text-8xl font-bold tracking-tighter text-center">
              <span className="bg-[linear-gradient(to_right,#F87AFF,#FB93D0,#FFDD99,#C3F0B2)] text-transparent bg-clip-text [-webkit-background-clip:text]">TeleGage</span>
            </h1>
            <motion.div
              className="absolute right-[576px] top-[120px]"
              style={{ translateY }}
            >
              
            </motion.div>
            <motion.div
              className="absolute left-[600px] top-[62px]"
              style={{ translateY }}
            >
              
            </motion.div>
          </div>
        </div>
        <div className="flex justify-center">
          <p className="text-center text-xl mt-8 max-w-md">
            Empower your Telegram community with automated moderation, engagement
            boosting, and Web3 rewards.
          </p>
        </div>
        <Link href="/auth">
          <div className="flex justify-center mt-8 ">
            <button className="bg-white text-black py-3 px-5 rounded-xl font-medium shadow-xl">
              Start your journey
            </button>
          </div>
        </Link>
      </div>
    </div>
  )
}
"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeInUp, scaleIn, fadeInRight, transitions } from "@/lib/animations";
import { SITE_CONFIG } from "@/constants";

interface HeroProps {
  className?: string;
}

export function Hero({ className }: HeroProps) {
  return (
    <section className={cn("pt-32 px-4 md:px-8 max-w-7xl mx-auto", className)}>
      {/* Hero Text */}
      <div className="flex flex-col items-center text-center mb-12">
        <motion.p
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ ...transitions.default, delay: 0.3 }}
          className="text-xs md:text-sm font-bold uppercase tracking-[0.2em] mb-4 text-gray-500"
        >
          {SITE_CONFIG.tagline}
        </motion.p>
        <motion.h1
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ ...transitions.slow, delay: 0.4 }}
          className={cn(
            "text-6xl md:text-8xl lg:text-9xl font-bold font-oswald",
            "uppercase leading-[0.9] tracking-tight mb-8"
          )}
        >
          {SITE_CONFIG.heroTitle[0]} <br /> {SITE_CONFIG.heroTitle[1]}
        </motion.h1>
      </div>

      {/* Hero Image */}
      <motion.div
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.8, delay: 0.5 }}
        className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-[2.5rem] overflow-hidden group"
      >
        <Image
          src={SITE_CONFIG.heroImage}
          alt="Fitness Hero"
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Content */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 p-8 md:p-12",
            "flex flex-col md:flex-row items-end justify-between text-white"
          )}
        >
          {/* Description */}
          <div className="max-w-md mb-8 md:mb-0 hidden md:block">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              transition={{ delay: 1 }}
              className="text-sm opacity-90 leading-relaxed"
            >
              {SITE_CONFIG.heroDescription}
            </motion.p>
          </div>

          {/* Secondary Title */}
          <div className="flex flex-col items-center md:items-end w-full md:w-auto">
            <motion.h2
              variants={fadeInRight}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.8, duration: 0.6 }}
              className={cn(
                "text-5xl md:text-7xl font-bold font-oswald uppercase",
                "leading-none mb-4 text-center md:text-right"
              )}
            >
              Inside <br /> And Out.
            </motion.h2>
          </div>

          {/* Play Button */}
          <PlayButton />
        </div>
      </motion.div>
    </section>
  );
}

function PlayButton() {
  return (
    <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "w-16 h-16 bg-white rounded-full",
          "flex items-center justify-center text-black cursor-pointer"
        )}
      >
        <Play className="w-6 h-6 fill-current ml-1" />
      </motion.button>
      <span className="absolute right-20 top-1/2 -translate-y-1/2 text-sm font-medium mr-2 hidden md:block">
        {SITE_CONFIG.videoDuration}
      </span>
    </div>
  );
}


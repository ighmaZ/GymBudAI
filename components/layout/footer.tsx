"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { fadeInDown } from "@/lib/animations";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-6 mt-auto bg-black text-white border-t border-white/10">
      <motion.div
        variants={fadeInDown}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-20px" }}
        className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4"
      >
        <p className="text-xs text-zinc-600 font-sans tracking-widest uppercase order-2 md:order-1">
          &copy; {currentYear} GymBud AI.
        </p>

        <div className="flex items-center gap-2 text-sm font-light tracking-wide font-oswald uppercase order-1 md:order-2">
          <span className="text-zinc-400">Made with</span>
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          <span className="text-zinc-400">by</span>
          <Link
            href="https://x.com/ighmaz_js"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative font-medium text-white transition-colors"
          >
            ighmaz
            <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full" />
          </Link>
        </div>
      </motion.div>
    </footer>
  );
}

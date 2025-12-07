"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { fadeInLeft, fadeInDown, fadeInRight, transitions } from "@/lib/animations";
import { NAV_LINKS, SITE_CONFIG } from "@/constants";

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "flex items-center justify-between",
        "px-6 py-6 md:px-12 max-w-7xl mx-auto w-full",
        "bg-white/80 backdrop-blur-md",
        className
      )}
    >
      {/* Logo */}
      <motion.div
        variants={fadeInLeft}
        initial="hidden"
        animate="visible"
        transition={transitions.default}
        className="text-2xl font-bold font-oswald tracking-tighter uppercase"
      >
        {SITE_CONFIG.name}
      </motion.div>

      {/* Nav Links */}
      <motion.div
        variants={fadeInDown}
        initial="hidden"
        animate="visible"
        transition={{ ...transitions.default, delay: 0.2 }}
        className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-wide"
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="hover:text-gray-600 transition-colors"
          >
            {link.label}
          </a>
        ))}
      </motion.div>

      {/* CTA Button */}
      <motion.div
        variants={fadeInRight}
        initial="hidden"
        animate="visible"
        transition={transitions.default}
        className="hidden md:block"
      >
        <Button variant="outline" size="md">
          Join Today
        </Button>
      </motion.div>
    </nav>
  );
}


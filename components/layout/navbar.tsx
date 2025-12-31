"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/auth-modal";
import { fadeInLeft, fadeInDown, fadeInRight, transitions } from "@/lib/animations";
import { NAV_LINKS, SITE_CONFIG } from "@/constants";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { UserMenu } from "@/components/auth/user-menu";


interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { data: session, isPending } = useSession();
  const router = useRouter();

  return (
    <>
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
            <button
              key={link.href}
              onClick={(e) => {
                e.preventDefault();
                if (session?.user) {
                  router.push(link.href);
                } else {
                  setIsAuthModalOpen(true);
                }
              }}
              className="group relative hover:text-gray-600 transition-colors cursor-pointer"
            >
              {link.label}
              <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-gray-600 transition-all duration-300 group-hover:w-full" />
            </button>
          ))}
        </motion.div>

        {/* CTA Button / User Menu */}
        <motion.div
          variants={fadeInRight}
          initial="hidden"
          animate="visible"
          transition={transitions.default}
          className="hidden md:flex items-center gap-4"
        >
          {isPending ? (
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
          ) : session?.user ? (
            <UserMenu session={session} />
          ) : (
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsAuthModalOpen(true)}
            >
              Join Today
            </Button>
          )}
        </motion.div>
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}

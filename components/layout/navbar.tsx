"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/auth-modal";
import { fadeInLeft, fadeInDown, fadeInRight, transitions } from "@/lib/animations";
import { NAV_LINKS, SITE_CONFIG } from "@/constants";
import { useSession, signOut } from "@/lib/auth-client";
import { LogOut, User } from "lucide-react";

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { data: session, isPending } = useSession();

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
            <a
              key={link.href}
              href={link.href}
              className="hover:text-gray-600 transition-colors"
            >
              {link.label}
            </a>
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
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold uppercase">
                  {session.user.name?.charAt(0) || session.user.email?.charAt(0) || <User className="w-5 h-5" />}
                </div>
                <span className="text-sm font-medium hidden lg:block">
                  {session.user.name || session.user.email}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">Sign Out</span>
              </Button>
            </div>
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

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/auth-modal";
import { fadeInLeft, fadeInDown, fadeInRight, transitions } from "@/lib/animations";
import { NAV_LINKS, SITE_CONFIG } from "@/constants";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { UserMenu } from "@/components/auth/user-menu";
import { Menu, X, LogOut, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";


interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      // Change navbar styling when scrolled past hero section (approximately)
      // Change navbar styling when entering Features section (ScrollyTelling is 400vh)
      // Trigger almost at the end of the scrolly-telling (3.9 screens down)
      setIsScrolled(window.scrollY > window.innerHeight * 3.9);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error("Sign out failed", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50",
          "flex items-center justify-between",
          "px-6 py-4 md:py-6 md:px-12 max-w-7xl mx-auto w-full",
          "bg-transparent",
          className
        )}
      >
        {/* Logo */}
        <motion.div
           variants={fadeInLeft}
           initial="hidden"
           animate="visible"
           transition={transitions.default}
           className={cn(
             "text-2xl font-bold font-oswald tracking-tighter uppercase relative z-50 transition-colors duration-300",
             isScrolled ? "text-black" : "text-white"
           )}
         >
           {SITE_CONFIG.name}
        </motion.div>

        {/* Desktop Nav Links */}
        <motion.div
          variants={fadeInDown}
          initial="hidden"
          animate="visible"
          transition={{ ...transitions.default, delay: 0.2 }}
          className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-wide"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => {
                if (!session?.user) {
                  e.preventDefault();
                  setIsAuthModalOpen(true);
                }
              }}
              className={cn(
                "group relative transition-colors duration-300 cursor-pointer",
                isScrolled ? "text-black hover:text-gray-700" : "text-white hover:text-gray-300"
              )}
            >
              {link.label}
              <span className={cn(
                "absolute left-0 -bottom-1 h-[2px] w-0 transition-all duration-300 group-hover:w-full",
                isScrolled ? "bg-black" : "bg-white"
              )} />
            </Link>
          ))}
        </motion.div>

        {/* Desktop CTA Button / User Menu */}
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
              className={cn(
                "border-2 transition-colors duration-300",
                isScrolled
                  ? "bg-black text-white hover:bg-gray-800 border-white"
                  : "bg-white text-black hover:bg-gray-200 border-white"
              )}
              size="md"
              onClick={() => setIsAuthModalOpen(true)}
            >
              Login
            </Button>
          )}
        </motion.div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden z-50">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={cn(
              "p-2 transition-colors duration-300",
              isScrolled ? "text-black" : "text-white"
            )}
          >
            {isMobileMenuOpen ? <X size={40} /> : <Menu size={40} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute top-0 left-0 w-full h-screen bg-black/95 backdrop-blur-lg p-6 flex flex-col gap-6 pt-24 md:hidden z-40"
            >
              <div className="flex flex-col gap-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={(e) => {
                      if (!session?.user) {
                        e.preventDefault();
                        setIsMobileMenuOpen(false);
                        setIsAuthModalOpen(true);
                      } else {
                        setIsMobileMenuOpen(false);
                      }
                    }}
                    className="text-2xl font-oswald text-white text-left py-4 border-b border-white/10 hover:text-gray-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              
              <div className="mt-auto mb-8">
                {isPending ? (
                  <div className="w-full h-12 bg-gray-800 rounded-lg animate-pulse" />
                ) : session?.user ? (
                  <div className="flex flex-col gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                     <div className="flex items-center gap-3">
                        {session.user.image ? (
                          <Image 
                            src={session.user.image} 
                            alt="User" 
                            width={48} 
                            height={48} 
                            className="rounded-full border-2 border-white/20"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-tr from-gray-800 to-gray-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {session.user.name?.charAt(0) || "U"}
                          </div>
                        )}
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-white font-medium truncate">{session.user.name}</span>
                          <span className="text-gray-400 text-sm truncate">{session.user.email}</span>
                        </div>
                     </div>
                     
                     <Button 
                       variant="destructive" 
                       className="w-full gap-2 h-12 text-md"
                       onClick={handleSignOut}
                       disabled={isSigningOut}
                     >
                       {isSigningOut ? <Loader2 className="animate-spin" size={20} /> : <LogOut size={20} />}
                       Sign Out
                     </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full bg-white text-black hover:bg-gray-200 border-none h-12 text-lg font-bold"
                    size="lg"
                    onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsAuthModalOpen(true);
                    }}
                  >
                    Login
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}

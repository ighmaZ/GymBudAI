"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User, ChevronDown, Loader2 } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface UserMenuProps {
  session: {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  };
}

export function UserMenu({ session }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const userInitial = session.user.name?.charAt(0) || session.user.email?.charAt(0) || "?";

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 focus:outline-none"
      >
        {session.user.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name || "User"}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full shadow-md ring-2 ring-transparent hover:ring-gray-200 transition-all object-cover"
          />
        ) : (
          <div className="w-10 h-10 bg-gradient-to-tr from-gray-900 to-gray-700 text-white rounded-full flex items-center justify-center font-bold uppercase shadow-md ring-2 ring-transparent hover:ring-gray-200 transition-all">
            {userInitial}
          </div>
        )}
      </motion.button>

<AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 10, scale: 0.95, filter: "blur(4px)" }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-64 bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 ring-1 ring-black/5 overflow-hidden z-50 origin-top-right"
          >
            <div className="p-4 border-b border-black/5 bg-gradient-to-b from-white/50 to-transparent">
              <div className="flex items-center gap-3">
                {session.user.image ? (
                   <div className="relative">
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full shadow-sm object-cover ring-2 ring-white"
                    />
                   </div>
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-sm ring-2 ring-white">
                    {userInitial}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate leading-tight">
                    {session.user.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate font-medium mt-0.5">
                    {session.user.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-2 space-y-1 bg-white/40">
              <button
                disabled={isSigningOut}
                onClick={async () => {
                  setIsSigningOut(true);
                  try {
                    await signOut();
                  } catch (error) {
                    console.error("Sign out failed", error);
                    setIsSigningOut(false);
                  }
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50/80 rounded-2xl transition-all duration-200 text-left group disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-sm"
              >
                <div className="p-2 bg-red-100/50 rounded-xl group-hover:bg-red-100 transition-colors">
                  {isSigningOut ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                </div>
                <div className="flex flex-col items-start">
                    <span className="font-semibold text-gray-900 group-hover:text-red-700 transition-colors">
                    {isSigningOut ? "Signing Out..." : "Sign Out"}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">Log out of your account</span>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

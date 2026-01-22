"use client";

import { useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { FEATURES } from "@/constants";
import { useSession } from "@/lib/auth-client";
import { AuthModal } from "@/components/auth/auth-modal";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

interface FeaturesProps {
  className?: string;
}

export function Features({ className }: FeaturesProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { data: session, isPending } = useSession();
  const isLoggedIn = !!session?.user;
  const router = useRouter();

  const handleFeatureClick = (href?: string) => {
    if (isPending) return;
    
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }

    if (href) {
      router.push(href);
    }
  };

  return (
    <>
      <section
        className={cn(
          "w-full bg-white text-black py-32 rounded-t-[3rem] -mt-10 relative z-10",
          className
        )}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col gap-40">
            {FEATURES.map((feature, index) => (
            <FeatureSection
                key={feature.title}
                feature={feature}
                index={index}
                onClick={() => handleFeatureClick(feature.href)}
            />
            ))}
        </div>
      </section>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}

interface FeatureSectionProps {
  feature: (typeof FEATURES)[number];
  index: number;
  onClick: () => void;
}

function FeatureSection({ feature, index, onClick }: FeatureSectionProps) {
  const isEven = index % 2 === 0;
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2], [100, 0]);

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y }}
      className={cn(
        "flex flex-col md:flex-row items-center gap-12 md:gap-24",
        !isEven && "md:flex-row-reverse"
      )}
    >
      {/* Text Content */}
      <div className="flex-1 space-y-8 text-center md:text-left">
        <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-black text-white mb-2 shadow-xl"
        >
            <feature.icon className="w-8 h-8" />
        </motion.div>
        
        <h2 className="text-4xl md:text-6xl font-black font-oswald uppercase tracking-tight leading-none">
          {feature.title}
        </h2>
        
        <p className="text-xl text-gray-600 max-w-lg mx-auto md:mx-0 leading-relaxed font-medium">
          {feature.description}
        </p>
        
        <button
            onClick={onClick}
            className="group inline-flex items-center gap-2 text-lg font-bold border-b-2 border-black pb-1 hover:text-gray-600 hover:border-gray-600 transition-colors"
        >
            Get Started
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Visual / Image Display */}
      <div className="flex-1 w-full relative group perspective-1000">
        <div 
            onClick={onClick}
            className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl cursor-pointer transform transition-transform duration-700 hover:scale-[1.02] hover:-rotate-1"
        >
            <div className="absolute inset-0 bg-gray-200 animate-pulse" /> {/* Placeholder while loading */}
            <Image
                src={feature.image}
                alt={feature.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
            />
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -z-10 -bottom-6 -right-6 w-full h-full bg-gray-100 rounded-3xl" />
      </div>
    </motion.div>
  );
}

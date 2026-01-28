"use client";

import { useState, useRef } from "react";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { FEATURES } from "@/constants";
import { useSession } from "@/lib/auth-client";
import { AuthModal } from "@/components/auth/auth-modal";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface FeaturesProps {
  className?: string;
}

export function Features({ className }: FeaturesProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { data: session, isPending } = useSession();
  const isLoggedIn = !!session?.user;

  const handleAuthClick = (e: React.MouseEvent) => {
    if (isPending) {
      e.preventDefault();
      return;
    }
    
    if (!isLoggedIn) {
      e.preventDefault();
      setIsAuthModalOpen(true);
    }
  };

  return (
    <>
      <section
        id="features"
        className={cn(
          "w-full bg-white text-black py-32 rounded-t-[3rem] -mt-10 relative z-10",
          className
        )}
      >
        <div className="max-w-7xl mx-auto px-8 md:px-12 flex flex-col gap-40">
            {FEATURES.map((feature, index) => (
            <FeatureSection
                key={feature.title}
                feature={feature}
                index={index}
                onAuthClick={handleAuthClick}
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
  onAuthClick: (e: React.MouseEvent) => void;
}

function FeatureSection({ feature, index, onAuthClick }: FeatureSectionProps) {
  const isEven = index % 2 === 0;
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -20]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  const imageVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9, rotate: isEven ? -2 : 2 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  const decorVariants: Variants = {
    hidden: { opacity: 0, x: isEven ? -20 : 20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 1, delay: 0.4, ease: "easeOut" }
    }
  };

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-20%" }}
      className={cn(
        "flex flex-col md:flex-row items-center gap-12 md:gap-24",
        !isEven && "md:flex-row-reverse"
      )}
    >
      {/* Text Content */}
      <motion.div style={{ y: textY }} className="flex-1 space-y-8 text-center md:text-left">
        <motion.h2 variants={itemVariants} className="text-4xl md:text-6xl font-black font-oswald uppercase tracking-tight leading-none">
          {feature.title}
        </motion.h2>
        
        <motion.p variants={itemVariants} className="text-xl text-gray-600 max-w-lg mx-auto md:mx-0 leading-relaxed font-medium">
          {feature.description}
        </motion.p>
        
        <motion.div variants={itemVariants}>
            <Link
                href={feature.href || "/"}
                onClick={onAuthClick}
                className="group inline-flex items-center gap-2 text-lg font-bold border-b-2 border-black pb-1 hover:text-gray-600 hover:border-gray-600 transition-colors"
            >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
        </motion.div>
      </motion.div>

      {/* Visual / Image Display */}
      <motion.div variants={imageVariants} style={{ y }} className="flex-1 w-full relative group perspective-1000">
        <Link 
            href={feature.href || "/"}
            onClick={onAuthClick}
            className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl cursor-pointer transform transition-transform duration-700 hover:scale-[1.02] hover:-rotate-1 block"
        >
            <div className="absolute inset-0 bg-gray-200 animate-pulse" /> {/* Placeholder while loading */}
            
            {/* Video for desktop, Image for mobile - only when video exists */}
            {feature.video ? (
              <>
                {/* Mobile: Image */}
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-cover md:hidden"
                  sizes="100vw"
                />
                {/* Desktop: Looping Video */}
                <video
                  src={feature.video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="none"
                  className="hidden md:block object-cover w-full h-full absolute inset-0"
                />
              </>
            ) : (
              <Image
                src={feature.image}
                alt={feature.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            )}
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </Link>
        
        {/* Decorative elements */}
        <motion.div variants={decorVariants} className="absolute -z-10 -bottom-3 -right-3 md:-bottom-6 md:-right-6 w-full h-full bg-gray-100 rounded-3xl" />
      </motion.div>
    </motion.div>
  );
}

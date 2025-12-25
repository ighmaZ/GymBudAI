"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { FeatureCard } from "@/components/ui/feature-card";
import { FEATURES } from "@/constants";
import { useSession } from "@/lib/auth-client";
import { AuthModal } from "@/components/auth/auth-modal";
import { fadeInUp } from "@/lib/animations";

interface FeaturesProps {
  className?: string;
}

export function Features({ className }: FeaturesProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { data: session, isPending } = useSession();
  const isLoggedIn = !!session?.user;

  return (
    <>
      <section
        className={cn(
          "mt-24 grid grid-cols-1 md:grid-cols-3 gap-8",
          "px-4 md:px-8 max-w-7xl mx-auto",
          className
        )}
      >
        {FEATURES.map((feature, index) => (
          <ProtectedFeatureCard
            key={feature.title}
            feature={feature}
            index={index}
            isLoggedIn={isLoggedIn}
            isPending={isPending}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        ))}
      </section>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}

interface ProtectedFeatureCardProps {
  feature: (typeof FEATURES)[number];
  index: number;
  isLoggedIn: boolean;
  isPending: boolean;
  onOpenAuthModal: () => void;
}

function ProtectedFeatureCard({
  feature,
  index,
  isLoggedIn,
  isPending,
  onOpenAuthModal,
}: ProtectedFeatureCardProps) {
  if (!isPending && !isLoggedIn) {
    return (
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ delay: 0.2 * index, duration: 0.5 }}
        onClick={onOpenAuthModal}
        className={cn(
          "p-8 rounded-3xl bg-gray-50 hover:bg-gray-100 transition-colors",
          "group cursor-pointer border border-transparent hover:border-gray-200"
        )}
      >
        <div
          className={cn(
            "w-12 h-12 bg-black text-white rounded-full",
            "flex items-center justify-center mb-6",
            "group-hover:scale-110 transition-transform"
          )}
        >
          <feature.icon className="w-6 h-6" />
        </div>

        <h3 className="text-2xl font-bold font-oswald uppercase mb-3">
          {feature.title}
        </h3>

        <p className="text-gray-600 leading-relaxed">{feature.description}</p>
      </motion.div>
    );
  }

  return (
    <FeatureCard
      icon={feature.icon}
      title={feature.title}
      description={feature.description}
      index={index}
      href={isLoggedIn ? feature.href : undefined}
    />
  );
}

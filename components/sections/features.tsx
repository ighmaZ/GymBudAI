"use client";

import { cn } from "@/lib/utils";
import { FeatureCard } from "@/components/ui/feature-card";
import { FEATURES } from "@/constants";

interface FeaturesProps {
  className?: string;
}

export function Features({ className }: FeaturesProps) {
  return (
    <section
      className={cn(
        "mt-24 grid grid-cols-1 md:grid-cols-3 gap-8",
        "px-4 md:px-8 max-w-7xl mx-auto",
        className
      )}
    >
      {FEATURES.map((feature, index) => (
        <FeatureCard
          key={feature.title}
          icon={feature.icon}
          title={feature.title}
          description={feature.description}
          index={index}
        />
      ))}
    </section>
  );
}


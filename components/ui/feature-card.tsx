"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeInUp } from "@/lib/animations";
import type { Feature } from "@/types";
import Link from "next/link";

interface FeatureCardProps extends Feature {
  index: number;
  className?: string;
  href?: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  index,
  className,
  href,
}: FeatureCardProps) {
  const CardContent = (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ delay: 0.2 * index, duration: 0.5 }}
      className={cn(
        "p-8 rounded-3xl bg-gray-50 hover:bg-gray-100 transition-colors",
        "group cursor-pointer border border-transparent hover:border-gray-200",
        className
      )}
    >
      <div
        className={cn(
          "w-12 h-12 bg-black text-white rounded-full",
          "flex items-center justify-center mb-6",
          "group-hover:scale-110 transition-transform"
        )}
      >
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-2xl font-bold font-oswald uppercase mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </motion.div>
  );

  if (href) {
    return <Link href={href}>{CardContent}</Link>;
  }

  return CardContent;
}

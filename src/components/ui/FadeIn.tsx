"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

const OFFSET = {
  up: { y: 24, x: 0 },
  left: { y: 0, x: -24 },
  right: { y: 0, x: 24 },
  none: { y: 0, x: 0 },
};

interface FadeInProps {
  children: ReactNode;
  className?: string;
  direction?: keyof typeof OFFSET;
  delay?: number;
  /** "mount" animates immediately (above-the-fold content like the Hero);
   * "inView" waits until scrolled into view (everything below the fold). */
  mode?: "mount" | "inView";
}

/**
 * Shared entrance-motion wrapper. Reduced-motion users get it stripped
 * to an opacity-only fade via the root MotionConfig (reducedMotion="user"),
 * not disabled outright, so the layout still commits gently.
 */
export function FadeIn({ children, className, direction = "up", delay = 0, mode = "inView" }: FadeInProps) {
  const offset = OFFSET[direction];
  const viewportProps = mode === "inView" ? { whileInView: "visible", viewport: { once: true, margin: "-80px" } } : { animate: "visible" };

  return (
    <motion.div
      className={className}
      initial="hidden"
      {...viewportProps}
      variants={{
        hidden: { opacity: 0, x: offset.x, y: offset.y },
        visible: { opacity: 1, x: 0, y: 0, transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] } },
      }}
    >
      {children}
    </motion.div>
  );
}

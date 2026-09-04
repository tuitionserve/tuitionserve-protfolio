"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/** Strips translate/scale motion for prefers-reduced-motion users site-wide, keeping opacity fades. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

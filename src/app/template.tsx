"use client"

import React from "react"
import { motion } from "motion/react"

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, clipPath: "inset(2% 0 0 0)" }}
      animate={{ opacity: 1, y: 0, clipPath: "inset(0 0 0 0)" }}
      transition={{ duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
      className="relative min-h-screen"
    >
      <motion.div
        initial={{ scaleX: 0, opacity: 1 }}
        animate={{ scaleX: 1, opacity: 0 }}
        transition={{ duration: 0.82, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
        className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-px origin-left bg-lime-300"
      />
      {children}
    </motion.div>
  )
}

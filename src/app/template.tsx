"use client"

import React from "react"
import { motion, useReducedMotion } from "motion/react"

export default function Template({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 12, clipPath: "inset(3% 0 0 0)" }}
      animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, clipPath: "inset(0 0 0 0)" }}
      transition={{ duration: reducedMotion ? 0 : 0.62, ease: [0.16, 1, 0.3, 1] }}
      className="relative min-h-screen"
    >
      {!reducedMotion && (
        <>
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }} className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-px origin-left bg-lime-300" />
          <motion.div initial={{ scaleX: 1, opacity: 1 }} animate={{ scaleX: 0, opacity: 0 }} transition={{ duration: 0.56, delay: 0.2, ease: [0.77, 0, 0.175, 1] }} className="pointer-events-none fixed inset-x-0 top-0 z-[99] h-[3px] origin-right bg-lime-300/15" />
        </>
      )}
      {children}
    </motion.div>
  )
}

import type { Transition, Variants } from "motion/react"

export const editorialEase: Transition = {
  duration: 0.7,
  ease: [0.16, 1, 0.3, 1],
}

export const quickEase: Transition = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1],
}

export const softSpring: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 26,
  mass: 0.8,
}

export const editorialReveal: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: editorialEase },
}

export const softScale: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: editorialEase },
}

export const lineReveal: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: { scaleX: 1, opacity: 1, transition: { ...editorialEase, duration: 0.9 } },
}

export const editorialStagger: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.12 },
  },
}

export const editorialStaggerItem: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: editorialEase },
}

export const fadeUp = editorialReveal
export const scaleIn = softScale
export const stagger = editorialStagger
export const staggerItem = editorialStaggerItem

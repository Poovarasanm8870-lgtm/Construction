/**
 * iOS-inspired spring motion variants for Framer Motion.
 * Optimized for light-theme crisp cards, smooth damping, and bouncy micro-interactions.
 */

export const springTransition = {
  type: "spring",
  stiffness: 380,
  damping: 30,
  mass: 0.8
};

export const bouncyTap = {
  scale: 0.97,
  transition: { type: "spring", stiffness: 400, damping: 25 }
};

export const iosCardHover = {
  y: -5,
  scale: 1.015,
  shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
  transition: springTransition
};

export const fadeInUpVariant = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.08,
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1]
    }
  })
};

export const modalBackdropVariant = {
  hidden: { opacity: 0, backdropFilter: "blur(0px)" },
  visible: { 
    opacity: 1, 
    backdropFilter: "blur(16px)",
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0, 
    backdropFilter: "blur(0px)",
    transition: { duration: 0.25 } 
  }
};

export const modalSlideUpVariant = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 350, damping: 28 }
  },
  exit: { 
    opacity: 0, 
    y: 40, 
    scale: 0.96,
    transition: { duration: 0.2 }
  }
};

export const drawerSlideRightVariant = {
  hidden: { opacity: 0, x: "100%" },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 320, damping: 32 }
  },
  exit: {
    opacity: 0,
    x: "100%",
    transition: { duration: 0.25 }
  }
};

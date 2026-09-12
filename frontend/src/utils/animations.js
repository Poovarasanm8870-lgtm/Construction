// Framer Motion iOS-Grade Spring Physics Animations

export const springTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

export const gentleSpring = {
  type: "spring",
  stiffness: 200,
  damping: 25,
};

export const snappySpring = {
  type: "spring",
  stiffness: 450,
  damping: 35,
};

// Container Stagger Children Variant
export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

// Item Fade & Slide Up Variant
export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: springTransition,
  },
};

// iOS Modal Pop / Slide Drawer Variant
export const drawerSlide = {
  hidden: { opacity: 0, x: "100%" },
  show: {
    opacity: 1,
    x: 0,
    transition: springTransition,
  },
  exit: {
    opacity: 0,
    x: "100%",
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

export const modalPop = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springTransition,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.15 },
  },
};

// Tap and Hover micro-interaction props
export const buttonTapScale = {
  whileHover: { scale: 1.03 },
  whileTap: { scale: 0.97 },
  transition: snappySpring,
};

export const cardHoverLift = {
  whileHover: { y: -6, scale: 1.01 },
  transition: gentleSpring,
};

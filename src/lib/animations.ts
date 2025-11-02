import type { Variants } from "framer-motion";

/**
 * Animation configuration constants
 */
export const ANIMATION_CONFIG = {
	duration: 0.4,
	staggerDelay: 0.05,
	ease: "easeOut" as const,
	yOffset: 12,
};

/**
 * Fade in animation variant
 */
export const fadeIn: Variants = {
	hidden: {
		opacity: 0,
		y: ANIMATION_CONFIG.yOffset,
	},
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: ANIMATION_CONFIG.duration,
			ease: ANIMATION_CONFIG.ease,
		},
	},
};

/**
 * Fade in without vertical movement
 */
export const fadeInOnly: Variants = {
	hidden: {
		opacity: 0,
	},
	visible: {
		opacity: 1,
		transition: {
			duration: ANIMATION_CONFIG.duration,
			ease: ANIMATION_CONFIG.ease,
		},
	},
};

/**
 * Stagger container for animating children sequentially
 */
export const staggerContainer: Variants = {
	hidden: {
		opacity: 0,
	},
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: ANIMATION_CONFIG.staggerDelay,
			delayChildren: 0.1,
		},
	},
};

/**
 * Stagger item for use within stagger containers
 */
export const staggerItem: Variants = {
	hidden: {
		opacity: 0,
		y: ANIMATION_CONFIG.yOffset,
	},
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: ANIMATION_CONFIG.duration,
			ease: ANIMATION_CONFIG.ease,
		},
	},
};

/**
 * Page transition variants
 */
export const pageTransition: Variants = {
	initial: {
		opacity: 0,
	},
	animate: {
		opacity: 1,
		transition: {
			duration: 0.3,
			ease: ANIMATION_CONFIG.ease,
		},
	},
	exit: {
		opacity: 0,
		transition: {
			duration: 0.2,
			ease: ANIMATION_CONFIG.ease,
		},
	},
};

/**
 * Scale and fade for modals/dialogs
 */
export const scaleAndFade: Variants = {
	hidden: {
		opacity: 0,
		scale: 0.95,
	},
	visible: {
		opacity: 1,
		scale: 1,
		transition: {
			duration: 0.2,
			ease: ANIMATION_CONFIG.ease,
		},
	},
	exit: {
		opacity: 0,
		scale: 0.95,
		transition: {
			duration: 0.15,
			ease: ANIMATION_CONFIG.ease,
		},
	},
};

/**
 * Button tap animation
 */
export const buttonTap = {
	scale: 0.97,
};

/**
 * Button hover animation
 */
export const buttonHover = {
	scale: 1.02,
	transition: {
		duration: 0.2,
		ease: ANIMATION_CONFIG.ease,
	},
};

/**
 * Slide in from left
 */
export const slideInLeft: Variants = {
	hidden: {
		opacity: 0,
		x: -20,
	},
	visible: {
		opacity: 1,
		x: 0,
		transition: {
			duration: ANIMATION_CONFIG.duration,
			ease: ANIMATION_CONFIG.ease,
		},
	},
};

/**
 * Slide in from right
 */
export const slideInRight: Variants = {
	hidden: {
		opacity: 0,
		x: 20,
	},
	visible: {
		opacity: 1,
		x: 0,
		transition: {
			duration: ANIMATION_CONFIG.duration,
			ease: ANIMATION_CONFIG.ease,
		},
	},
};

/**
 * Spring configuration
 */
export const spring = {
	type: "spring" as const,
	stiffness: 500,
	damping: 30,
};

export const gentleSpring = {
	type: "spring" as const,
	stiffness: 400,
	damping: 35,
};

/**
 * Cart item animation with spring
 */
export const cartItem: Variants = {
	hidden: {
		opacity: 0,
		scale: 0.9,
		height: 0,
		marginBottom: 0,
	},
	visible: {
		opacity: 1,
		scale: 1,
		height: "auto",
		marginBottom: 12,
		transition: spring,
	},
	exit: {
		opacity: 0,
		scale: 0.9,
		height: 0,
		marginBottom: 0,
		transition: gentleSpring,
	},
};

/**
 * Number count animation
 */
export const numberScale = {
	scale: [1, 1.3, 1],
	transition: {
		duration: 0.3,
		ease: "easeOut",
	},
};

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { pageTransition } from "@/lib/animations";

interface PageTransitionProps {
	children: React.ReactNode;
}

/**
 * PageTransition component - animates route changes
 * Respects prefers-reduced-motion
 */
export function PageTransition({ children }: PageTransitionProps) {
	const pathname = usePathname();
	const prefersReducedMotion = useReducedMotion();

	if (prefersReducedMotion) {
		return <>{children}</>;
	}

	return (
		<AnimatePresence mode="wait">
			<motion.div
				key={pathname}
				initial="initial"
				animate="animate"
				exit="exit"
				variants={pageTransition}
			>
				{children}
			</motion.div>
		</AnimatePresence>
	);
}

"use client";

import type { HTMLMotionProps } from "framer-motion";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { fadeIn } from "@/lib/animations";

interface FadeInProps extends HTMLMotionProps<"div"> {
	children: React.ReactNode;
	delay?: number;
	className?: string;
}

/**
 * FadeIn component - wraps content with fade-in animation
 * Respects prefers-reduced-motion
 */
export function FadeIn({
	children,
	delay = 0,
	className,
	...props
}: FadeInProps) {
	const prefersReducedMotion = useReducedMotion();

	if (prefersReducedMotion) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			initial="hidden"
			animate="visible"
			variants={fadeIn}
			transition={{ delay }}
			className={className}
			{...props}
		>
			{children}
		</motion.div>
	);
}

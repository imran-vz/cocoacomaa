"use client";

import type { HTMLMotionProps } from "framer-motion";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";

interface StaggerContainerProps extends HTMLMotionProps<"div"> {
	children: React.ReactNode;
	className?: string;
}

interface StaggerItemProps extends HTMLMotionProps<"div"> {
	children: React.ReactNode;
	className?: string;
}

/**
 * StaggerContainer component - animates children with stagger effect
 * Respects prefers-reduced-motion
 */
export function StaggerContainer({
	children,
	className,
	...props
}: StaggerContainerProps) {
	const prefersReducedMotion = useReducedMotion();

	if (prefersReducedMotion) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			initial="hidden"
			animate="visible"
			variants={staggerContainer}
			className={className}
			{...props}
		>
			{children}
		</motion.div>
	);
}

/**
 * StaggerItem component - individual item within StaggerContainer
 * Must be used as direct child of StaggerContainer
 */
export function StaggerItem({
	children,
	className,
	...props
}: StaggerItemProps) {
	const prefersReducedMotion = useReducedMotion();

	if (prefersReducedMotion) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div variants={staggerItem} className={className} {...props}>
			{children}
		</motion.div>
	);
}

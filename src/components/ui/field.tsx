"use client";

import type * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Field wrapper
interface FieldProps extends React.ComponentProps<"div"> {
	orientation?: "vertical" | "horizontal" | "responsive";
}

function Field({ className, orientation = "vertical", ...props }: FieldProps) {
	return (
		<div
			data-slot="field"
			className={cn(
				"grid gap-2",
				orientation === "horizontal" && "grid-cols-[1fr_auto] items-center",
				orientation === "responsive" &&
					"sm:grid-cols-[1fr_auto] sm:items-center",
				"data-[invalid=true]:text-destructive",
				className,
			)}
			{...props}
		/>
	);
}

// FieldGroup for grouping multiple fields
function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="field-group"
			className={cn("space-y-4", className)}
			{...props}
		/>
	);
}

// FieldSet for semantically grouped fields
function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
	return (
		<fieldset
			data-slot="field-set"
			className={cn("space-y-4", className)}
			{...props}
		/>
	);
}

// FieldLabel
interface FieldLabelProps extends React.ComponentProps<typeof Label> {
	variant?: "default" | "label";
}

function FieldLabel({
	className,
	variant = "default",
	...props
}: FieldLabelProps) {
	return (
		<Label
			data-slot="field-label"
			className={cn(
				variant === "label" && "text-sm font-medium",
				"data-[error=true]:text-destructive",
				className,
			)}
			{...props}
		/>
	);
}

// FieldDescription
function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
	return (
		<p
			data-slot="field-description"
			className={cn("text-muted-foreground text-sm", className)}
			{...props}
		/>
	);
}

// FieldError - displays validation errors
interface FieldErrorProps extends React.ComponentProps<"p"> {
	errors?: unknown[] | undefined;
}

function FieldError({ className, errors, ...props }: FieldErrorProps) {
	if (!errors || errors.length === 0) return null;

	// Handle various error formats from TanStack Form and Zod
	const firstError = errors[0];
	let errorMessage: string | undefined;

	if (typeof firstError === "string") {
		errorMessage = firstError;
	} else if (
		firstError &&
		typeof firstError === "object" &&
		"message" in firstError
	) {
		errorMessage = (firstError as { message?: string }).message;
	}

	if (!errorMessage) return null;

	return (
		<p
			data-slot="field-error"
			role="alert"
			aria-live="polite"
			className={cn("text-destructive text-sm", className)}
			{...props}
		>
			{errorMessage}
		</p>
	);
}

// FieldContent for complex field layouts
function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="field-content"
			className={cn("space-y-1", className)}
			{...props}
		/>
	);
}

// FieldLegend for fieldset legends
interface FieldLegendProps extends React.ComponentProps<"legend"> {
	variant?: "default" | "label";
}

function FieldLegend({
	className,
	variant = "default",
	...props
}: FieldLegendProps) {
	return (
		<legend
			data-slot="field-legend"
			className={cn(
				"text-sm font-medium",
				variant === "label" && "text-foreground",
				className,
			)}
			{...props}
		/>
	);
}

// FieldTitle for labeling within FieldContent
function FieldTitle({ className, ...props }: React.ComponentProps<"p">) {
	return (
		<p
			data-slot="field-title"
			className={cn("text-sm font-medium leading-none", className)}
			{...props}
		/>
	);
}

export {
	Field,
	FieldGroup,
	FieldSet,
	FieldLabel,
	FieldDescription,
	FieldError,
	FieldContent,
	FieldLegend,
	FieldTitle,
};

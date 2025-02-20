"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRef } from "react";

export function Form() {
	const formRef = useRef<HTMLFormElement>(null);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!formRef.current) return;
		// Handle form submission
		const formData = new FormData(formRef.current);
		const email = formData.get("email");
		console.log("Submitted email:", email);
	};
	return (
		<form
			ref={formRef}
			onSubmit={handleSubmit}
			className="pt-4 grid grid-cols-1 gap-4 md:grid-cols-4 grid-rows-2 md:grid-rows-1"
		>
			<Input
				type="email"
				name="email"
				id="email"
				autoComplete="current-email"
				placeholder="Email"
				className="bg-transparent border-gray-600 text-white md:col-span-3 placeholder:text-gray-400 h-12"
				required
			/>
			<Button
				type="submit"
				className="w-full bg-white text-black hover:bg-gray-100 h-12"
			>
				SIGN UP
			</Button>
		</form>
	);
}

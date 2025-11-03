import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { FadeIn } from "@/components/fade-in";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PostalComboForm from "../_components/postal-combo-form";

export default function NewPostalComboPage() {
	return (
		<FadeIn>
			<div className="container mx-auto py-4 sm:py-6 lg:py-8 px-4">
				<div className="max-w-4xl mx-auto">
					{/* Header */}
					<div className="flex items-center gap-4 mb-6 sm:mb-8">
						<Button variant="ghost" size="sm" asChild>
							<Link href="/admin/postal-brownies">
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back to List
							</Link>
						</Button>
						<div>
							<h1 className="text-2xl sm:text-3xl font-bold">
								Create New Postal Combo
							</h1>
							<p className="text-muted-foreground mt-1">
								Add a new postal brownie combination to your catalog
							</p>
						</div>
					</div>

					{/* Form */}
					<Card>
						<CardHeader>
							<CardTitle>Postal Combo Details</CardTitle>
						</CardHeader>
						<CardContent>
							<PostalComboForm />
						</CardContent>
					</Card>
				</div>
			</div>
		</FadeIn>
	);
}

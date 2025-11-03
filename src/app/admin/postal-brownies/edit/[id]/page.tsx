import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FadeIn } from "@/components/fade-in";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { postalCombos } from "@/lib/db/schema";
import PostalComboForm from "../../_components/postal-combo-form";

export default async function EditPostalComboPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const postalComboId = Number.parseInt(id);

	if (Number.isNaN(postalComboId)) {
		notFound();
	}

	const postalCombo = await db.query.postalCombos.findFirst({
		where: eq(postalCombos.id, postalComboId),
	});

	if (!postalCombo) {
		notFound();
	}

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
								Edit Postal Combo
							</h1>
							<p className="text-muted-foreground mt-1">
								Update the details of "{postalCombo.name}"
							</p>
						</div>
					</div>

					{/* Form */}
					<Card>
						<CardHeader>
							<CardTitle>Postal Combo Details</CardTitle>
						</CardHeader>
						<CardContent>
							<PostalComboForm
								initialData={postalCombo}
								key={postalCombo.id}
								isEdit={true}
							/>
						</CardContent>
					</Card>
				</div>
			</div>
		</FadeIn>
	);
}

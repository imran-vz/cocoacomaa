import { DessertForm } from "@/components/desserts/dessert-form";
import { FadeIn } from "@/components/fade-in";

export default function NewSpecialPage() {
	return (
		<FadeIn>
			<DessertForm
				mode="create"
				initialData={{
					name: "",
					price: "",
					description: "",
					imageUrl: "",
					status: "available",
					category: "special",
					leadTimeDays: 2,
					containsEgg: true,
				}}
			/>
		</FadeIn>
	);
}

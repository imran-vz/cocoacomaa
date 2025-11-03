import { DessertForm } from "@/components/desserts/dessert-form";
import { FadeIn } from "@/components/fade-in";

export default function NewDessertPage() {
	return (
		<FadeIn>
			<DessertForm mode="create" />
		</FadeIn>
	);
}

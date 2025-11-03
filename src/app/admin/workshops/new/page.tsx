import { FadeIn } from "@/components/fade-in";
import { WorkshopForm } from "@/components/workshops/workshop-form";

export default function NewWorkshopPage() {
	return (
		<FadeIn>
			<WorkshopForm mode="create" />
		</FadeIn>
	);
}

import { DessertForm } from "@/components/desserts/dessert-form";

export default function NewSpecialPage() {
	return (
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
			}}
		/>
	);
}

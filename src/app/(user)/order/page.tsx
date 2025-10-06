import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { fetchDesserts } from "@/lib/db/dessert";
import OrderClientPage from "./order-client-page";

export default async function OrderPage() {
	const session = await auth();
	if (!session?.user?.id) {
		redirect("/login?redirect=/order");
	}

	const initialDesserts = await fetchDesserts();

	return <OrderClientPage initialDesserts={initialDesserts} />;
}

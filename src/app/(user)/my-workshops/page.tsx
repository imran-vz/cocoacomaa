import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getMyWorkshopOrders } from "@/lib/db/workshop-order";
import MyWorkshopPage from "./my-workshop-page";

export default async function Page() {
	const session = await auth();
	if (!session?.user?.id) {
		redirect("/login?redirect=/my-workshops");
	}

	const ordersList = await getMyWorkshopOrders(session.user.id);

	return <MyWorkshopPage initialData={ordersList} />;
}

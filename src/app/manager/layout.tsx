import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ManagerNavigation } from "@/components/manager-navigation";

export default async function ManagerLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth();

	if (!session || session.user?.role !== "manager") {
		redirect("/");
	}

	return (
		<>
			<ManagerNavigation />
			{children}
		</>
	);
}

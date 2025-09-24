import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function ManagerLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth();

	if (!session || session.user?.role !== "manager") {
		redirect("/");
	}

	return <>{children}</>;
}

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { HomeContent } from "./home-content";

export default async function Home() {
	const session = await auth();
	if (session?.user?.role === "admin") {
		redirect("/admin");
	} else if (session?.user?.role === "manager") {
		redirect("/manager");
	}

	return <HomeContent />;
}

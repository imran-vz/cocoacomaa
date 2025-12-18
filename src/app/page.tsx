import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { HomeContent } from "./home-content";

export default async function Home() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (session?.user?.role === "admin") {
		redirect("/admin");
	} else if (session?.user?.role === "manager") {
		redirect("/manager");
	}

	return <HomeContent />;
}

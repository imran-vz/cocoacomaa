import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import CheckoutPage from "./_components/checkout";
import { auth } from "@/auth";

export default async function Page() {
	const session = await auth();
	if (!session?.user?.id) {
		redirect("/login");
	}

	const user = await db.query.users.findFirst({
		where: eq(users.id, session?.user?.id),
	});

	return (
		<Suspense>
			<CheckoutPage
				user={{
					email: user?.email ?? "",
					phone: user?.phone ?? "",
					name: user?.name ?? "",
				}}
			/>
		</Suspense>
	);
}

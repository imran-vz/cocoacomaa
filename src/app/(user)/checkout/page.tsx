import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import CheckoutPage from "./_components/checkout";

export default async function Page() {
	const session = await auth();
	if (!session?.user?.id) {
		redirect("/login");
	}

	const user = await db.query.users.findFirst({
		where: eq(users.id, session?.user?.id),
	});

	return (
		<Suspense fallback={<div>Loading...</div>}>
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

import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { postalCombos } from "@/lib/db/schema";
import PostalBrowniesClient from "./_components/postal-brownies-client";

export default async function Page() {
	const postalCombosList = await db.query.postalCombos.findMany({
		orderBy: (postalCombos, { asc }) => [asc(postalCombos.createdAt)],
		where: and(
			eq(postalCombos.isDeleted, false),
			eq(postalCombos.status, "available"),
		),
	});

	return <PostalBrowniesClient postalCombosList={postalCombosList} />;
}

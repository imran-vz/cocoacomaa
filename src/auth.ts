import { DrizzleAdapter } from "@auth/drizzle-adapter";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { authOptions } from "@/auth.config";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { loginSchema } from "./lib/schema";

export const { auth, handlers, signIn, signOut } = NextAuth({
	...authOptions,

	adapter: DrizzleAdapter(db),

	providers: [
		CredentialsProvider({
			name: "credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				console.log(" :31 | authorize | credentials:", credentials);
				const parsedCredentials = loginSchema.safeParse(credentials);
				console.log(
					" :30 | authorize | parsedCredentials:",
					parsedCredentials.error?.flatten(),
				);

				if (!parsedCredentials.success) {
					console.log(
						" :39 | authorize | parsedCredentials:",
						parsedCredentials.error?.flatten(),
					);
					return null;
				}

				const { email, password } = parsedCredentials.data;

				const user = await db.query.users.findFirst({
					where: eq(users.email, email),
				});

				if (!user || !user.password) {
					console.log(" :50 | authorize | user:", user);
					return null;
				}

				const isPasswordValid = await bcrypt.compare(password, user.password);

				if (!isPasswordValid) {
					console.log(" :57 | authorize | isPasswordValid:", isPasswordValid);
					return null;
				}

				return {
					id: user.id,
					email: user.email,
					name: user.name,
					role: user.role,
				};
			},
		}),
	],
});

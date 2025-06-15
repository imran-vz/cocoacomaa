import { authOptions } from "@/auth.config";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string(),
});

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
				const parsedCredentials = loginSchema.safeParse(credentials);

				if (!parsedCredentials.success) {
					throw new Error("Invalid credentials");
				}

				const { email, password } = parsedCredentials.data;

				const user = await db.query.users.findFirst({
					where: eq(users.email, email),
				});

				if (!user || !user.password) {
					throw new Error("Invalid credentials");
				}

				const isPasswordValid = await bcrypt.compare(password, user.password);

				if (!isPasswordValid) {
					throw new Error("Invalid credentials");
				}

				return {
					id: user.id,
					email: user.email,
					name: user.name,
				};
			},
		}),
	],
});

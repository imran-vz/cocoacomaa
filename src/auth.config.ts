import type { DefaultSession, NextAuthConfig } from "next-auth";

declare module "next-auth" {
	interface User {
		role: string;
	}

	interface Session {
		user: User & DefaultSession["user"];
	}
}

export const authOptions = {
	session: {
		strategy: "jwt",
	},
	pages: {
		signIn: "/login",
	},

	callbacks: {
		async session({ session, token }) {
			return {
				...session,
				user: {
					...session.user,
					role: String(token.role ?? ""),
					id: String(token.id ?? ""),
					email: String(token.email ?? ""),
					name: String(token.name ?? ""),
				},
			};
		},

		async jwt({ token, user }) {
			if (user) {
				token.role = user.role;
				token.id = String(user.id ?? "");
				token.email = String(user.email ?? "");
				token.name = String(user.name ?? "");
			}
			return token;
		},
	},
	providers: [],
} satisfies NextAuthConfig;

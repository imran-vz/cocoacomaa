import type { NextAuthConfig } from "next-auth";

export const authOptions = {
	session: {
		strategy: "jwt",
	},
	pages: {
		signIn: "/login",
	},

	callbacks: {
		async session({ session }) {
			return {
				...session,
				user: session.user,
			};
		},
	},
	providers: [],
} satisfies NextAuthConfig;

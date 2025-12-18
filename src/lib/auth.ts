import bcrypt from "bcrypt";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { oneTap } from "better-auth/plugins";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/email";
import { SECURITY_CONFIG } from "./security-config";

export const auth = betterAuth({
	plugins: [oneTap()],
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			user: schema.users,
			session: schema.sessions,
			account: schema.accounts,
			verification: schema.verification,
		},
	}),
	logger: {
		level: "debug",
		disabled: false,
		log(level, message, ...args) {
			console.log(level, message, ...args);
		},
	},

	emailVerification: {
		enabled: true,
		sendOnSignIn: true,
		async sendVerificationEmail({ user, url }) {
			void sendVerificationEmail({
				to: user.email,
				userName: user.name,
				url,
			});
		},
	},
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		password: {
			async hash(password) {
				return await bcrypt.hash(password, SECURITY_CONFIG.bcryptRounds);
			},
			async verify({ password, hash }: { password: string; hash: string }) {
				return await bcrypt.compare(password, hash);
			},
		},
		async sendResetPassword({ user, url }) {
			void sendPasswordResetEmail({
				to: user.email,
				userName: user.name,
				url,
			});
		},
	},

	socialProviders: {
		google: {
			clientId: process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID || "",
			clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
		},
	},

	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // Update session every 24h
		cookieCache: {
			enabled: true,
			maxAge: 60 * 5, // 5 min cache
		},
	},

	user: {
		additionalFields: {
			role: {
				type: "string",
				required: true,
				defaultValue: "customer",
				input: false, // Don't allow setting role via API
			},
			phone: {
				type: "string",
				required: false,
			},
			phoneVerified: {
				type: "boolean",
				required: true,
				defaultValue: false,
			},
		},
	},
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;

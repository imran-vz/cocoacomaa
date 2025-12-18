import {
	inferAdditionalFields,
	oneTapClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
	plugins: [
		oneTapClient({
			clientId: process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID || "",
			// Optional client configuration:
			autoSelect: false,
			cancelOnTapOutside: true,
			context: "signin",
			additionalOptions: {},
			// Configure prompt behavior and exponential backoff:
			promptOptions: {
				baseDelay: 1000, // Base delay in ms (default: 1000)
				maxAttempts: 5, // Maximum number of attempts before triggering onPromptNotification (default: 5)
			},
		}),
		inferAdditionalFields<{
			options: {
				user: {
					additionalFields: {
						role: {
							type: "string";
						};
						phone: {
							type: "string";
						};
					};
				};
			};
		}>(),
	],
});

export type { Session } from "better-auth/types";

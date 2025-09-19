// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// Only initialize Sentry in production
if (process.env.NODE_ENV === "production") {
	Sentry.init({
		dsn: "https://7cbf330db7b004ed891bd8db5e2b2d41@o4509786235928576.ingest.de.sentry.io/4509786237042768",

		// Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
		tracesSampleRate: 1,

		// Enable logs to be sent to Sentry
		enableLogs: true,

		// Setting this option to true will print useful information to the console while you're setting up Sentry.
		debug: false,
	});
}

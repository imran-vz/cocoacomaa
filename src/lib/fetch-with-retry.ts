/**
 * Fetch wrapper with automatic retry logic for transient failures.
 * Uses exponential backoff with jitter to avoid thundering herd.
 *
 * Only retries on:
 * - Network errors (TypeError: Failed to fetch)
 * - 5xx server errors
 * - 408 Request Timeout
 * - 429 Too Many Requests (with Retry-After header support)
 *
 * Does NOT retry on:
 * - 4xx client errors (except 408, 429)
 * - Aborted requests
 * - Non-retryable HTTP methods (unless explicitly allowed)
 */

interface FetchWithRetryOptions {
	/** Maximum number of retry attempts (default: 3) */
	maxRetries?: number;
	/** Base delay in ms before first retry (default: 500) */
	baseDelay?: number;
	/** Maximum delay in ms between retries (default: 8000) */
	maxDelay?: number;
	/** Timeout per individual request in ms (default: 15000) */
	timeout?: number;
	/** Whether to retry on POST/PUT/PATCH (default: false for safety) */
	retryMutations?: boolean;
	/** Called before each retry with attempt number and delay */
	onRetry?: (attempt: number, delay: number, error: Error) => void;
}

const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

const NON_RETRYABLE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function isRetryableError(error: unknown): boolean {
	// Network errors
	if (error instanceof TypeError && error.message === "Failed to fetch") {
		return true;
	}

	// AbortError from timeout — retryable
	if (error instanceof DOMException && error.name === "AbortError") {
		return true;
	}

	return false;
}

function isRetryableResponse(response: Response): boolean {
	return RETRYABLE_STATUS_CODES.has(response.status);
}

function getRetryAfterMs(response: Response): number | null {
	const retryAfter = response.headers.get("Retry-After");
	if (!retryAfter) return null;

	// Could be seconds or a date string
	const seconds = Number.parseInt(retryAfter, 10);
	if (!Number.isNaN(seconds)) {
		return seconds * 1000;
	}

	const date = new Date(retryAfter);
	if (!Number.isNaN(date.getTime())) {
		return Math.max(0, date.getTime() - Date.now());
	}

	return null;
}

/**
 * Calculate delay with exponential backoff and jitter.
 * delay = min(maxDelay, baseDelay * 2^attempt) + random jitter
 */
function calculateDelay(
	attempt: number,
	baseDelay: number,
	maxDelay: number,
): number {
	const exponentialDelay = baseDelay * 2 ** attempt;
	const cappedDelay = Math.min(maxDelay, exponentialDelay);
	// Add jitter: ±25% of the delay
	const jitter = cappedDelay * 0.25 * (Math.random() * 2 - 1);
	return Math.round(cappedDelay + jitter);
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch with automatic retry for transient failures.
 *
 * @example
 * ```ts
 * // Simple GET with retries
 * const response = await fetchWithRetry("/api/desserts");
 *
 * // POST with retries enabled (opt-in for mutations)
 * const response = await fetchWithRetry("/api/orders", {
 *   method: "POST",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify(data),
 * }, { retryMutations: true, maxRetries: 2 });
 *
 * // With retry callback for UI feedback
 * const response = await fetchWithRetry("/api/orders/verify", init, {
 *   onRetry: (attempt, delay) => {
 *     console.log(`Retry ${attempt}, waiting ${delay}ms...`);
 *   },
 * });
 * ```
 */
export async function fetchWithRetry(
	input: RequestInfo | URL,
	init?: RequestInit,
	options?: FetchWithRetryOptions,
): Promise<Response> {
	const {
		maxRetries = 3,
		baseDelay = 500,
		maxDelay = 8000,
		timeout = 15000,
		retryMutations = false,
		onRetry,
	} = options ?? {};

	// Determine if the method is retryable
	const method = (init?.method ?? "GET").toUpperCase();
	const canRetry = retryMutations || !NON_RETRYABLE_METHODS.has(method);

	let lastError: Error | null = null;
	let lastResponse: Response | null = null;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			// Create an AbortController for timeout
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), timeout);

			// Merge abort signals: respect caller's signal + our timeout
			const callerSignal = init?.signal;
			if (callerSignal?.aborted) {
				clearTimeout(timeoutId);
				throw new DOMException("The operation was aborted.", "AbortError");
			}

			// If caller provided a signal, abort our controller when theirs aborts
			const callerAbortHandler = callerSignal ? () => controller.abort() : null;
			if (callerSignal && callerAbortHandler) {
				callerSignal.addEventListener("abort", callerAbortHandler, {
					once: true,
				});
			}

			try {
				const response = await fetch(input, {
					...init,
					signal: controller.signal,
				});

				clearTimeout(timeoutId);
				if (callerSignal && callerAbortHandler) {
					callerSignal.removeEventListener("abort", callerAbortHandler);
				}

				// If response is OK or non-retryable, return immediately
				if (response.ok || !isRetryableResponse(response) || !canRetry) {
					return response;
				}

				// Response is retryable — store it and potentially retry
				lastResponse = response;
				lastError = new Error(
					`HTTP ${response.status}: ${response.statusText}`,
				);

				// If this was the last attempt, return the response as-is
				if (attempt === maxRetries) {
					return response;
				}

				// Calculate delay, respecting Retry-After header
				const retryAfterMs = getRetryAfterMs(response);
				const delay =
					retryAfterMs ?? calculateDelay(attempt, baseDelay, maxDelay);

				onRetry?.(attempt + 1, delay, lastError);
				await sleep(delay);
			} catch (fetchError) {
				clearTimeout(timeoutId);
				if (callerSignal && callerAbortHandler) {
					callerSignal.removeEventListener("abort", callerAbortHandler);
				}
				throw fetchError;
			}
		} catch (error) {
			// If the caller's signal caused the abort, don't retry
			if (init?.signal?.aborted) {
				throw error;
			}

			const err = error instanceof Error ? error : new Error(String(error));
			lastError = err;

			// Only retry on retryable errors
			if (!canRetry || !isRetryableError(error) || attempt === maxRetries) {
				throw err;
			}

			const delay = calculateDelay(attempt, baseDelay, maxDelay);
			onRetry?.(attempt + 1, delay, err);
			await sleep(delay);
		}
	}

	// This should never be reached, but just in case
	if (lastResponse) {
		return lastResponse;
	}

	throw lastError ?? new Error("fetchWithRetry: unexpected state");
}

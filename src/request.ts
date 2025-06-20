import type { Narrowable } from "inferred-types";
import type { GotchaRequestOptions, NetworkResponse } from "./types";
import { isString } from "inferred-types";
import { request as fetch } from "undici";
import { ClientError, Redirection, ServerError, Timeout } from "~/errors";
import { isUrlObject } from "~/type-guards";

/**
 * a wrapper around the `request` method from **undici** but
 * return returns a `Redirection`, `ClientError`, `ServerError`, or `Timeout`
 * if the status code is above 299 or if a timeout occurs.
 */
export async function request(
    url: Parameters<typeof fetch>[0],
    options?: GotchaRequestOptions
): Promise<Error | NetworkResponse> {
    const startTime = Date.now();

    // Extract timeout from our options
    const { timeout, ...undiciOptions } = options || {};

    // Convert URL to string for error messages
    const urlString = isString(url)
        ? url
        : url instanceof URL
            ? url.toString()
            : isUrlObject(url)
                ? `${url.hostname}:${url.port || 80}/${url.path}`
                : "";

    // Set up abort controller for timeout
    let timeoutId: NodeJS.Timeout | undefined;
    let controller: AbortController | undefined;

    // Only set up timeout if it's a valid, positive, finite number
    if (timeout && timeout > 0 && Number.isFinite(timeout) && timeout <= 2147483647) {
        controller = new AbortController();

        timeoutId = setTimeout(() => {
            if (controller) {
                controller.abort();
            }
        }, timeout);

        // Merge the timeout signal with any existing signal
        const existingSignal = undiciOptions?.signal;
        if (existingSignal) {
            // If there's already a signal, we need to handle both
            const combinedController = new AbortController();

            const cleanup = () => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
            };

            // If existing signal is already aborted, abort immediately
            if (existingSignal.aborted) {
                combinedController.abort();
                cleanup();
            }
            else {
                existingSignal.addEventListener("abort", () => {
                    try {
                        combinedController.abort();
                    }
                    catch {
                        // Ignore if already aborted
                    }
                    cleanup();
                }, { once: true });
            }

            controller.signal.addEventListener("abort", () => {
                try {
                    combinedController.abort();
                }
                catch {
                    // Ignore if already aborted
                }
                cleanup();
            }, { once: true });

            undiciOptions.signal = combinedController.signal;
        }
        else {
            undiciOptions.signal = controller.signal;
        }
    }

    try {
        const req = await fetch(url, undiciOptions);

        // Clear timeout if request completed successfully
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        if (req.statusCode < 300) {
            return req;
        }
        else if (req.statusCode < 400) {
            return Redirection(
                `A redirection took place while requesting the URL: '${urlString}'.`,
                {
                    headers: req.headers,
                    code: req.statusCode,
                    body: req.body,
                    context: req.context || undefined,
                    opaque: req.opaque as Narrowable,
                    trailers: req.trailers || undefined
                }
            );
        }
        else if (req.statusCode < 500) {
            // eslint-disable-next-line unicorn/throw-new-error
            return ClientError(
                `A client-based network error happened requesting the URL: '${urlString}'.`,
                {
                    headers: req.headers,
                    code: req.statusCode,
                    body: req.body,
                    context: req.context || undefined,
                    opaque: req.opaque as Narrowable,
                    trailers: req.trailers || undefined
                }
            );
        }
        else {
            // eslint-disable-next-line unicorn/throw-new-error
            return ServerError(
                `A server-based network error happened requesting the URL: '${urlString}'.`,
                {
                    headers: req.headers,
                    code: req.statusCode,
                    body: req.body,
                    context: req.context || undefined,
                    opaque: req.opaque as Narrowable,
                    trailers: req.trailers || undefined
                }
            );
        }
    }
    catch (error) {
        // Clear timeout on any error
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        // Check if this was a timeout (abort) error
        if (controller?.signal.aborted && timeout) {
            const elapsedTime = Date.now() - startTime;
            return Timeout(
                `Request timed out after ${elapsedTime}ms (limit: ${timeout}ms) while requesting the URL: '${urlString}'.`,
                {
                    url: urlString,
                    timeout,
                    elapsedTime,
                    method: undiciOptions?.method || "GET"
                }
            );
        }

        // Re-throw other errors (this shouldn't normally happen with undici)
        // but if it does, we should handle it gracefully
        throw error;
    }
}

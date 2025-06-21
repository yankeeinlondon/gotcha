import type { Configure, Gotcha, GotchaRequest, GotchaReturn } from "./types";
import { request } from "./request";
import { isGotchaRequest } from "./type-guards";

/**
 * **gotcha**`<T>(...T) -> GotchaReturn<T>`
 *
 * The gotcha function is multifaceted but for immediate use you can simply
 * treat it just like the [undici's](https://undici.nodejs.org/#/) `request` API surface:
 *
 * ```ts
 * const resp = await gotcha("https://example.com/");
 * ```
 *
 * The main difference now is that the type returns is either a strongly typed
 * error or a successful api call. The errors are typed as:
 *
 * - `Redirection` - if the API call return a 300 based http code, then this error will be returned.
 * - `ClientError` - all 400-based errors are returned as client errors.
 * - `ServerError` - all 500-based errors are returned as server errors.
 * - `Timeout` - returned when you specified a timeout interval (_a feature of **Gotcha**_) and the request was not able complete in the specified time interval.
 *
 * To have the best type experience we recommend using our type guards:
 *
 * - `isOk(req)` - tests that no errors were returned and returns a successful type for `res`.
 * - `isError(req)` - tests for any of the potential error types
 * - `wasRedirected(req)` - tests only for the `Redirection` error type
 * - `didTimeout(req)` - tests only for the `Timeout` error type
 * - `wasClientError(req)` - tests for client errors
 * - `wasServerError(req)` - tests for server errors
 *
 * ### Advanced Use Cases
 * 
 * Refer to the `README.md` to understand more about advanced use cases.
 */
export function gotcha<T extends GotchaRequest>(...req: T): GotchaReturn<T>;
export function gotcha<T extends Configure>(...req: T): GotchaReturn<T>;
export function gotcha<T extends Gotcha>(...req: T): GotchaReturn<T> {
    if (isGotchaRequest(req)) {
        // The type guard should narrow this, but we need to help TypeScript
        // This is a limitation of TypeScript's generic type narrowing
        const [url, options] = req;
        return (request(url, options) as any) as GotchaReturn<T>;
    }
    else {
        // Handle Configure type - placeholder for future implementation
        throw new Error("Configure type not yet implemented");
    }
}

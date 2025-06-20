import type { Configure, Gotcha, GotchaRequest, GotchaReturn } from "./types";
import { request } from "./request";
import { isGotchaRequest } from "./type-guards";

// Function overloads to handle different tuple types
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

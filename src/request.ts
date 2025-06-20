import type { Narrowable } from "inferred-types";
import type { NetworkResponse } from "./types";
import { isString } from "inferred-types";
import { request as fetch } from "undici";
import { ClientError, Redirection, ServerError } from "~/errors";
import { isUrlObject } from "~/type-guards";

/**
 * a wrapper around the `request` method from **undici** but
 * return returns a `Redirection`, `ClientError`, or `ServerError`
 * if the status code is above 299.
 */
export async function request(...args: Parameters<typeof fetch>): Promise<
    Error | NetworkResponse
> {
    const req = await fetch(...args);
    const url = isString(args[0])
        ? args[0]
        : isUrlObject(args[0])
            ? `${args[0].hostname}:${args[0].port || 80}/${args[0].path}`
            : "";

    if (req.statusCode < 300) {
        return req;
    }
    else if (req.statusCode < 400) {
        return Redirection(
            `A redirection took place while requesting the URL: '${url}'.`,
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
        return ClientError(
            `A client-based network error happened requesting the URL: '${url}'.`,
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
        return ServerError(
            `A server-based network error happened requesting the URL: '${url}'.`,
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

import type { KindError } from "@yankeeinlondon/kind-error";
import type { Narrowable } from "inferred-types";
import type Dispatcher from "undici/types/dispatcher";
import type { IncomingHttpHeaders } from "undici/types/header";
import type BodyReadable from "undici/types/readable";
import { Timeout } from "~/errors";

export function timedOut(val: unknown): val is KindError<"Timeout", {
    headers: IncomingHttpHeaders;
    code: number;
    body: BodyReadable & Dispatcher.BodyMixin;
    context: object;
    opaque: Narrowable;
    trailers: Record<string, string>;
    url: string;
    /**
     * the timeout period allowed before the promise is cancelled and a Timeout error
     * is returned instead.
     */
    timeout: number;
    /**
     * elapsed time -- in milliseconds -- since the request started before it was
     * actually cancelled.
     */
    elapsedTime: number;
    library: "gotcha";
}> {
    return Timeout.is(val);
}

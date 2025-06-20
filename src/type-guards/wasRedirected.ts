import type { KindError } from "@yankeeinlondon/kind-error";
import type { Narrowable } from "inferred-types";
import type Dispatcher from "undici/types/dispatcher";
import type { IncomingHttpHeaders } from "undici/types/header";
import type BodyReadable from "undici/types/readable";
import { Redirection } from "~/errors";

export function wasRedirected(val: unknown): val is KindError<"Redirection", {
    headers: IncomingHttpHeaders;
    code: number;
    body: BodyReadable & Dispatcher.BodyMixin;
    context: object;
    opaque: Narrowable;
    trailers: Record<string, string>;
    library: "gotcha";
}> {
    return Redirection.is(val);
}

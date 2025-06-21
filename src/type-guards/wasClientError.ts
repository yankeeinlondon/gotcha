import { KindError } from "@yankeeinlondon/kind-error";
import { Narrowable } from "inferred-types";
import Dispatcher from "undici/types/dispatcher";
import { IncomingHttpHeaders } from "undici/types/header";
import BodyReadable from "undici/types/readable";
import { ClientError } from "~/errors";


export function wasClientError(val: unknown): val is KindError<"ClientError", {
    headers: IncomingHttpHeaders;
    code: number;
    body: BodyReadable & Dispatcher.BodyMixin;
    context: object;
    opaque: Narrowable;
    trailers: Record<string, string>;
    url: string;
    library: "gotcha";
}> {
    return ClientError.is(val);
}

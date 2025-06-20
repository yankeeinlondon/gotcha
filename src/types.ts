import type { NumberLike, Suggest } from "inferred-types";
import type { Duplex, EventEmitter } from "node:stream";
import type { request } from "undici";
import type { UndiciHeaders } from "undici/types/dispatcher";
import type { IncomingHttpHeaders } from "undici/types/header";

export type GotchaRequest = [
    url: Parameters<typeof request>[0],
    options?: GotchaRequestOptions
];
export type Configure = [{ foo: number; bar: number }];

export type Gotcha = GotchaRequest | Configure;

// Generic T is reserved for future use when return type needs to vary based on input
export type GotchaReturn<T extends Gotcha = Gotcha> = T extends GotchaRequest
    ? Promise<NetworkResponse | Error>
    : T extends Configure
        ? Promise<"the future">
        : never;

export interface UrlObject {
    port?: NumberLike;
    path?: string;
    pathname?: string;
    hostname?: string;
    origin?: string;
    search?: string;
}

/** the type of the **undici** `request` function */
export type UndiciRequestFn = typeof request;

/** the parameters of the **undici** `request` function */
export type UndiciRequestParams = Parameters<UndiciRequestFn>;

/** the "options" property in a **undici** `request` */
export type UndiciRequestOptions = UndiciRequestParams[1];

/**
 * **GotchaRequestOptions**
 *
 * The request options.
 */
export type GotchaRequestOptions = UndiciRequestOptions & {
    /** allows the addition of a **timeout** (in ms) */
    timeout?: number;
};

export type NetworkResponse = Awaited<ReturnType<UndiciRequestFn>>;

export type RestVerb = "GET" | "PUT" | "POST" | "PATCH" | "DELETE" | "HEAD";
export type NetworkProtocol = "Websocket";

export interface UpgradeOptions {
    path: string;
    method?: Suggest<RestVerb>;
    headers?: UndiciHeaders;
    protocol?: Suggest<NetworkProtocol | `${NetworkProtocol}, ${NetworkProtocol}`>;
    signal?: AbortSignal | EventEmitter | null;
}

export interface UpgradeData {
    headers: IncomingHttpHeaders;
    socket: Duplex;
    opaque: unknown;
}

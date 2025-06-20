import type { NumberLike, Suggest } from "inferred-types";
import type { Duplex, EventEmitter } from "node:stream";
import type { request } from "undici";
import type { UndiciHeaders } from "undici/types/dispatcher";
import type { IncomingHttpHeaders } from "undici/types/header";

/**
 * **GotchaRequest**
 */
export type GotchaRequest = [
    url: Parameters<typeof request>[0],
    options?: GotchaRequestOptions
];

/** this is a placeholder for future functionality */
export type Configure = [{ foo: number; bar: number }];

export type Gotcha = GotchaRequest | Configure;

/**
 * The return type provided by `gotcha()` based on the parameters
 * which were passed in.
 */
export type GotchaReturn<T extends Gotcha = Gotcha> = T extends GotchaRequest
    ? Promise<NetworkResponse | Error>
    : T extends Configure
        ? Promise<"the future">
        : never;

/**
 * **UrlObject**
 *
 * Provides an object-type which can be used to specify the URL you are requesting.
 */
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
 *
 * - includes all the standard options provided by **undici**, but
 * - also include `timeout` if you wish to add a timeout timeframe
 * under which the promise will be aborted with the `AbortController`
 */
export type GotchaRequestOptions = UndiciRequestOptions & {
    /** allows the addition of a **timeout** (in ms) */
    timeout?: number;
};

export type NetworkResponse = Awaited<ReturnType<UndiciRequestFn>>;
/**
 * The allowed RESTful verbs you can use in a request
 */
export type RestVerb = "GET" | "PUT" | "POST" | "PATCH" | "DELETE" | "HEAD";

/**
 * A union of network protocol's which might be _upgraded_.
 */
export type UpgradeNetworkProtocol = "Websocket";

/**
 * options hash for upgrading the network protocol
 */
export interface UpgradeOptions {
    path: string;
    method?: Suggest<RestVerb>;
    headers?: UndiciHeaders;
    protocol?: Suggest<UpgradeNetworkProtocol | `${UpgradeNetworkProtocol}, ${UpgradeNetworkProtocol}`>;
    signal?: AbortSignal | EventEmitter | null;
}

export interface UpgradeData {
    headers: IncomingHttpHeaders;
    socket: Duplex;
    opaque: unknown;
}

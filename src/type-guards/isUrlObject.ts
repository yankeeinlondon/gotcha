import type { UrlObject } from "~/types";
import { isNumberLike, isObject, isString, isUndefined } from "inferred-types";

const keys = [
    "port",
    "path",
    "pathname",
    "hostname",
    "origin",
    "search"
];

export function isUrlObject(val: unknown): val is UrlObject {
    return isObject(val) && Object.keys(val).every(i => keys.includes(val[i] as any)) && (
        isUndefined(val.port) || isNumberLike(val.port)
    ) && (
        isUndefined(val.path) || isString(val.path)
    ) && (
        isUndefined(val.pathname) || isString(val.pathname)
    ) && (
        isUndefined(val.hostname) || isString(val.hostname)
    ) && (
        isUndefined(val.origin) || isString(val.origin)
    );
}

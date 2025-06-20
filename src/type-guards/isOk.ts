import { isError } from "@yankeeinlondon/kind-error";

export function isOk<T>(val: T): val is Exclude<T, Error> {
    return !isError(val);
}

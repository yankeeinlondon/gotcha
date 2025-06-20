import type { GotchaRequest } from "~/types";
import { isArray, isString } from "inferred-types";
import { isUrlObject } from "./isUrlObject";

export function isGotchaRequest(val: unknown): val is GotchaRequest {
    return isArray(val) && (
        isString(val[0])
        || val[0] instanceof URL
        || isUrlObject(val[0])
    );
}

import { createKindError } from "@yankeeinlondon/kind-error";

/**
 * An error type resulting from a 300-based Network error
 */
export const Redirection = createKindError(
    "Redirection",
    { library: "gotcha" }
);

/**
 * An error type resulting from a 400-based network error
 */
export const ClientError = createKindError(
    "ClientError",
    { library: "gotcha" }
);

/**
 * An error type resulting from a 500-based network error
 */
export const ServerError = createKindError(
    "ServerError",
    { library: "gotcha" }
);

/**
 * An error type resulting from a network request not returning 
 * before the specified time limit.
 */
export const Timeout = createKindError(
    "Timeout",
    { library: "gotcha" }
);

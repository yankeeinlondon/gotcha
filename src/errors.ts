import { createKindError } from "@yankeeinlondon/kind-error";

export const Redirection = createKindError(
    "Redirection",
    { library: "gotcha" }
);

export const ClientError = createKindError(
    "ClientError",
    { library: "gotcha" }
);

export const ServerError = createKindError(
    "ServerError",
    { library: "gotcha" }
);

export const Timeout = createKindError(
    "Timeout",
    { library: "gotcha" }
);

import { describe, it, expect, beforeEach } from "vitest";
import { gotcha } from "~/gotcha";
import { ClientError } from "~/errors";
import { MockHttpServer, TEST_RESPONSES } from "./test-utils";

describe("gotcha - Client Error Handling (400-499)", () => {
    let server: MockHttpServer;

    beforeEach(() => {
        server = (globalThis as any).testServer as MockHttpServer;
    });

    describe("4xx status codes", () => {
        it("should return ClientError for 400 Bad Request", async () => {
            server.setResponse("POST", "/bad-request", TEST_RESPONSES.CLIENT_ERROR_400);
            
            const result = await gotcha(server.getUrl("/bad-request"), {
                method: "POST",
                body: "invalid-data"
            });
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "client-error");
            if (result instanceof Error) {
                expect(result.message).toContain("client-based network error");
                expect(result.message).toContain(server.getUrl("/bad-request"));
                expect((result as any).context.code).toBe(400);
                expect((result as any).context.headers["content-type"]).toBe("application/json");
            }
        });

        it("should return ClientError for 401 Unauthorized", async () => {
            server.setResponse("GET", "/unauthorized", {
                statusCode: 401,
                headers: { 
                    "content-type": "application/json",
                    "www-authenticate": "Bearer realm=\"API\""
                },
                body: JSON.stringify({ error: "Unauthorized", message: "Invalid or missing token" })
            });
            
            const result = await gotcha(server.getUrl("/unauthorized"));
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "client-error");
            if (result instanceof Error) {
                expect((result as any).context.code).toBe(401);
                expect((result as any).context.headers["www-authenticate"]).toBe("Bearer realm=\"API\"");
            }
        });

        it("should return ClientError for 403 Forbidden", async () => {
            server.setResponse("DELETE", "/forbidden", {
                statusCode: 403,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ 
                    error: "Forbidden", 
                    message: "Insufficient permissions to delete this resource" 
                })
            });
            
            const result = await gotcha(server.getUrl("/forbidden"), {
                method: "DELETE"
            });
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "client-error");
            if (result instanceof Error) {
                expect((result as any).context.code).toBe(403);
            }
        });

        it("should return ClientError for 404 Not Found", async () => {
            server.setResponse("GET", "/not-found", TEST_RESPONSES.CLIENT_ERROR_404);
            
            const result = await gotcha(server.getUrl("/not-found"));
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "client-error");
            if (result instanceof Error) {
                expect((result as any).context.code).toBe(404);
                expect((result as any).context.headers["content-type"]).toBe("text/html");
            }
        });

        it("should return ClientError for 405 Method Not Allowed", async () => {
            server.setResponse("POST", "/method-not-allowed", {
                statusCode: 405,
                headers: { 
                    "content-type": "application/json",
                    "allow": "GET, PUT, DELETE"
                },
                body: JSON.stringify({ error: "Method Not Allowed", allowed: ["GET", "PUT", "DELETE"] })
            });
            
            const result = await gotcha(server.getUrl("/method-not-allowed"), {
                method: "POST"
            });
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "client-error");
            if (result instanceof Error) {
                expect((result as any).context.code).toBe(405);
                expect((result as any).context.headers.allow).toBe("GET, PUT, DELETE");
            }
        });

        it("should return ClientError for 409 Conflict", async () => {
            server.setResponse("PUT", "/conflict", {
                statusCode: 409,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ 
                    error: "Conflict", 
                    message: "Resource already exists with this identifier",
                    conflictingId: "12345"
                })
            });
            
            const result = await gotcha(server.getUrl("/conflict"), {
                method: "PUT",
                body: JSON.stringify({ id: "12345", name: "Test" })
            });
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "client-error");
            if (result instanceof Error) {
                expect((result as any).context.code).toBe(409);
            }
        });

        it("should return ClientError for 422 Unprocessable Entity", async () => {
            server.setResponse("POST", "/validation-error", {
                statusCode: 422,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ 
                    error: "Validation Error",
                    fields: {
                        email: ["Email is required", "Email format is invalid"],
                        age: ["Age must be a positive number"]
                    }
                })
            });
            
            const result = await gotcha(server.getUrl("/validation-error"), {
                method: "POST",
                body: JSON.stringify({ name: "John", email: "invalid", age: -5 })
            });
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "client-error");
            if (result instanceof Error) {
                expect((result as any).context.code).toBe(422);
            }
        });

        it("should return ClientError for 429 Too Many Requests", async () => {
            server.setResponse("GET", "/rate-limited", {
                statusCode: 429,
                headers: { 
                    "content-type": "application/json",
                    "retry-after": "60",
                    "x-ratelimit-limit": "100",
                    "x-ratelimit-remaining": "0"
                },
                body: JSON.stringify({ 
                    error: "Rate Limit Exceeded",
                    retryAfter: 60,
                    limit: 100
                })
            });
            
            const result = await gotcha(server.getUrl("/rate-limited"));
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "client-error");
            if (result instanceof Error) {
                expect((result as any).context.code).toBe(429);
                expect((result as any).context.headers["retry-after"]).toBe("60");
            }
        });
    });

    describe("Client error structure", () => {
        it("should contain all required error context properties", async () => {
            const customHeaders = {
                "content-type": "application/json",
                "x-request-id": "req-12345",
                "x-error-code": "VALIDATION_FAILED"
            };

            server.setResponse("POST", "/error-context", {
                statusCode: 400,
                headers: customHeaders,
                body: JSON.stringify({ error: "Detailed error information" })
            });
            
            const result = await gotcha(server.getUrl("/error-context"), {
                method: "POST",
                body: JSON.stringify({ invalid: "data" })
            });
            
            expect(result).toBeInstanceOf(Error);
            if (result instanceof Error) {
                const context = (result as any).context;
                
                expect(context.code).toBe(400);
                expect(context.headers).toEqual(expect.objectContaining(customHeaders));
                expect(context.body).toBeDefined();
                expect(context.trailers).toBeDefined();
                // context and opaque may be undefined in some cases
                expect(context.opaque).toBeDefined();
            }
        });

        it("should preserve response body with JSON error details", async () => {
            const errorBody = {
                error: "Validation Error",
                details: {
                    field1: "Field is required",
                    field2: "Invalid format"
                },
                timestamp: "2024-01-01T00:00:00Z"
            };
            
            server.setResponse("POST", "/json-error", {
                statusCode: 400,
                headers: { "content-type": "application/json" },
                body: JSON.stringify(errorBody)
            });
            
            const result = await gotcha(server.getUrl("/json-error"), {
                method: "POST",
                body: JSON.stringify({ invalid: "data" })
            });
            
            expect(result).toBeInstanceOf(Error);
            if (result instanceof Error) {
                const context = (result as any).context;
                expect(context.body).toBeDefined();
                
                const bodyJson = await context.body.json();
                expect(bodyJson).toEqual(errorBody);
            }
        });

        it("should preserve response body with HTML error pages", async () => {
            const htmlError = "<html><body><h1>404 - Page Not Found</h1><p>The requested resource could not be found.</p></body></html>";
            
            server.setResponse("GET", "/html-error", {
                statusCode: 404,
                headers: { "content-type": "text/html" },
                body: htmlError
            });
            
            const result = await gotcha(server.getUrl("/html-error"));
            
            expect(result).toBeInstanceOf(Error);
            if (result instanceof Error) {
                const context = (result as any).context;
                expect(context.body).toBeDefined();
                
                const bodyText = await context.body.text();
                expect(bodyText).toBe(htmlError);
            }
        });
    });

    describe("Edge cases", () => {
        it("should handle 400 (start of client error range)", async () => {
            server.setResponse("GET", "/start-client-error", {
                statusCode: 400,
                headers: { "content-type": "text/plain" },
                body: "Bad Request"
            });
            
            const result = await gotcha(server.getUrl("/start-client-error"));
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "client-error");
            if (result instanceof Error) {
                expect((result as any).context.code).toBe(400);
            }
        });

        it("should handle 499 (end of client error range)", async () => {
            server.setResponse("GET", "/end-client-error", {
                statusCode: 499,
                headers: { "content-type": "text/plain" },
                body: "Client Closed Request"
            });
            
            const result = await gotcha(server.getUrl("/end-client-error"));
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "client-error");
            if (result instanceof Error) {
                expect((result as any).context.code).toBe(499);
            }
        });

        it("should handle client errors with empty response body", async () => {
            server.setResponse("DELETE", "/empty-error", {
                statusCode: 404,
                headers: { "content-length": "0" },
                body: ""
            });
            
            const result = await gotcha(server.getUrl("/empty-error"), {
                method: "DELETE"
            });
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "client-error");
            if (result instanceof Error) {
                expect((result as any).context.code).toBe(404);
                const bodyText = await (result as any).context.body.text();
                expect(bodyText).toBe("");
            }
        });

        it("should handle client errors with non-JSON content types", async () => {
            server.setResponse("GET", "/xml-error", {
                statusCode: 400,
                headers: { "content-type": "application/xml" },
                body: "<?xml version=\"1.0\"?><error><message>Invalid request</message></error>"
            });
            
            const result = await gotcha(server.getUrl("/xml-error"));
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "client-error");
            if (result instanceof Error) {
                expect((result as any).context.code).toBe(400);
                expect((result as any).context.headers["content-type"]).toBe("application/xml");
            }
        });
    });

    describe("URL handling in client error messages", () => {
        it("should include correct URL in error message", async () => {
            server.setResponse("POST", "/api/users", {
                statusCode: 400,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ error: "Invalid user data" })
            });
            
            const testUrl = server.getUrl("/api/users");
            const result = await gotcha(testUrl, {
                method: "POST",
                body: JSON.stringify({ invalid: "data" })
            });
            
            expect(result).toBeInstanceOf(Error);
            if (result instanceof Error) {
                expect(result.message).toContain("client-based network error");
                expect(result.message).toContain(testUrl);
            }
        });

        it("should handle URLs with query parameters in error messages", async () => {
            server.setResponse("GET", "/search?invalid=query", {
                statusCode: 400,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ error: "Invalid search parameters" })
            });
            
            const result = await gotcha(server.getUrl("/search?invalid=query"));
            
            expect(result).toBeInstanceOf(Error);
            if (result instanceof Error) {
                expect(result.message).toContain("client-based network error");
                expect(result.message).toContain(server.getUrl("/search"));
            }
        });
    });
});
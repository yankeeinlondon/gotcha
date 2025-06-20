import { describe, it, expect, beforeEach } from "vitest";
import { gotcha } from "~/gotcha";
import { ServerError } from "~/errors";
import { MockHttpServer, TEST_RESPONSES } from "./test-utils";

describe("gotcha - Server Error Handling (500+)", () => {
    let server: MockHttpServer;

    beforeEach(() => {
        server = (globalThis as any).testServer as MockHttpServer;
    });

    describe("5xx status codes", () => {
        it("should return ServerError for 500 Internal Server Error", async () => {
            server.setResponse("GET", "/server-error", TEST_RESPONSES.SERVER_ERROR_500);
            
            const result = await gotcha(server.getUrl("/server-error"));
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "server-error");
            if (result instanceof Error) {
                expect(result.message).toContain("server-based network error");
                expect(result.message).toContain(server.getUrl("/server-error"));
                expect((result as any).context.code).toBe(500);
                expect((result as any).context.headers["content-type"]).toBe("application/json");
            }
        });

        it("should return ServerError for 501 Not Implemented", async () => {
            server.setResponse("PATCH", "/not-implemented", {
                statusCode: 501,
                headers: { 
                    "content-type": "application/json",
                    "allow": "GET, POST, PUT, DELETE"
                },
                body: JSON.stringify({ 
                    error: "Not Implemented", 
                    message: "PATCH method is not supported for this endpoint" 
                })
            });
            
            const result = await gotcha(server.getUrl("/not-implemented"), {
                method: "PATCH",
                body: JSON.stringify({ field: "value" })
            });
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "server-error");
            if (result instanceof Error) {
                expect((result as any).context.code).toBe(501);
                expect((result as any).context.headers.allow).toBe("GET, POST, PUT, DELETE");
            }
        });

        it("should return ServerError for 502 Bad Gateway", async () => {
            server.setResponse("GET", "/bad-gateway", {
                statusCode: 502,
                headers: { 
                    "content-type": "text/html",
                    "server": "nginx/1.18.0"
                },
                body: "<html><body><h1>502 Bad Gateway</h1><p>The server received an invalid response from the upstream server.</p></body></html>"
            });
            
            const result = await gotcha(server.getUrl("/bad-gateway"));
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "server-error");
            if (result instanceof Error) {
                expect((result as any).context.code).toBe(502);
                expect((result as any).context.headers.server).toBe("nginx/1.18.0");
            }
        });

        it("should return ServerError for 503 Service Unavailable", async () => {
            server.setResponse("POST", "/unavailable", TEST_RESPONSES.SERVER_ERROR_503);
            
            const result = await gotcha(server.getUrl("/unavailable"), {
                method: "POST",
                body: JSON.stringify({ data: "test" })
            });
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "server-error");
            if (result instanceof Error) {
                expect((result as any).context.code).toBe(503);
                expect((result as any).context.headers["retry-after"]).toBe("60");
            }
        });

        it("should return ServerError for 504 Gateway Timeout", async () => {
            server.setResponse("GET", "/gateway-timeout", {
                statusCode: 504,
                headers: { 
                    "content-type": "application/json",
                    "x-timeout-duration": "30s"
                },
                body: JSON.stringify({ 
                    error: "Gateway Timeout",
                    message: "The upstream server failed to respond within the timeout period",
                    timeout: "30s"
                })
            });
            
            const result = await gotcha(server.getUrl("/gateway-timeout"));
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "server-error");
            if (result instanceof Error) {
                expect((result as any).context.code).toBe(504);
                expect((result as any).context.headers["x-timeout-duration"]).toBe("30s");
            }
        });

        it("should return ServerError for 505 HTTP Version Not Supported", async () => {
            server.setResponse("GET", "/version-error", {
                statusCode: 505,
                headers: { 
                    "content-type": "text/plain",
                    "connection": "close"
                },
                body: "HTTP Version Not Supported"
            });
            
            const result = await gotcha(server.getUrl("/version-error"));
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "server-error");
            if (result instanceof Error) {
                expect((result as any).context.code).toBe(505);
            }
        });

        it("should return ServerError for 507 Insufficient Storage", async () => {
            server.setResponse("PUT", "/storage-full", {
                statusCode: 507,
                headers: { 
                    "content-type": "application/json",
                    "x-storage-used": "99.8%"
                },
                body: JSON.stringify({ 
                    error: "Insufficient Storage",
                    message: "Server storage is full",
                    storageUsed: "99.8%"
                })
            });
            
            const result = await gotcha(server.getUrl("/storage-full"), {
                method: "PUT",
                body: JSON.stringify({ large: "data payload" })
            });
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "server-error");
            if (result instanceof Error) {
                expect((result as any).context.code).toBe(507);
                expect((result as any).context.headers["x-storage-used"]).toBe("99.8%");
            }
        });

        it("should return ServerError for 511 Network Authentication Required", async () => {
            server.setResponse("GET", "/network-auth", {
                statusCode: 511,
                headers: { 
                    "content-type": "text/html",
                    "location": "https://auth.example.com/login"
                },
                body: "<html><body><h1>Network Authentication Required</h1></body></html>"
            });
            
            const result = await gotcha(server.getUrl("/network-auth"));
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "server-error");
            if (result instanceof Error) {
                expect((result as any).context.code).toBe(511);
                expect((result as any).context.headers.location).toBe("https://auth.example.com/login");
            }
        });
    });

    describe("Server error structure", () => {
        it("should contain all required error context properties", async () => {
            const customHeaders = {
                "content-type": "application/json",
                "x-error-id": "err-67890",
                "x-server-version": "2.1.0",
                "x-request-duration": "5432ms"
            };

            server.setResponse("POST", "/error-context", {
                statusCode: 500,
                headers: customHeaders,
                body: JSON.stringify({ 
                    error: "Internal Server Error",
                    errorId: "err-67890",
                    timestamp: "2024-01-01T00:00:00Z"
                })
            });
            
            const result = await gotcha(server.getUrl("/error-context"), {
                method: "POST",
                body: JSON.stringify({ action: "process" })
            });
            
            expect(result).toBeInstanceOf(Error);
            if (result instanceof Error) {
                const context = (result as any).context;
                
                expect(context.code).toBe(500);
                expect(context.headers).toEqual(expect.objectContaining(customHeaders));
                expect(context.body).toBeDefined();
                expect(context.trailers).toBeDefined();
                // context and opaque may be undefined in some cases
                expect(context.opaque).toBeDefined();
            }
        });

        it("should preserve response body with detailed error information", async () => {
            const errorBody = {
                error: "Database Connection Failed",
                details: {
                    database: "primary",
                    host: "db.example.com",
                    timeout: "30s",
                    lastAttempt: "2024-01-01T00:00:00Z"
                },
                requestId: "req-12345",
                retryAfter: 300
            };
            
            server.setResponse("GET", "/db-error", {
                statusCode: 500,
                headers: { 
                    "content-type": "application/json",
                    "retry-after": "300"
                },
                body: JSON.stringify(errorBody)
            });
            
            const result = await gotcha(server.getUrl("/db-error"));
            
            expect(result).toBeInstanceOf(Error);
            if (result instanceof Error) {
                const context = (result as any).context;
                expect(context.body).toBeDefined();
                
                const bodyJson = await context.body.json();
                expect(bodyJson).toEqual(errorBody);
            }
        });

        it("should preserve response body with plain text errors", async () => {
            const textError = "Internal Server Error: Unable to process request due to system maintenance.";
            
            server.setResponse("PUT", "/text-error", {
                statusCode: 500,
                headers: { "content-type": "text/plain" },
                body: textError
            });
            
            const result = await gotcha(server.getUrl("/text-error"), {
                method: "PUT",
                body: JSON.stringify({ update: "data" })
            });
            
            expect(result).toBeInstanceOf(Error);
            if (result instanceof Error) {
                const context = (result as any).context;
                expect(context.body).toBeDefined();
                
                const bodyText = await context.body.text();
                expect(bodyText).toBe(textError);
            }
        });
    });

    describe("Edge cases", () => {
        it("should handle 500 (start of server error range)", async () => {
            server.setResponse("GET", "/start-server-error", {
                statusCode: 500,
                headers: { "content-type": "text/plain" },
                body: "Internal Server Error"
            });
            
            const result = await gotcha(server.getUrl("/start-server-error"));
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "server-error");
            if (result instanceof Error) {
                expect((result as any).context.code).toBe(500);
            }
        });

        it("should handle high 5xx status codes", async () => {
            server.setResponse("GET", "/high-server-error", {
                statusCode: 599,
                headers: { "content-type": "text/plain" },
                body: "Custom Server Error"
            });
            
            const result = await gotcha(server.getUrl("/high-server-error"));
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "server-error");
            if (result instanceof Error) {
                expect((result as any).context.code).toBe(599);
            }
        });

        it("should handle server errors with empty response body", async () => {
            server.setResponse("DELETE", "/empty-server-error", {
                statusCode: 500,
                headers: { "content-length": "0" },
                body: ""
            });
            
            const result = await gotcha(server.getUrl("/empty-server-error"), {
                method: "DELETE"
            });
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "server-error");
            if (result instanceof Error) {
                expect((result as any).context.code).toBe(500);
                const bodyText = await (result as any).context.body.text();
                expect(bodyText).toBe("");
            }
        });

        it("should handle server errors with various content types", async () => {
            const xmlError = "<?xml version=\"1.0\"?><error><code>500</code><message>Server Error</message></error>";
            
            server.setResponse("GET", "/xml-server-error", {
                statusCode: 500,
                headers: { "content-type": "application/xml" },
                body: xmlError
            });
            
            const result = await gotcha(server.getUrl("/xml-server-error"));
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "server-error");
            if (result instanceof Error) {
                expect((result as any).context.code).toBe(500);
                expect((result as any).context.headers["content-type"]).toBe("application/xml");
                const bodyText = await (result as any).context.body.text();
                expect(bodyText).toBe(xmlError);
            }
        });

        it("should handle server errors with maintenance headers", async () => {
            server.setResponse("GET", "/maintenance", {
                statusCode: 503,
                headers: { 
                    "content-type": "text/html",
                    "retry-after": "3600",
                    "x-maintenance-window": "2024-01-01T02:00:00Z to 2024-01-01T04:00:00Z"
                },
                body: "<html><body><h1>Service Under Maintenance</h1></body></html>"
            });
            
            const result = await gotcha(server.getUrl("/maintenance"));
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "server-error");
            if (result instanceof Error) {
                expect((result as any).context.code).toBe(503);
                expect((result as any).context.headers["retry-after"]).toBe("3600");
                expect((result as any).context.headers["x-maintenance-window"]).toBe("2024-01-01T02:00:00Z to 2024-01-01T04:00:00Z");
            }
        });
    });

    describe("URL handling in server error messages", () => {
        it("should include correct URL in error message", async () => {
            server.setResponse("POST", "/api/process", {
                statusCode: 500,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ error: "Processing failed" })
            });
            
            const testUrl = server.getUrl("/api/process");
            const result = await gotcha(testUrl, {
                method: "POST",
                body: JSON.stringify({ data: "process" })
            });
            
            expect(result).toBeInstanceOf(Error);
            if (result instanceof Error) {
                expect(result.message).toContain("server-based network error");
                expect(result.message).toContain(testUrl);
            }
        });

        it("should handle complex URLs in error messages", async () => {
            server.setResponse("GET", "/api/complex/path?param1=value1&param2=value2", {
                statusCode: 500,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ error: "Complex endpoint failed" })
            });
            
            const complexUrl = server.getUrl("/api/complex/path?param1=value1&param2=value2");
            const result = await gotcha(complexUrl);
            
            expect(result).toBeInstanceOf(Error);
            if (result instanceof Error) {
                expect(result.message).toContain("server-based network error");
                expect(result.message).toContain(complexUrl);
            }
        });
    });
});
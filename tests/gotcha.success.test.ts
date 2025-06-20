import { describe, it, expect, beforeEach } from "vitest";
import { gotcha } from "~/gotcha";
import { MockHttpServer, TEST_RESPONSES } from "./test-utils";

describe("gotcha - Successful Requests (Status < 300)", () => {
    let server: MockHttpServer;

    beforeEach(() => {
        server = (globalThis as any).testServer as MockHttpServer;
    });

    describe("GET requests", () => {
        it("should return NetworkResponse for 200 status", async () => {
            server.setResponse("GET", "/success", TEST_RESPONSES.SUCCESS);
            
            const result = await gotcha(server.getUrl("/success"));
            
            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(200);
                expect(result.headers["content-type"]).toBe("application/json");
                const body = await result.body.text();
                expect(body).toBe('{"success":true,"data":"test"}');
            }
        });

        it("should handle 201 Created responses", async () => {
            server.setResponse("GET", "/created", {
                statusCode: 201,
                headers: { "content-type": "application/json", "location": "/resource/123" },
                body: JSON.stringify({ id: 123, created: true })
            });

            const result = await gotcha(server.getUrl("/created"));
            
            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(201);
                expect(result.headers.location).toBe("/resource/123");
            }
        });

        it("should handle 204 No Content responses", async () => {
            server.setResponse("GET", "/no-content", {
                statusCode: 204,
                headers: {},
                body: ""
            });

            const result = await gotcha(server.getUrl("/no-content"));
            
            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(204);
                const body = await result.body.text();
                expect(body).toBe("");
            }
        });
    });

    describe("POST requests", () => {
        it("should handle POST with JSON payload", async () => {
            server.setResponse("POST", "/api/users", {
                statusCode: 201,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ id: 1, name: "John Doe", email: "john@example.com" })
            });

            const payload = { name: "John Doe", email: "john@example.com" };
            const result = await gotcha(server.getUrl("/api/users"), {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(payload)
            });

            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(201);
                const responseBody = await result.body.json();
                expect(responseBody.id).toBe(1);
                expect(responseBody.name).toBe("John Doe");
            }
        });

        it("should handle POST with form data", async () => {
            server.setResponse("POST", "/api/form", {
                statusCode: 200,
                headers: { "content-type": "text/plain" },
                body: "Form submitted successfully"
            });

            const result = await gotcha(server.getUrl("/api/form"), {
                method: "POST",
                headers: { "content-type": "application/x-www-form-urlencoded" },
                body: "name=John&email=john@example.com"
            });

            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(200);
                const body = await result.body.text();
                expect(body).toBe("Form submitted successfully");
            }
        });
    });

    describe("Custom headers", () => {
        it("should pass custom headers correctly", async () => {
            server.setResponse("GET", "/with-headers", {
                statusCode: 200,
                headers: { 
                    "content-type": "application/json",
                    "x-custom-header": "custom-value"
                },
                body: JSON.stringify({ message: "Headers received" })
            });

            const result = await gotcha(server.getUrl("/with-headers"), {
                headers: {
                    "Authorization": "Bearer token123",
                    "X-Client-Version": "1.0.0"
                }
            });

            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(200);
                expect(result.headers["x-custom-header"]).toBe("custom-value");
            }
        });

        it("should handle multiple custom headers", async () => {
            server.setResponse("GET", "/multi-headers", {
                statusCode: 200,
                headers: { 
                    "content-type": "application/json",
                    "cache-control": "no-cache",
                    "x-rate-limit": "100"
                },
                body: JSON.stringify({ data: "success" })
            });

            const result = await gotcha(server.getUrl("/multi-headers"), {
                headers: {
                    "Accept": "application/json",
                    "User-Agent": "gotcha/1.0.0",
                    "X-Request-ID": "req-123"
                }
            });

            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(200);
                expect(result.headers["cache-control"]).toBe("no-cache");
                expect(result.headers["x-rate-limit"]).toBe("100");
            }
        });
    });

    describe("Query parameters", () => {
        it("should handle URLs with query parameters", async () => {
            server.setResponse("GET", "/search?q=test&limit=10", {
                statusCode: 200,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ query: "test", limit: 10, results: [] })
            });

            const result = await gotcha(server.getUrl("/search?q=test&limit=10"));

            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(200);
                const body = await result.body.json();
                expect(body.query).toBe("test");
                expect(body.limit).toBe(10);
            }
        });

        it("should handle encoded query parameters", async () => {
            const encodedPath = "/search?q=" + encodeURIComponent("hello world") + "&type=exact";
            server.setResponse("GET", encodedPath, {
                statusCode: 200,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ query: "hello world", type: "exact" })
            });

            const result = await gotcha(server.getUrl(encodedPath));

            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(200);
            }
        });
    });

    describe("Different HTTP methods", () => {
        it("should handle PUT requests", async () => {
            server.setResponse("PUT", "/api/resource/123", {
                statusCode: 200,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ id: 123, updated: true })
            });

            const result = await gotcha(server.getUrl("/api/resource/123"), {
                method: "PUT",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ name: "Updated Name" })
            });

            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(200);
                const body = await result.body.json();
                expect(body.updated).toBe(true);
            }
        });

        it("should handle DELETE requests", async () => {
            server.setResponse("DELETE", "/api/resource/123", {
                statusCode: 204,
                headers: {},
                body: ""
            });

            const result = await gotcha(server.getUrl("/api/resource/123"), {
                method: "DELETE"
            });

            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(204);
            }
        });

        it("should handle PATCH requests", async () => {
            server.setResponse("PATCH", "/api/resource/123", {
                statusCode: 200,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ id: 123, patched: true })
            });

            const result = await gotcha(server.getUrl("/api/resource/123"), {
                method: "PATCH",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ name: "Patched Name" })
            });

            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(200);
                const body = await result.body.json();
                expect(body.patched).toBe(true);
            }
        });
    });
});
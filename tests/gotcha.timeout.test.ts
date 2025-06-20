import { describe, it, expect, beforeEach } from "vitest";
import { gotcha } from "~/gotcha";
import { MockHttpServer } from "./test-utils";

describe("gotcha - Timeout Functionality", () => {
    let server: MockHttpServer;

    beforeEach(() => {
        server = (globalThis as any).testServer as MockHttpServer;
    });

    describe("Basic timeout functionality", () => {
        it("should timeout after specified duration", async () => {
            server.setResponse("GET", "/slow", {
                statusCode: 200,
                headers: { "content-type": "text/plain" },
                body: "Eventually successful",
                delay: 200 // 200ms delay
            });

            const startTime = Date.now();
            const result = await gotcha(server.getUrl("/slow"), {
                timeout: 100 // 100ms timeout (should timeout before response)
            });

            const elapsed = Date.now() - startTime;
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "timeout");
            expect(elapsed).toBeLessThan(200); // Should timeout quickly (allowing for CI timing variance)
            
            if (result instanceof Error) {
                expect(result.message).toContain("Request timed out");
                expect(result.message).toContain("100ms");
                expect((result as any).context.timeout).toBe(100);
                expect((result as any).context.url).toBe(server.getUrl("/slow"));
                expect((result as any).context.method).toBe("GET");
                expect((result as any).context.elapsedTime).toBeGreaterThan(90);
            }
        });

        it("should NOT timeout when request completes before timeout", async () => {
            server.setResponse("GET", "/fast", {
                statusCode: 200,
                headers: { "content-type": "text/plain" },
                body: "Fast response",
                delay: 50 // 50ms delay
            });

            const result = await gotcha(server.getUrl("/fast"), {
                timeout: 200 // 200ms timeout (should complete before timeout)
            });

            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(200);
                const body = await result.body.text();
                expect(body).toBe("Fast response");
            }
        });

        it("should work without timeout specified (backward compatibility)", async () => {
            server.setResponse("GET", "/no-timeout", {
                statusCode: 200,
                headers: { "content-type": "text/plain" },
                body: "No timeout specified"
            });

            const result = await gotcha(server.getUrl("/no-timeout"));

            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(200);
            }
        });

        it("should work with timeout = undefined", async () => {
            server.setResponse("GET", "/undefined-timeout", {
                statusCode: 200,
                headers: { "content-type": "text/plain" },
                body: "Undefined timeout"
            });

            const result = await gotcha(server.getUrl("/undefined-timeout"), {
                timeout: undefined
            });

            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(200);
            }
        });
    });

    describe("Timeout with different HTTP methods", () => {
        it("should timeout POST requests", async () => {
            server.setResponse("POST", "/slow-post", {
                statusCode: 201,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ created: true }),
                delay: 200
            });

            const result = await gotcha(server.getUrl("/slow-post"), {
                method: "POST",
                timeout: 100,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ data: "test" })
            });

            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "timeout");
            if (result instanceof Error) {
                expect((result as any).context.method).toBe("POST");
            }
        });

        it("should timeout PUT requests", async () => {
            server.setResponse("PUT", "/slow-put", {
                statusCode: 200,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ updated: true }),
                delay: 150
            });

            const result = await gotcha(server.getUrl("/slow-put"), {
                method: "PUT",
                timeout: 75,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ update: "data" })
            });

            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "timeout");
            if (result instanceof Error) {
                expect((result as any).context.method).toBe("PUT");
            }
        });

        it("should timeout DELETE requests", async () => {
            server.setResponse("DELETE", "/slow-delete", {
                statusCode: 204,
                headers: {},
                body: "",
                delay: 200
            });

            const result = await gotcha(server.getUrl("/slow-delete"), {
                method: "DELETE",
                timeout: 100
            });

            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "timeout");
            if (result instanceof Error) {
                expect((result as any).context.method).toBe("DELETE");
            }
        });
    });

    describe("Timeout with different response scenarios", () => {
        it("should timeout even on redirects", async () => {
            server.setResponse("GET", "/slow-redirect", {
                statusCode: 301,
                headers: { "location": "https://example.com/new" },
                body: "Moved",
                delay: 200
            });

            const result = await gotcha(server.getUrl("/slow-redirect"), {
                timeout: 100
            });

            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "timeout");
        });

        it("should timeout even on client errors", async () => {
            server.setResponse("GET", "/slow-error", {
                statusCode: 400,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ error: "Bad Request" }),
                delay: 200
            });

            const result = await gotcha(server.getUrl("/slow-error"), {
                timeout: 100
            });

            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "timeout");
        });

        it("should timeout even on server errors", async () => {
            server.setResponse("GET", "/slow-server-error", {
                statusCode: 500,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ error: "Internal Server Error" }),
                delay: 200
            });

            const result = await gotcha(server.getUrl("/slow-server-error"), {
                timeout: 100
            });

            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "timeout");
        });
    });

    describe("Various timeout durations", () => {
        it("should handle very short timeouts (1ms)", async () => {
            server.setResponse("GET", "/any-response", {
                statusCode: 200,
                headers: { "content-type": "text/plain" },
                body: "Response",
                delay: 50
            });

            const result = await gotcha(server.getUrl("/any-response"), {
                timeout: 1
            });

            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "timeout");
        });

        it("should handle medium timeouts (1000ms)", async () => {
            server.setResponse("GET", "/medium-delay", {
                statusCode: 200,
                headers: { "content-type": "text/plain" },
                body: "Response",
                delay: 1200
            });

            const result = await gotcha(server.getUrl("/medium-delay"), {
                timeout: 1000
            });

            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "timeout");
        });

        it("should handle zero timeout (immediate timeout)", async () => {
            server.setResponse("GET", "/immediate", {
                statusCode: 200,
                headers: { "content-type": "text/plain" },
                body: "Response"
            });

            const result = await gotcha(server.getUrl("/immediate"), {
                timeout: 0
            });

            // Zero timeout should not create a timeout (since timeout > 0 check)
            expect(result).not.toBeInstanceOf(Error);
        });

        it("should handle negative timeout (no timeout applied)", async () => {
            server.setResponse("GET", "/negative", {
                statusCode: 200,
                headers: { "content-type": "text/plain" },
                body: "Response"
            });

            const result = await gotcha(server.getUrl("/negative"), {
                timeout: -100
            });

            // Negative timeout should not create a timeout (since timeout > 0 check)
            expect(result).not.toBeInstanceOf(Error);
        });
    });

    describe("Timeout with URL objects", () => {
        it("should timeout with URL objects", async () => {
            server.setResponse("GET", "/url-object-timeout", {
                statusCode: 200,
                headers: { "content-type": "text/plain" },
                body: "Response",
                delay: 200
            });

            const urlObject = new URL(server.getUrl("/url-object-timeout"));
            const result = await gotcha(urlObject, {
                timeout: 100
            });

            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "timeout");
            if (result instanceof Error) {
                expect((result as any).context.url).toContain("/url-object-timeout");
            }
        });

        it("should timeout with URL objects with search parameters", async () => {
            server.setResponse("GET", "/url-params?test=value", {
                statusCode: 200,
                headers: { "content-type": "text/plain" },
                body: "Response",
                delay: 200
            });

            const urlObject = new URL(server.getUrl("/url-params"));
            urlObject.searchParams.set("test", "value");
            
            const result = await gotcha(urlObject, {
                timeout: 100
            });

            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "timeout");
            if (result instanceof Error) {
                expect((result as any).context.url).toContain("test=value");
            }
        });
    });

    describe("Concurrent requests with timeouts", () => {
        it("should handle multiple concurrent requests with different timeouts", async () => {
            server.setResponse("GET", "/concurrent-1", {
                statusCode: 200,
                headers: { "content-type": "text/plain" },
                body: "Fast response",
                delay: 50
            });

            server.setResponse("GET", "/concurrent-2", {
                statusCode: 200,
                headers: { "content-type": "text/plain" },
                body: "Slow response",
                delay: 200
            });

            const [result1, result2] = await Promise.all([
                gotcha(server.getUrl("/concurrent-1"), { timeout: 100 }), // Should succeed
                gotcha(server.getUrl("/concurrent-2"), { timeout: 100 })  // Should timeout
            ]);

            expect(result1).not.toBeInstanceOf(Error);
            expect(result2).toBeInstanceOf(Error);
            expect(result2).toHaveProperty("kind", "timeout");
        });

        it("should not let one timeout affect another request", async () => {
            server.setResponse("GET", "/independent-1", {
                statusCode: 200,
                headers: { "content-type": "text/plain" },
                body: "Response 1",
                delay: 150
            });

            server.setResponse("GET", "/independent-2", {
                statusCode: 200,
                headers: { "content-type": "text/plain" },
                body: "Response 2",
                delay: 50
            });

            // Start first request that will timeout
            const promise1 = gotcha(server.getUrl("/independent-1"), { timeout: 100 });
            
            // Start second request shortly after that should succeed
            await new Promise(resolve => setTimeout(resolve, 20));
            const promise2 = gotcha(server.getUrl("/independent-2"), { timeout: 100 });

            const [result1, result2] = await Promise.all([promise1, promise2]);

            expect(result1).toBeInstanceOf(Error);
            expect(result1).toHaveProperty("kind", "timeout");
            expect(result2).not.toBeInstanceOf(Error);
            if (!(result2 instanceof Error)) {
                expect(result2.statusCode).toBe(200);
            }
        });
    });

    describe("Timeout error structure", () => {
        it("should include all required context in timeout errors", async () => {
            server.setResponse("POST", "/timeout-context", {
                statusCode: 200,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ data: "response" }),
                delay: 200
            });

            const result = await gotcha(server.getUrl("/timeout-context"), {
                method: "POST",
                timeout: 100,
                headers: { "Authorization": "Bearer token" },
                body: JSON.stringify({ test: "data" })
            });

            expect(result).toBeInstanceOf(Error);
            if (result instanceof Error) {
                const context = (result as any).context;
                
                expect(context.timeout).toBe(100);
                expect(context.url).toBe(server.getUrl("/timeout-context"));
                expect(context.method).toBe("POST");
                expect(context.elapsedTime).toBeGreaterThan(90);
                expect(context.elapsedTime).toBeLessThan(200); // Allow for CI timing variance
                
                expect(result.message).toContain("Request timed out");
                expect(result.message).toContain("100ms");
                expect(result.message).toContain(server.getUrl("/timeout-context"));
            }
        });

        it("should have consistent error structure with other error types", async () => {
            server.setResponse("GET", "/timeout-structure", {
                statusCode: 200,
                headers: { "content-type": "text/plain" },
                body: "Response",
                delay: 200
            });

            const result = await gotcha(server.getUrl("/timeout-structure"), {
                timeout: 100
            });

            expect(result).toBeInstanceOf(Error);
            if (result instanceof Error) {
                // Should have the same basic structure as other gotcha errors
                expect(result).toHaveProperty("kind", "timeout");
                expect(result).toHaveProperty("message");
                expect((result as any)).toHaveProperty("context");
                expect((result as any).context).toBeTypeOf("object");
            }
        });
    });
});
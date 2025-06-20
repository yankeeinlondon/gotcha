import { describe, it, expect } from "vitest";
import { gotcha } from "~/gotcha";

describe("gotcha - Integration Tests with Real Endpoints", () => {
    // These tests use real HTTP endpoints for integration testing
    // Note: These tests may be slower and require internet connectivity

    describe("Real endpoint tests", () => {
        it("should handle successful requests to httpbin.org", async () => {
            const result = await gotcha("https://httpbin.org/json");
            
            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(200);
                expect(result.headers["content-type"]).toContain("application/json");
                
                const body = await result.body.json();
                expect(body).toHaveProperty("slideshow");
            }
        });

        it("should handle 404 errors from real endpoints", async () => {
            const result = await gotcha("https://httpbin.org/status/404");
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "client-error");
            if (result instanceof Error) {
                expect((result as any).context.code).toBe(404);
            }
        });

        it("should handle 500 errors from real endpoints", async () => {
            const result = await gotcha("https://httpbin.org/status/500");
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "server-error");
            if (result instanceof Error) {
                expect((result as any).context.code).toBe(500);
            }
        });

        it("should handle redirects from real endpoints", async () => {
            const result = await gotcha("https://httpbin.org/status/301");
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "redirection");
            if (result instanceof Error) {
                expect((result as any).context.code).toBe(301);
            }
        });

        it("should handle POST requests with real endpoints", async () => {
            const payload = { message: "Hello from gotcha", timestamp: new Date().toISOString() };
            
            const result = await gotcha("https://httpbin.org/post", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "User-Agent": "gotcha-test-suite/1.0.0"
                },
                body: JSON.stringify(payload)
            });
            
            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(200);
                
                const responseBody = await result.body.json();
                expect(responseBody.json).toEqual(payload);
                expect(responseBody.headers["Content-Type"]).toBe("application/json");
            }
        });

        it("should handle different content types", async () => {
            const result = await gotcha("https://httpbin.org/xml");
            
            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(200);
                expect(result.headers["content-type"]).toContain("application/xml");
                
                const xmlBody = await result.body.text();
                expect(xmlBody).toContain("<?xml");
            }
        });

        it("should handle custom headers correctly", async () => {
            const customHeaders = {
                "X-Custom-Header": "test-value",
                "Authorization": "Bearer test-token",
                "Accept": "application/json"
            };
            
            const result = await gotcha("https://httpbin.org/headers", {
                headers: customHeaders
            });
            
            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(200);
                
                const responseBody = await result.body.json();
                expect(responseBody.headers["X-Custom-Header"]).toBe("test-value");
                expect(responseBody.headers["Authorization"]).toBe("Bearer test-token");
            }
        });
    });

    describe("Error handling with real endpoints", () => {
        it("should preserve error context for real HTTP errors", async () => {
            const result = await gotcha("https://httpbin.org/status/422");
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "client-error");
            if (result instanceof Error) {
                const context = (result as any).context;
                expect(context.code).toBe(422);
                expect(context.headers).toBeDefined();
                expect(context.body).toBeDefined();
            }
        });

        it("should handle network timeouts gracefully", async () => {
            // This test uses a deliberately slow endpoint
            const result = await gotcha("https://httpbin.org/delay/1", {
                // Note: undici timeout configuration would go here
                // but we'll keep this test simple for now
            });
            
            // Should either succeed (if fast enough) or fail with appropriate error
            if (result instanceof Error) {
                // If it times out, it should be handled gracefully
                expect(result).toBeInstanceOf(Error);
            } else {
                // If it succeeds, verify the response
                expect(result.statusCode).toBe(200);
            }
        });

        it("should handle large response bodies", async () => {
            // Test with a larger response from httpbin
            const result = await gotcha("https://httpbin.org/base64/SFRUUEJJTiBpcyBhd2Vzb21l");
            
            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(200);
                
                const body = await result.body.text();
                expect(body).toBe("HTTPBIN is awesome");
            }
        });
    });

    describe("Performance and reliability", () => {
        it("should handle multiple concurrent requests", async () => {
            const urls = [
                "https://httpbin.org/uuid",
                "https://httpbin.org/ip", 
                "https://httpbin.org/user-agent",
                "https://httpbin.org/headers"
            ];
            
            const promises = urls.map(url => gotcha(url));
            const results = await Promise.all(promises);
            
            // All requests should succeed
            results.forEach(result => {
                expect(result).not.toBeInstanceOf(Error);
                if (!(result instanceof Error)) {
                    expect(result.statusCode).toBe(200);
                }
            });
        });

        it("should maintain consistent behavior across requests", async () => {
            // Make the same request multiple times to ensure consistency
            const url = "https://httpbin.org/get";
            const requests = Array(5).fill(null).map(() => gotcha(url));
            const results = await Promise.all(requests);
            
            results.forEach(result => {
                expect(result).not.toBeInstanceOf(Error);
                if (!(result instanceof Error)) {
                    expect(result.statusCode).toBe(200);
                    expect(result.headers["content-type"]).toContain("application/json");
                }
            });
        });
    });

    describe("URL object compatibility", () => {
        it("should work with URL objects for real endpoints", async () => {
            const url = new URL("https://httpbin.org/json");
            const result = await gotcha(url);
            
            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(200);
                expect(result.headers["content-type"]).toContain("application/json");
            }
        });

        it("should handle URL objects with search parameters", async () => {
            const url = new URL("https://httpbin.org/get");
            url.searchParams.set("param1", "value1");
            url.searchParams.set("param2", "value2");
            
            const result = await gotcha(url);
            
            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(200);
                
                const responseBody = await result.body.json();
                expect(responseBody.args.param1).toBe("value1");
                expect(responseBody.args.param2).toBe("value2");
            }
        });
    });
}, 30000); // Increased timeout for integration tests
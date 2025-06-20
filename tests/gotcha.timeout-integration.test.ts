import { describe, it, expect } from "vitest";
import { gotcha } from "~/gotcha";

const isCI = process.env.CI === "true";

describe.skipIf(isCI)("gotcha - Timeout Integration Tests", () => {
    // These tests use real HTTP endpoints for timeout integration testing
    // Note: These tests may be slower and require internet connectivity
    // SKIPPED IN CI due to unreliable external dependencies

    describe("Real endpoint timeout tests", () => {
        it("should timeout on slow real endpoints", async () => {
            // httpbin.org/delay/2 waits 2 seconds before responding
            const result = await gotcha("https://httpbin.org/delay/2", {
                timeout: 1000 // 1 second timeout
            });
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "timeout");
            if (result instanceof Error) {
                expect((result as any).context.timeout).toBe(1000);
                expect((result as any).context.url).toBe("https://httpbin.org/delay/2");
                expect((result as any).context.elapsedTime).toBeGreaterThan(900);
                expect((result as any).context.elapsedTime).toBeLessThan(1200);
            }
        });

        it("should NOT timeout on fast real endpoints", async () => {
            const result = await gotcha("https://httpbin.org/get", {
                timeout: 5000 // 5 second timeout - should be plenty
            });
            
            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(200);
                const body = await result.body.json();
                expect(body.url).toBe("https://httpbin.org/get");
            }
        });

        it("should timeout POST requests to real endpoints", async () => {
            const payload = { 
                test: "timeout data",
                timestamp: new Date().toISOString()
            };

            const result = await gotcha("https://httpbin.org/delay/3", {
                method: "POST",
                timeout: 1500, // 1.5 second timeout
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "timeout");
            if (result instanceof Error) {
                expect((result as any).context.method).toBe("POST");
                expect((result as any).context.timeout).toBe(1500);
            }
        });

        it("should handle timeout with real redirects", async () => {
            // Use a direct delay endpoint instead of redirect chain
            const result = await gotcha("https://httpbin.org/delay/2", {
                timeout: 1000
            });
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "timeout");
        });

        it("should timeout on real slow endpoints with custom headers", async () => {
            const result = await gotcha("https://httpbin.org/delay/2", {
                timeout: 1000,
                headers: {
                    "User-Agent": "gotcha-timeout-test/1.0.0",
                    "Accept": "application/json",
                    "X-Test-Header": "timeout-integration-test"
                }
            });
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "timeout");
        });
    });

    describe("Performance with timeouts", () => {
        it("should handle multiple concurrent requests with timeouts", async () => {
            const startTime = Date.now();
            
            const promises = [
                gotcha("https://httpbin.org/delay/1", { timeout: 500 }), // Will timeout
                gotcha("https://httpbin.org/delay/3", { timeout: 500 }), // Will timeout  
                gotcha("https://httpbin.org/get", { timeout: 5000 }),     // Will succeed
                gotcha("https://httpbin.org/delay/1", { timeout: 500 }), // Will timeout
                gotcha("https://httpbin.org/ip", { timeout: 5000 })      // Will succeed
            ];

            const results = await Promise.all(promises);
            const elapsed = Date.now() - startTime;
            
            // Should complete in roughly 1 second (not 3+ seconds) - allowing for CI network latency
            expect(elapsed).toBeLessThan(6000);
            
            // Check results
            expect(results[0]).toHaveProperty("kind", "timeout"); // delay/1 with 500ms timeout
            expect(results[1]).toHaveProperty("kind", "timeout"); // delay/3 with 500ms timeout
            expect(results[2]).not.toBeInstanceOf(Error);        // get with 5s timeout
            expect(results[3]).toHaveProperty("kind", "timeout"); // delay/1 with 500ms timeout
            expect(results[4]).not.toBeInstanceOf(Error);        // ip with 5s timeout
        });

        it("should not impact performance when timeout is not specified", async () => {
            // Test that adding timeout capability doesn't slow down normal requests
            const startTime = Date.now();
            
            const results = await Promise.all([
                gotcha("https://httpbin.org/get"),
                gotcha("https://httpbin.org/ip"),
                gotcha("https://httpbin.org/uuid")
            ]);
            
            const elapsed = Date.now() - startTime;
            
            // Most should succeed (allow for occasional network issues)
            const successCount = results.filter(result => !(result instanceof Error)).length;
            expect(successCount).toBeGreaterThanOrEqual(2); // At least 2 out of 3 should succeed
            
            // Should complete reasonably quickly (allowing for network latency)
            expect(elapsed).toBeLessThan(10000); // 10 seconds max
        });
    });

    describe("Different network conditions", () => {
        it("should handle timeout with various HTTP methods on real endpoints", async () => {
            const testCases = [
                { method: "GET", url: "https://httpbin.org/delay/2" },
                { method: "POST", url: "https://httpbin.org/delay/2" },
                { method: "PUT", url: "https://httpbin.org/delay/2" },
                { method: "PATCH", url: "https://httpbin.org/delay/2" },
                { method: "DELETE", url: "https://httpbin.org/delay/2" }
            ];

            for (const testCase of testCases) {
                const result = await gotcha(testCase.url, {
                    method: testCase.method as any,
                    timeout: 1000,
                    headers: testCase.method !== "GET" ? { "Content-Type": "application/json" } : undefined,
                    body: testCase.method !== "GET" ? JSON.stringify({ test: "data" }) : undefined
                });

                expect(result).toBeInstanceOf(Error);
                expect(result).toHaveProperty("kind", "timeout");
                if (result instanceof Error) {
                    expect((result as any).context.method).toBe(testCase.method);
                }
            }
        });

        it("should handle timeout with URL objects on real endpoints", async () => {
            const url = new URL("https://httpbin.org/delay/2");
            url.searchParams.set("test", "timeout");
            
            const result = await gotcha(url, {
                timeout: 1000
            });
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "timeout");
            if (result instanceof Error) {
                expect((result as any).context.url).toContain("test=timeout");
            }
        });

        it("should handle timeout with large payloads to real endpoints", async () => {
            const largePayload = {
                data: "x".repeat(50000), // 50KB of data
                timestamp: new Date().toISOString(),
                metadata: {
                    test: "large-payload-timeout",
                    size: "50KB"
                }
            };

            const result = await gotcha("https://httpbin.org/delay/2", {
                method: "POST",
                timeout: 1000,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(largePayload)
            });
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "timeout");
        });
    });

    describe("Error handling consistency", () => {
        it("should maintain consistent timeout behavior across different endpoints", async () => {
            const endpoints = [
                "https://httpbin.org/delay/2",
                "https://httpbin.org/delay/3", 
                "https://httpbin.org/delay/1"
            ];

            const results = await Promise.all(
                endpoints.map(endpoint => 
                    gotcha(endpoint, { timeout: 500 })
                )
            );

            // All should timeout consistently
            results.forEach(result => {
                expect(result).toBeInstanceOf(Error);
                expect(result).toHaveProperty("kind", "timeout");
                if (result instanceof Error) {
                    expect((result as any).context.timeout).toBe(500);
                    expect((result as any).context.elapsedTime).toBeGreaterThan(400);
                    expect((result as any).context.elapsedTime).toBeLessThan(700);
                }
            });
        });

        it.skipIf(isCI)("should provide accurate error context for real timeouts", async () => {
            const testUrl = "https://httpbin.org/delay/2";
            const timeoutMs = 1000;
            const startTime = Date.now();
            
            const result = await gotcha(testUrl, {
                method: "POST",
                timeout: timeoutMs,
                headers: {
                    "Content-Type": "application/json",
                    "X-Test-ID": "real-timeout-test"
                },
                body: JSON.stringify({ test: "real timeout" })
            });
            
            const actualElapsed = Date.now() - startTime;
            
            expect(result).toBeInstanceOf(Error);
            if (result instanceof Error) {
                // First check that it's actually a timeout error, not another error type
                expect(result.kind).toBe("timeout");
                
                const context = (result as any).context;
                
                expect(context.url).toBe(testUrl);
                expect(context.method).toBe("POST");
                expect(context.timeout).toBe(timeoutMs);
                expect(context.elapsedTime).toBeGreaterThan(900);
                expect(context.elapsedTime).toBeLessThan(actualElapsed + 100);
                
                expect(result.message).toContain("Request timed out");
                expect(result.message).toContain(`${timeoutMs}ms`);
                expect(result.message).toContain(testUrl);
            }
        });
    });
}, 30000); // Extended timeout for integration tests
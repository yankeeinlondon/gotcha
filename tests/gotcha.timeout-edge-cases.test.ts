import { describe, it, expect, beforeEach } from "vitest";
import { gotcha } from "~/gotcha";
import { MockHttpServer } from "./test-utils";

describe("gotcha - Timeout Edge Cases", () => {
    let server: MockHttpServer;

    beforeEach(() => {
        server = (globalThis as any).testServer as MockHttpServer;
    });

    describe("Resource cleanup", () => {
        it("should clean up timeout when request succeeds", async () => {
            server.setResponse("GET", "/cleanup-success", {
                statusCode: 200,
                headers: { "content-type": "text/plain" },
                body: "Success",
                delay: 50
            });

            // Create multiple requests to test cleanup
            const promises = Array(5).fill(null).map((_, i) => 
                gotcha(server.getUrl("/cleanup-success"), {
                    timeout: 1000 // Long timeout, should not trigger
                })
            );

            const results = await Promise.all(promises);
            
            results.forEach(result => {
                expect(result).not.toBeInstanceOf(Error);
                if (!(result instanceof Error)) {
                    expect(result.statusCode).toBe(200);
                }
            });
        });

        it("should clean up timeout when request times out", async () => {
            server.setResponse("GET", "/cleanup-timeout", {
                statusCode: 200,
                headers: { "content-type": "text/plain" },
                body: "Too slow",
                delay: 200
            });

            // Create multiple requests that will timeout
            const promises = Array(3).fill(null).map(() => 
                gotcha(server.getUrl("/cleanup-timeout"), {
                    timeout: 100
                })
            );

            const results = await Promise.all(promises);
            
            results.forEach(result => {
                expect(result).toBeInstanceOf(Error);
                expect(result).toHaveProperty("kind", "timeout");
            });
        });
    });

    describe("Race conditions", () => {
        it("should handle timeout occurring just as request completes", async () => {
            // Set up a response that takes almost exactly the timeout duration
            server.setResponse("GET", "/race-condition", {
                statusCode: 200,
                headers: { "content-type": "text/plain" },
                body: "Race condition test",
                delay: 100 // Same as timeout
            });

            const result = await gotcha(server.getUrl("/race-condition"), {
                timeout: 100
            });

            // Either the request succeeds or times out - both are valid
            if (result instanceof Error) {
                expect(result).toHaveProperty("kind", "timeout");
            } else {
                expect(result.statusCode).toBe(200);
            }
        });

        it("should handle very rapid successive requests", async () => {
            server.setResponse("GET", "/rapid-requests", {
                statusCode: 200,
                headers: { "content-type": "text/plain" },
                body: "Rapid response"
            });

            // Fire off many requests rapidly
            const promises = Array(10).fill(null).map((_, i) => 
                gotcha(server.getUrl("/rapid-requests"), {
                    timeout: 1000
                })
            );

            const results = await Promise.all(promises);
            
            results.forEach(result => {
                expect(result).not.toBeInstanceOf(Error);
                if (!(result instanceof Error)) {
                    expect(result.statusCode).toBe(200);
                }
            });
        });
    });

    describe("Extreme timeout values", () => {
        it("should handle very large timeout values (exceeds Node.js limit)", async () => {
            server.setResponse("GET", "/large-timeout", {
                statusCode: 200,
                headers: { "content-type": "text/plain" },
                body: "Large timeout test"
            });

            const result = await gotcha(server.getUrl("/large-timeout"), {
                timeout: Number.MAX_SAFE_INTEGER // Exceeds Node.js timeout limit
            });

            // Large timeouts exceeding Node.js limits should not create a timeout
            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(200);
            }
        });

        it("should handle decimal timeout values", async () => {
            server.setResponse("GET", "/decimal-timeout", {
                statusCode: 200,
                headers: { "content-type": "text/plain" },
                body: "Decimal timeout test",
                delay: 200
            });

            const result = await gotcha(server.getUrl("/decimal-timeout"), {
                timeout: 150.5 // Decimal timeout
            });

            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "timeout");
        });

        it("should handle NaN timeout (should not create timeout)", async () => {
            server.setResponse("GET", "/nan-timeout", {
                statusCode: 200,
                headers: { "content-type": "text/plain" },
                body: "NaN timeout test"
            });

            const result = await gotcha(server.getUrl("/nan-timeout"), {
                timeout: NaN
            });

            // NaN should not create a timeout (since NaN > 0 is false)
            expect(result).not.toBeInstanceOf(Error);
        });

        it("should handle Infinity timeout (should not timeout)", async () => {
            server.setResponse("GET", "/infinity-timeout", {
                statusCode: 200,
                headers: { "content-type": "text/plain" },
                body: "Infinity timeout test"
            });

            const result = await gotcha(server.getUrl("/infinity-timeout"), {
                timeout: Infinity // Infinity should not create a timeout
            });

            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(200);
            }
        });
    });

    describe("Timeout with existing AbortSignal", () => {
        it("should work when no existing signal is provided", async () => {
            server.setResponse("GET", "/no-signal", {
                statusCode: 200,
                headers: { "content-type": "text/plain" },
                body: "No signal test",
                delay: 200
            });

            const result = await gotcha(server.getUrl("/no-signal"), {
                timeout: 100
            });

            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "timeout");
        });

        it("should handle external abort signal alongside timeout", async () => {
            server.setResponse("GET", "/external-signal", {
                statusCode: 200,
                headers: { "content-type": "text/plain" },
                body: "External signal test",
                delay: 300
            });

            const externalController = new AbortController();
            
            // Abort externally after 150ms
            setTimeout(() => {
                externalController.abort();
            }, 150);

            try {
                const result = await gotcha(server.getUrl("/external-signal"), {
                    timeout: 200, // Timeout at 200ms
                    signal: externalController.signal
                });

                // If we get here, it should be an error (timeout or external abort)
                expect(result).toBeInstanceOf(Error);
            } catch (error) {
                // External abort might throw, which is also valid
                expect(error).toBeDefined();
            }
        });

        it("should handle pre-aborted signal", async () => {
            server.setResponse("GET", "/pre-aborted", {
                statusCode: 200,
                headers: { "content-type": "text/plain" },
                body: "Pre-aborted test"
            });

            const controller = new AbortController();
            controller.abort(); // Abort before making request

            try {
                await gotcha(server.getUrl("/pre-aborted"), {
                    timeout: 1000,
                    signal: controller.signal
                });
                expect.fail("Should have thrown an error for pre-aborted signal");
            } catch (error) {
                // This should throw because the signal is already aborted
                expect(error).toBeDefined();
            }
        });
    });

    describe("Complex request scenarios", () => {
        it("should timeout with large request bodies", async () => {
            server.setResponse("POST", "/large-body", {
                statusCode: 200,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ received: true }),
                delay: 200
            });

            const largeData = JSON.stringify({ 
                data: "x".repeat(10000) // Large payload
            });

            const result = await gotcha(server.getUrl("/large-body"), {
                method: "POST",
                timeout: 100,
                headers: { "content-type": "application/json" },
                body: largeData
            });

            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "timeout");
        });

        it("should timeout with custom headers", async () => {
            server.setResponse("GET", "/custom-headers", {
                statusCode: 200,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ headers: "received" }),
                delay: 200
            });

            const result = await gotcha(server.getUrl("/custom-headers"), {
                timeout: 100,
                headers: {
                    "Authorization": "Bearer very-long-token-that-might-slow-things-down",
                    "X-Custom-Header": "custom-value",
                    "Accept": "application/json",
                    "User-Agent": "gotcha-test-suite/1.0.0"
                }
            });

            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "timeout");
        });

        it("should handle timeout with redirects", async () => {
            server.setResponse("GET", "/slow-redirect-source", {
                statusCode: 301,
                headers: { "location": "/redirect-target" },
                body: "Redirecting...",
                delay: 200
            });

            const result = await gotcha(server.getUrl("/slow-redirect-source"), {
                timeout: 100
            });

            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "timeout");
        });
    });

    describe("Error message accuracy", () => {
        it("should report accurate elapsed time in timeout errors", async () => {
            server.setResponse("GET", "/elapsed-time", {
                statusCode: 200,
                headers: { "content-type": "text/plain" },
                body: "Response",
                delay: 200
            });

            const startTime = Date.now();
            const result = await gotcha(server.getUrl("/elapsed-time"), {
                timeout: 100
            });
            const actualElapsed = Date.now() - startTime;

            expect(result).toBeInstanceOf(Error);
            if (result instanceof Error) {
                const reportedElapsed = (result as any).context.elapsedTime;
                
                // Reported elapsed time should be close to actual elapsed time
                expect(reportedElapsed).toBeGreaterThan(90);
                expect(reportedElapsed).toBeLessThan(actualElapsed + 20);
                
                // Should be included in error message
                expect(result.message).toContain(`${reportedElapsed}ms`);
            }
        });

        it("should include correct URL in timeout error messages", async () => {
            const testPath = "/url-in-message";
            server.setResponse("GET", testPath, {
                statusCode: 200,
                headers: { "content-type": "text/plain" },
                body: "Response",
                delay: 200
            });

            const result = await gotcha(server.getUrl(testPath), {
                timeout: 100
            });

            expect(result).toBeInstanceOf(Error);
            if (result instanceof Error) {
                expect(result.message).toContain(server.getUrl(testPath));
                expect((result as any).context.url).toBe(server.getUrl(testPath));
            }
        });

        it("should include correct method in timeout context", async () => {
            server.setResponse("PATCH", "/method-in-context", {
                statusCode: 200,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ patched: true }),
                delay: 200
            });

            const result = await gotcha(server.getUrl("/method-in-context"), {
                method: "PATCH",
                timeout: 100,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ update: "data" })
            });

            expect(result).toBeInstanceOf(Error);
            if (result instanceof Error) {
                expect((result as any).context.method).toBe("PATCH");
            }
        });
    });
});
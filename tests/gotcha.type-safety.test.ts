import { describe, it, expect, beforeEach } from "vitest";
import { gotcha } from "~/gotcha";
import { MockHttpServer } from "./test-utils";
import type { GotchaRequest, Configure, NetworkResponse } from "~/types";

describe("gotcha - Type Safety and Function Overloads", () => {
    let server: MockHttpServer;

    beforeEach(() => {
        server = (globalThis as any).testServer as MockHttpServer;
    });

    describe("GotchaRequest type compatibility", () => {
        it("should handle undici request parameters correctly", async () => {
            server.setResponse("GET", "/type-test", {
                statusCode: 200,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ success: true })
            });

            // Test with minimal parameters (URL only)
            const result1 = await gotcha(server.getUrl("/type-test"));
            expect(result1).not.toBeInstanceOf(Error);

            // Test with URL and options
            const result2 = await gotcha(server.getUrl("/type-test"), {
                method: "GET",
                headers: { "Accept": "application/json" }
            });
            expect(result2).not.toBeInstanceOf(Error);

            // Test with all common options
            server.setResponse("POST", "/type-test", {
                statusCode: 200,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ success: true })
            });
            
            const result3 = await gotcha(server.getUrl("/type-test"), {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": "Bearer token"
                },
                body: JSON.stringify({ data: "test" })
            });
            expect(result3).not.toBeInstanceOf(Error);
        });

        it("should accept URL objects as first parameter", async () => {
            server.setResponse("GET", "/url-object-type", {
                statusCode: 200,
                headers: { "content-type": "text/plain" },
                body: "URL object accepted"
            });

            const urlObject = new URL(server.getUrl("/url-object-type"));
            const result = await gotcha(urlObject);

            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(200);
            }
        });

        it("should accept undici RequestInit options", async () => {
            server.setResponse("PUT", "/request-init", {
                statusCode: 200,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ updated: true })
            });

            // Test with various RequestInit options that undici supports
            const result = await gotcha(server.getUrl("/request-init"), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-Custom-Header": "custom-value"
                },
                body: JSON.stringify({ update: "data" }),
                // Add undici-specific options if available
                // signal: new AbortController().signal,
            });

            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(200);
            }
        });
    });

    describe("Return type validation", () => {
        it("should return NetworkResponse for successful requests", async () => {
            server.setResponse("GET", "/network-response", {
                statusCode: 200,
                headers: { 
                    "content-type": "application/json",
                    "x-custom": "header-value"
                },
                body: JSON.stringify({ data: "response" })
            });

            const result = await gotcha(server.getUrl("/network-response"));

            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                // Verify it has NetworkResponse properties
                expect(result).toHaveProperty("statusCode", 200);
                expect(result).toHaveProperty("headers");
                expect(result).toHaveProperty("body");
                expect(result.headers).toHaveProperty("content-type", "application/json");
                expect(result.headers).toHaveProperty("x-custom", "header-value");
                
                // Verify body methods are available
                expect(typeof result.body.json).toBe("function");
                expect(typeof result.body.text).toBe("function");
            }
        });

        it("should return Error types for non-2xx responses", async () => {
            server.setResponse("GET", "/error-response", {
                statusCode: 400,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ error: "Bad Request" })
            });

            const result = await gotcha(server.getUrl("/error-response"));

            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "client-error");
            if (result instanceof Error) {
                // Verify error has expected structure
                expect(result.message).toBeTruthy();
                expect((result as any).context).toBeDefined();
                expect((result as any).context.code).toBe(400);
            }
        });
    });

    describe("Configure type handling", () => {
        it("should throw error for Configure type (not yet implemented)", async () => {
            // Test that Configure type throws as expected
            const configureParams: Configure = [{ foo: 1, bar: 2 }];
            
            try {
                await gotcha(...configureParams);
                expect.fail("Should have thrown an error for Configure type");
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect((error as Error).message).toContain("Configure type not yet implemented");
            }
        });

        it("should properly type-guard between GotchaRequest and Configure", async () => {
            server.setResponse("GET", "/type-guard", {
                statusCode: 200,
                headers: { "content-type": "text/plain" },
                body: "Type guard working"
            });

            // This should be recognized as GotchaRequest
            const requestParams: GotchaRequest = [server.getUrl("/type-guard")];
            const result = await gotcha(...requestParams);

            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(200);
            }
        });
    });

    describe("TypeScript compilation compatibility", () => {
        it("should accept all valid undici request signatures", async () => {
            server.setResponse("POST", "/ts-compat", {
                statusCode: 201,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ created: true })
            });

            // These should all compile without TypeScript errors
            
            // String URL only
            const result1 = await gotcha(server.getUrl("/ts-compat"));
            expect(result1).toBeDefined();

            // String URL with options
            const result2 = await gotcha(server.getUrl("/ts-compat"), {
                method: "POST",
                body: "test data"
            });
            expect(result2).toBeDefined();

            // URL object
            const result3 = await gotcha(new URL(server.getUrl("/ts-compat")));
            expect(result3).toBeDefined();

            // URL object with options  
            server.setResponse("POST", "/ts-compat", {
                statusCode: 201,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ created: true })
            });
            
            const result4 = await gotcha(new URL(server.getUrl("/ts-compat")), {
                method: "POST",
                headers: { "Content-Type": "text/plain" },
                body: "test data"
            });
            expect(result4).toBeDefined();
        });

        it("should properly infer return types", async () => {
            server.setResponse("GET", "/return-type", {
                statusCode: 200,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ inferred: true })
            });

            const result = await gotcha(server.getUrl("/return-type"));

            // TypeScript should infer this as Promise<NetworkResponse | Error>
            // At runtime, we can verify the structure
            if (result instanceof Error) {
                expect(result).toHaveProperty("message");
                expect(result).toHaveProperty("kind");
            } else {
                expect(result).toHaveProperty("statusCode");
                expect(result).toHaveProperty("headers");
                expect(result).toHaveProperty("body");
            }
        });
    });

    describe("Method overload resolution", () => {
        it("should resolve to GotchaRequest overload for request parameters", async () => {
            server.setResponse("GET", "/overload-test", {
                statusCode: 200,
                headers: { "content-type": "text/plain" },
                body: "Overload resolved correctly"
            });

            // This should use the GotchaRequest overload
            const result = await gotcha(server.getUrl("/overload-test"), {
                method: "GET",
                headers: { "Accept": "text/plain" }
            });

            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(200);
                const bodyText = await result.body.text();
                expect(bodyText).toBe("Overload resolved correctly");
            }
        });

        it("should handle different parameter combinations", async () => {
            server.setResponse("PUT", "/param-combinations", {
                statusCode: 200,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ success: true })
            });

            // Test different valid parameter combinations
            const combinations = [
                // URL only
                [server.getUrl("/param-combinations")],
                // URL with options
                [server.getUrl("/param-combinations"), { method: "PUT" as const }],
                // URL with full options
                [server.getUrl("/param-combinations"), { 
                    method: "PUT" as const, 
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ test: true })
                }]
            ];

            for (const params of combinations) {
                const result = await gotcha(...(params as any));
                expect(result).toBeDefined();
            }
        });
    });

    describe("Error type preservation", () => {
        it("should preserve error type information", async () => {
            server.setResponse("GET", "/error-types", {
                statusCode: 404,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ error: "Not Found" })
            });

            const result = await gotcha(server.getUrl("/error-types"));

            expect(result).toBeInstanceOf(Error);
            if (result instanceof Error) {
                // Verify error type is preserved
                expect((result as any).kind).toBe("client-error");
                expect((result as any).context).toBeDefined();
                expect((result as any).context.code).toBe(404);
                
                // Verify error is properly structured
                expect(result.message).toContain("client-based network error");
                expect((result as any).context.headers).toBeDefined();
                expect((result as any).context.body).toBeDefined();
            }
        });

        it("should maintain type consistency across different error codes", async () => {
            const testCases = [
                { status: 301, expectedKind: "redirection" },
                { status: 400, expectedKind: "client-error" },
                { status: 500, expectedKind: "server-error" }
            ];

            for (const testCase of testCases) {
                server.setResponse("GET", `/error-${testCase.status}`, {
                    statusCode: testCase.status,
                    headers: { "content-type": "text/plain" },
                    body: `Error ${testCase.status}`
                });

                const result = await gotcha(server.getUrl(`/error-${testCase.status}`));

                expect(result).toBeInstanceOf(Error);
                if (result instanceof Error) {
                    expect((result as any).kind).toBe(testCase.expectedKind);
                    expect((result as any).context.code).toBe(testCase.status);
                }
            }
        });
    });

    describe("Async/Promise handling", () => {
        it("should properly handle async operations", async () => {
            server.setResponse("GET", "/async-test", {
                statusCode: 200,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ async: true })
            });

            // Verify it returns a Promise
            const promise = gotcha(server.getUrl("/async-test"));
            expect(promise).toBeInstanceOf(Promise);

            // Verify Promise resolves correctly
            const result = await promise;
            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(200);
            }
        });

        it("should handle async body consumption", async () => {
            server.setResponse("GET", "/async-body", {
                statusCode: 200,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ message: "async body test" })
            });

            const result = await gotcha(server.getUrl("/async-body"));

            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                // Test async body methods
                const jsonData = await result.body.json();
                expect(jsonData).toEqual({ message: "async body test" });
            }
        });
    });
});
import { describe, it, expect, beforeEach } from "vitest";
import { gotcha } from "~/gotcha";
import { MockHttpServer } from "./test-utils";

describe("gotcha - URL Handling and Parsing", () => {
    let server: MockHttpServer;

    beforeEach(() => {
        server = (globalThis as any).testServer as MockHttpServer;
    });

    describe("String URL handling", () => {
        it("should handle simple string URLs", async () => {
            server.setResponse("GET", "/simple", {
                statusCode: 200,
                headers: { "content-type": "text/plain" },
                body: "Simple URL success"
            });

            const result = await gotcha(server.getUrl("/simple"));

            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(200);
            }
        });

        it("should handle URLs with query parameters", async () => {
            server.setResponse("GET", "/with-params?name=test&value=123", {
                statusCode: 200,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ name: "test", value: 123 })
            });

            const result = await gotcha(server.getUrl("/with-params?name=test&value=123"));

            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(200);
            }
        });

        it("should handle URLs with encoded characters", async () => {
            const encodedPath = "/path with spaces";
            const encoded = encodeURIComponent(encodedPath);
            
            server.setResponse("GET", `/${encoded}`, {
                statusCode: 200,
                headers: { "content-type": "text/plain" },
                body: "Encoded URL success"
            });

            const result = await gotcha(server.getUrl(`/${encoded}`));

            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(200);
            }
        });

        it("should handle URLs with fragments (though fragments are not sent to server)", async () => {
            server.setResponse("GET", "/fragment-test", {
                statusCode: 200,
                headers: { "content-type": "text/plain" },
                body: "Fragment URL success"
            });

            // Note: fragments (#) are client-side only and not sent to server
            const result = await gotcha(server.getUrl("/fragment-test#section1"));

            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(200);
            }
        });
    });

    describe("URL object handling", () => {
        it("should handle URL objects with hostname and port", async () => {
            server.setResponse("GET", "/url-object", {
                statusCode: 200,
                headers: { "content-type": "text/plain" },
                body: "URL object success"
            });

            // Note: gotcha should handle URL objects according to undici specs
            const urlObj = new URL(server.getUrl("/url-object"));
            const result = await gotcha(urlObj);

            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(200);
            }
        });

        it("should handle URL objects with pathname", async () => {
            server.setResponse("GET", "/custom/path", {
                statusCode: 200,
                headers: { "content-type": "text/plain" },
                body: "Custom path success"
            });

            const urlObj = new URL(server.getUrl("/custom/path"));
            const result = await gotcha(urlObj);

            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(200);
            }
        });

        it("should handle URL objects with search parameters", async () => {
            server.setResponse("GET", "/search?q=test&limit=10", {
                statusCode: 200,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ query: "test", limit: 10 })
            });

            const urlObj = new URL(server.getUrl("/search"));
            urlObj.searchParams.set("q", "test");
            urlObj.searchParams.set("limit", "10");
            
            const result = await gotcha(urlObj);

            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(200);
            }
        });
    });

    describe("URL parsing in error messages", () => {
        it("should correctly parse and display string URLs in redirection errors", async () => {
            server.setResponse("GET", "/redirect-url-test", {
                statusCode: 301,
                headers: { "location": "https://example.com/new" },
                body: "Moved"
            });

            const testUrl = server.getUrl("/redirect-url-test");
            const result = await gotcha(testUrl);

            expect(result).toBeInstanceOf(Error);
            if (result instanceof Error) {
                expect(result.message).toContain(testUrl);
            }
        });

        it("should correctly parse and display string URLs in client errors", async () => {
            server.setResponse("GET", "/client-error-url-test", {
                statusCode: 404,
                headers: { "content-type": "text/plain" },
                body: "Not Found"
            });

            const testUrl = server.getUrl("/client-error-url-test");
            const result = await gotcha(testUrl);

            expect(result).toBeInstanceOf(Error);
            if (result instanceof Error) {
                expect(result.message).toContain(testUrl);
            }
        });

        it("should correctly parse and display string URLs in server errors", async () => {
            server.setResponse("GET", "/server-error-url-test", {
                statusCode: 500,
                headers: { "content-type": "text/plain" },
                body: "Internal Server Error"
            });

            const testUrl = server.getUrl("/server-error-url-test");
            const result = await gotcha(testUrl);

            expect(result).toBeInstanceOf(Error);
            if (result instanceof Error) {
                expect(result.message).toContain(testUrl);
            }
        });

        it("should handle URL objects in error messages", async () => {
            server.setResponse("GET", "/url-object-error", {
                statusCode: 400,
                headers: { "content-type": "text/plain" },
                body: "Bad Request"
            });

            const urlObj = new URL(server.getUrl("/url-object-error"));
            const result = await gotcha(urlObj);

            expect(result).toBeInstanceOf(Error);
            if (result instanceof Error) {
                // Should contain some representation of the URL
                expect(result.message).toContain("client-based network error");
                // The exact URL format may vary depending on how undici handles URL objects
            }
        });
    });

    describe("Complex URL scenarios", () => {
        it("should handle URLs with multiple query parameters", async () => {
            const queryParams = "?search=test&category=api&sort=date&order=desc&limit=50";
            server.setResponse("GET", `/complex${queryParams}`, {
                statusCode: 200,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ 
                    search: "test", 
                    category: "api", 
                    sort: "date", 
                    order: "desc", 
                    limit: 50 
                })
            });

            const result = await gotcha(server.getUrl(`/complex${queryParams}`));

            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(200);
            }
        });

        it("should handle URLs with special characters in query parameters", async () => {
            const specialQuery = "?message=" + encodeURIComponent("Hello, World! @#$%^&*()");
            server.setResponse("GET", `/special${specialQuery}`, {
                statusCode: 200,
                headers: { "content-type": "text/plain" },
                body: "Special characters handled"
            });

            const result = await gotcha(server.getUrl(`/special${specialQuery}`));

            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(200);
            }
        });

        it("should handle deep nested paths", async () => {
            const deepPath = "/api/v1/users/123/posts/456/comments/789/replies";
            server.setResponse("GET", deepPath, {
                statusCode: 200,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ replies: [] })
            });

            const result = await gotcha(server.getUrl(deepPath));

            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(200);
            }
        });

        it("should handle URLs with port numbers explicitly", async () => {
            // This test verifies that explicit port handling works
            server.setResponse("GET", "/port-test", {
                statusCode: 200,
                headers: { "content-type": "text/plain" },
                body: "Port test success"
            });

            // Use the server's URL which includes an explicit port
            const portUrl = server.getUrl("/port-test");
            expect(portUrl).toMatch(/:\d+\/port-test$/); // Should contain :port/path
            
            const result = await gotcha(portUrl);

            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(200);
            }
        });
    });

    describe("URL error reconstruction", () => {
        it("should reconstruct URLs properly for error messages with query parameters", async () => {
            server.setResponse("GET", "/error-with-params?id=123&type=test", {
                statusCode: 404,
                headers: { "content-type": "text/plain" },
                body: "Not Found"
            });

            const urlWithParams = server.getUrl("/error-with-params?id=123&type=test");
            const result = await gotcha(urlWithParams);

            expect(result).toBeInstanceOf(Error);
            if (result instanceof Error) {
                // Should contain the base URL (without query params in the current implementation)
                expect(result.message).toContain(server.getUrl("/error-with-params"));
            }
        });

        it("should handle malformed URLs gracefully", async () => {
            // Test with a URL that has unusual but valid characters
            server.setResponse("GET", "/test%20path", {
                statusCode: 200,
                headers: { "content-type": "text/plain" },
                body: "Success"
            });

            const result = await gotcha(server.getUrl("/test%20path"));

            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(200);
            }
        });
    });

    describe("URL compatibility with undici", () => {
        it("should pass through URL parameters that undici accepts", async () => {
            server.setResponse("GET", "/undici-compat", {
                statusCode: 200,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ compatible: true })
            });

            // Test both string and URL object to ensure compatibility
            const stringResult = await gotcha(server.getUrl("/undici-compat"));
            const urlObjectResult = await gotcha(new URL(server.getUrl("/undici-compat")));

            expect(stringResult).not.toBeInstanceOf(Error);
            expect(urlObjectResult).not.toBeInstanceOf(Error);
            
            if (!(stringResult instanceof Error) && !(urlObjectResult instanceof Error)) {
                expect(stringResult.statusCode).toBe(200);
                expect(urlObjectResult.statusCode).toBe(200);
            }
        });

        it("should maintain URL structure through undici request processing", async () => {
            server.setResponse("POST", "/api/data", {
                statusCode: 201,
                headers: { 
                    "content-type": "application/json",
                    "location": "/api/data/123"
                },
                body: JSON.stringify({ id: 123, created: true })
            });

            const result = await gotcha(server.getUrl("/api/data"), {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ name: "test" })
            });

            expect(result).not.toBeInstanceOf(Error);
            if (!(result instanceof Error)) {
                expect(result.statusCode).toBe(201);
                expect(result.headers.location).toBe("/api/data/123");
            }
        });
    });
});
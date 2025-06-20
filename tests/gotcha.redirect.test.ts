import { describe, it, expect, beforeEach } from "vitest";
import { gotcha } from "~/gotcha";
import { Redirection } from "~/errors";
import { MockHttpServer, TEST_RESPONSES } from "./test-utils";

describe("gotcha - Redirection Handling (300-399)", () => {
    let server: MockHttpServer;

    beforeEach(() => {
        server = (globalThis as any).testServer as MockHttpServer;
    });

    describe("3xx status codes", () => {
        it("should return Redirection error for 301 Moved Permanently", async () => {
            server.setResponse("GET", "/moved", TEST_RESPONSES.REDIRECT_301);
            
            const result = await gotcha(server.getUrl("/moved"));
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "redirection");
            if (result instanceof Error) {
                expect(result.message).toContain("redirection took place");
                expect(result.message).toContain(server.getUrl("/moved"));
                expect((result as any).context.code).toBe(301);
                expect((result as any).context.headers.location).toBe("https://example.com/new-location");
            }
        });

        it("should return Redirection error for 302 Found", async () => {
            server.setResponse("GET", "/found", TEST_RESPONSES.REDIRECT_302);
            
            const result = await gotcha(server.getUrl("/found"));
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "redirection");
            if (result instanceof Error) {
                expect(result.message).toContain("redirection took place");
                expect((result as any).context.code).toBe(302);
                expect((result as any).context.headers.location).toBe("https://example.com/temp-location");
            }
        });

        it("should return Redirection error for 304 Not Modified", async () => {
            server.setResponse("GET", "/not-modified", {
                statusCode: 304,
                headers: { "etag": "\"123456\"", "cache-control": "max-age=3600" },
                body: ""
            });
            
            const result = await gotcha(server.getUrl("/not-modified"));
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "redirection");
            if (result instanceof Error) {
                expect((result as any).context.code).toBe(304);
                expect((result as any).context.headers.etag).toBe("\"123456\"");
            }
        });

        it("should return Redirection error for 307 Temporary Redirect", async () => {
            server.setResponse("POST", "/temp-redirect", {
                statusCode: 307,
                headers: { "location": "https://example.com/new-endpoint" },
                body: "Temporary Redirect"
            });
            
            const result = await gotcha(server.getUrl("/temp-redirect"), {
                method: "POST",
                body: JSON.stringify({ data: "test" })
            });
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "redirection");
            if (result instanceof Error) {
                expect((result as any).context.code).toBe(307);
                expect((result as any).context.headers.location).toBe("https://example.com/new-endpoint");
            }
        });

        it("should return Redirection error for 308 Permanent Redirect", async () => {
            server.setResponse("GET", "/permanent-redirect", {
                statusCode: 308,
                headers: { "location": "https://example.com/permanent-location" },
                body: "Permanent Redirect"
            });
            
            const result = await gotcha(server.getUrl("/permanent-redirect"));
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "redirection");
            if (result instanceof Error) {
                expect((result as any).context.code).toBe(308);
                expect((result as any).context.headers.location).toBe("https://example.com/permanent-location");
            }
        });
    });

    describe("Redirection error structure", () => {
        it("should contain all required error context properties", async () => {
            const customHeaders = {
                "location": "https://redirect.example.com",
                "cache-control": "no-cache",
                "x-custom-header": "custom-value"
            };

            server.setResponse("GET", "/redirect-context", {
                statusCode: 301,
                headers: customHeaders,
                body: "Redirect body content"
            });
            
            const result = await gotcha(server.getUrl("/redirect-context"));
            
            expect(result).toBeInstanceOf(Error);
            if (result instanceof Error) {
                const context = (result as any).context;
                
                expect(context.code).toBe(301);
                expect(context.headers).toEqual(expect.objectContaining(customHeaders));
                expect(context.body).toBeDefined();
                expect(context.trailers).toBeDefined();
                // context and opaque may be undefined in some cases
                expect(context.opaque).toBeDefined();
            }
        });

        it("should preserve response body in error context", async () => {
            const redirectBody = "<html><body>You are being redirected...</body></html>";
            
            server.setResponse("GET", "/redirect-with-body", {
                statusCode: 302,
                headers: { 
                    "location": "https://example.com/new-page",
                    "content-type": "text/html"
                },
                body: redirectBody
            });
            
            const result = await gotcha(server.getUrl("/redirect-with-body"));
            
            expect(result).toBeInstanceOf(Error);
            if (result instanceof Error) {
                const context = (result as any).context;
                expect(context.body).toBeDefined();
                
                const bodyText = await context.body.text();
                expect(bodyText).toBe(redirectBody);
            }
        });

        it("should handle redirects without location header", async () => {
            server.setResponse("GET", "/redirect-no-location", {
                statusCode: 301,
                headers: { "content-type": "text/plain" },
                body: "Moved but no location specified"
            });
            
            const result = await gotcha(server.getUrl("/redirect-no-location"));
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "redirection");
            if (result instanceof Error) {
                expect((result as any).context.code).toBe(301);
                expect((result as any).context.headers.location).toBeUndefined();
            }
        });
    });

    describe("Edge cases", () => {
        it("should handle 300 Multiple Choices", async () => {
            server.setResponse("GET", "/multiple-choices", {
                statusCode: 300,
                headers: { 
                    "content-type": "text/html",
                    "vary": "Accept"
                },
                body: "<html><body><h1>Multiple Choices</h1></body></html>"
            });
            
            const result = await gotcha(server.getUrl("/multiple-choices"));
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "redirection");
            if (result instanceof Error) {
                expect((result as any).context.code).toBe(300);
            }
        });

        it("should handle 399 (edge of redirection range)", async () => {
            server.setResponse("GET", "/edge-redirect", {
                statusCode: 399,
                headers: { "x-custom": "edge-case" },
                body: "Edge case redirect"
            });
            
            const result = await gotcha(server.getUrl("/edge-redirect"));
            
            expect(result).toBeInstanceOf(Error);
            expect(result).toHaveProperty("kind", "redirection");
            if (result instanceof Error) {
                expect((result as any).context.code).toBe(399);
            }
        });
    });

    describe("URL handling in redirect errors", () => {
        it("should include correct URL in error message for string URLs", async () => {
            server.setResponse("GET", "/test-url-string", TEST_RESPONSES.REDIRECT_301);
            
            const testUrl = server.getUrl("/test-url-string");
            const result = await gotcha(testUrl);
            
            expect(result).toBeInstanceOf(Error);
            if (result instanceof Error) {
                expect(result.message).toContain(testUrl);
            }
        });

        it("should handle different URL formats in error messages", async () => {
            server.setResponse("GET", "/complex-path?param=value&other=test", TEST_RESPONSES.REDIRECT_302);
            
            const complexUrl = server.getUrl("/complex-path?param=value&other=test");
            const result = await gotcha(complexUrl);
            
            expect(result).toBeInstanceOf(Error);
            if (result instanceof Error) {
                expect(result.message).toContain("redirection took place");
                // URL should be included in the error message
                expect(result.message).toContain(complexUrl);
            }
        });
    });
});
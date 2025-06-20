import { createServer, Server } from "http";
import { AddressInfo } from "net";

export interface MockResponse {
    statusCode: number;
    headers?: Record<string, string>;
    body?: string;
    delay?: number;
}

export class MockHttpServer {
    private server: Server;
    private port: number | undefined;
    private responses: Map<string, MockResponse> = new Map();

    constructor() {
        this.server = createServer((req, res) => {
            const key = `${req.method}:${req.url}`;
            const mockResponse = this.responses.get(key) || this.responses.get("*");
            
            if (!mockResponse) {
                res.statusCode = 404;
                res.end("Not Found");
                return;
            }

            const { statusCode, headers = {}, body = "", delay = 0 } = mockResponse;

            const respond = () => {
                res.statusCode = statusCode;
                Object.entries(headers).forEach(([key, value]) => {
                    res.setHeader(key, value);
                });
                res.end(body);
            };

            if (delay > 0) {
                setTimeout(respond, delay);
            } else {
                respond();
            }
        });
    }

    async start(): Promise<number> {
        return new Promise((resolve, reject) => {
            this.server.listen(0, "localhost", (err?: Error) => {
                if (err) {
                    reject(err);
                } else {
                    this.port = (this.server.address() as AddressInfo).port;
                    resolve(this.port);
                }
            });
        });
    }

    async stop(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.server.close((err?: Error) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    setResponse(method: string, path: string, response: MockResponse): void {
        this.responses.set(`${method}:${path}`, response);
    }

    setDefaultResponse(response: MockResponse): void {
        this.responses.set("*", response);
    }

    getUrl(path: string = "/"): string {
        if (!this.port) {
            throw new Error("Server not started");
        }
        return `http://localhost:${this.port}${path}`;
    }

    clear(): void {
        this.responses.clear();
    }
}

export function createMockServer(): MockHttpServer {
    return new MockHttpServer();
}

export const TEST_RESPONSES = {
    SUCCESS: {
        statusCode: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ success: true, data: "test" })
    },
    REDIRECT_301: {
        statusCode: 301,
        headers: { "location": "https://example.com/new-location" },
        body: "Moved Permanently"
    },
    REDIRECT_302: {
        statusCode: 302,
        headers: { "location": "https://example.com/temp-location" },
        body: "Found"
    },
    CLIENT_ERROR_400: {
        statusCode: 400,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ error: "Bad Request", message: "Invalid parameters" })
    },
    CLIENT_ERROR_404: {
        statusCode: 404,
        headers: { "content-type": "text/html" },
        body: "<html><body><h1>404 Not Found</h1></body></html>"
    },
    SERVER_ERROR_500: {
        statusCode: 500,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ error: "Internal Server Error" })
    },
    SERVER_ERROR_503: {
        statusCode: 503,
        headers: { "retry-after": "60" },
        body: "Service Unavailable"
    }
} as const;
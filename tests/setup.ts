import { beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import { MockHttpServer } from "./test-utils";

// Global test server instance
let globalTestServer: MockHttpServer;

beforeAll(async () => {
    globalTestServer = new MockHttpServer();
    await globalTestServer.start();
    // Make server available globally for tests
    (globalThis as any).testServer = globalTestServer;
});

afterAll(async () => {
    if (globalTestServer) {
        await globalTestServer.stop();
    }
});

beforeEach(() => {
    // Clear any previous mock responses
    if (globalTestServer) {
        globalTestServer.clear();
    }
});

// Export for direct use in tests
export { globalTestServer };
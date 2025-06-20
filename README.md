# Gotcha

A type-safe wrapper around the lightning fast [**undici**](https://undici.nodejs.org/#/) network client with enhanced error handling and timeout support.

## Features

- 🚀 **Fast**: Built on top of undici, the fastest HTTP client for Node.js
- 🛡️ **Type-safe**: Full TypeScript support with intelligent error types
- ⚡ **Smart Error Handling**: Converts HTTP error status codes into typed errors instead of throwing
- ⏱️ **Timeout Support**: Built-in request timeout with AbortController
- 🔗 **URL Flexible**: Works with string URLs, URL objects, and all undici options

## Installation

### Node.js (npm registry)

<table><tr><td><span style="font-weight: 800"><code>npm</code><span></td><td><div class="highlight highlight-source-ts notranslate position-relative overflow-auto" dir="auto"><pre><span class="pl-k">npm</span> <span class="pl-kos">install</span> false</pre><div class="zeroclipboard-container"><clipboard-copy aria-label="Copy" class="ClipboardButton btn btn-invisible js-clipboard-copy m-2 p-0 d-flex flex-justify-center flex-items-center" data-copy-feedback="Copied!" data-tooltip-direction="w" value="npm <span class="pl-kos">install</span> true" tabindex="0" role="button"><svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-copy js-clipboard-copy-icon"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 01 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg><svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-check js-clipboard-check-icon color-fg-success d-none"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg></clipboard-copy></div></div></td></tr><tr><td><span style="font-weight: 800"><code>pnpm</code><span></td><td><div class="highlight highlight-source-ts notranslate position-relative overflow-auto" dir="auto"><pre><span class="pl-k">pnpm</span> <span class="pl-kos">add</span> false</pre><div class="zeroclipboard-container"><clipboard-copy aria-label="Copy" class="ClipboardButton btn btn-invisible js-clipboard-copy m-2 p-0 d-flex flex-justify-center flex-items-center" data-copy-feedback="Copied!" data-tooltip-direction="w" value="pnpm <span class="pl-kos">add</span> true"tabindex="0" role="button"><svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-copy js-clipboard-copy-icon"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg><svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-check js-clipboard-check-icon color-fg-success d-none"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg></clipboard-copy></div></div></td></tr><tr><td><span style="font-weight: 800"><code>yarn</code><span></td><td><div class="highlight highlight-source-ts notranslate position-relative overflow-auto" dir="auto"><pre><span class="pl-k">yarn</span> <span class="pl-kos">add</span> false</pre><div class="zeroclipboard-container"><clipboard-copy aria-label="Copy" class="ClipboardButton btn btn-invisible js-clipboard-copy m-2 p-0 d-flex flex-justify-center flex-items-center" data-copy-feedback="Copied!" data-tooltip-direction="w" value="yarn <span class="pl-kos">add</span> true" tabindex="0" role="button"><svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-copy js-clipboard-copy-icon"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg><svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-check js-clipboard-check-icon color-fg-success d-none"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg></clipboard-copy></div></div></td></tr><tr><td><span style="font-weight: 800"><code>bun</code><span></td><td><div class="highlight highlight-source-ts notranslate position-relative overflow-auto" dir="auto"><pre><span class="pl-k">bun</span> <span class="pl-kos">add</span> false</pre><div class="zeroclipboard-container"><clipboard-copy aria-label="Copy" class="ClipboardButton btn btn-invisible js-clipboard-copy m-2 p-0 d-flex flex-justify-center flex-items-center" data-copy-feedback="Copied!" data-tooltip-direction="w" value="bun <span class="pl-kos">add</span> true" tabindex="0" role="button"><svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-copy js-clipboard-copy-icon"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg><svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-check js-clipboard-check-icon color-fg-success d-none"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg></clipboard-copy></div></div></td></tr></table>

### Deno/JSR

```typescript
import { gotcha, isOk } from "jsr:@yankeeinlondon/gotcha";
```

Or add to your `deno.json`:

```json
{
  "imports": {
    "gotcha": "jsr:@yankeeinlondon/gotcha"
  }
}
```

### GitHub Packages

```bash
npm install @yankeeinlondon/gotcha --registry=https://npm.pkg.github.com
```

Or configure `.npmrc`:

```conf
@yankeeinlondon:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

## Basic Usage

### Simple GET Request

```ts
import { gotcha, isOk } from "@yankeeinlondon/gotcha";

const result = await gotcha("https://api.example.com/users");

if (isOk(result)) {
    // Success! Use the response
    console.log("Status:", result.statusCode);
    const data = await result.body.json();
    console.log("Data:", data);
} else {
    console.error(result.toString());
} 
```

### POST Request with JSON

```ts
import { gotcha, isOk } from "@yankeeinlondon/gotcha";

const payload = { name: "John Doe", email: "john@example.com" };

const result = await gotcha("https://api.example.com/users", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer your-token"
    },
    body: JSON.stringify(payload)
});

if (isOk(result)) {
    const newUser = await result.body.json();
    console.log("Created user:", newUser);
} else {
    console.error(result.toString());
}
```

## Timeout Support

### Basic Timeout

```ts
import { gotcha, isOk, timedOut } from "@yankeeinlondon/gotcha";

// Timeout after 5 seconds
const result = await gotcha("https://slow-api.example.com/data", {
    timeout: 5000 // 5 seconds in milliseconds
});

if (isOk(result)) {
    const data = await result.body.json();
    console.log("Data:", data);
} else if (timedOut(result)) {
    console.log(`Request timed out after ${result.context.timeout}ms`);
    console.log(`Elapsed time: ${result.context.elapsedTime}ms`);
} else {
    console.error(result.toString());
}
```

### Advanced Timeout Usage

```ts
import { gotcha, isOk } from "@yankeeinlondon/gotcha";

// Different timeouts for different operations
const quickCheck = await gotcha("https://api.example.com/health", {
    timeout: 1000 // 1 second for health checks
});

if (isOk(quickCheck)) {
    console.log("Service is healthy");
} else {
    console.error("Health check failed:", quickCheck.toString());
}

const dataFetch = await gotcha("https://api.example.com/large-dataset", {
    method: "GET",
    timeout: 30000, // 30 seconds for large data
    headers: { "Accept": "application/json" }
});

const upload = await gotcha("https://api.example.com/upload", {
    method: "POST",
    timeout: 60000, // 1 minute for uploads
    headers: { "Content-Type": "application/octet-stream" },
    body: largeFileBuffer
});
```

## Error Handling

Gotcha converts HTTP status codes into typed errors instead of throwing exceptions:

```ts
import { gotcha, isOk } from "@yankeeinlondon/gotcha";

const result = await gotcha("https://api.example.com/endpoint");

if (isOk(result)) {
    // Success! Status code 2xx
    const data = await result.body.json();
    console.log("Data:", data);
} else {
    // Handle different error types
    switch (result.kind) {
        case "redirection": // 3xx status codes
            console.log("Redirect to:", result.context.headers.location);
            break;
        
        case "client-error": // 4xx status codes
            if (result.context.code === 404) {
                console.log("Resource not found");
            } else if (result.context.code === 401) {
                console.log("Authentication required");
            }
            break;
        
        case "server-error": // 5xx status codes
            console.log("Server error, please try again later");
            break;
        
        case "timeout":
            console.log("Request timed out, check your connection");
            break;
    }
    
    // Simple error logging with nice formatting
    console.error(result.toString());
    
    // Or access full error context for detailed inspection
    console.log("Status code:", result.context.code);
    console.log("Headers:", result.context.headers);
}
```

## Advanced Usage

### URL Objects and Search Parameters

```ts
import { gotcha, isOk } from "@yankeeinlondon/gotcha";

const url = new URL("https://api.example.com/search");
url.searchParams.set("q", "javascript");
url.searchParams.set("limit", "10");

const result = await gotcha(url, {
    timeout: 5000,
    headers: { "User-Agent": "MyApp/1.0" }
});

if (isOk(result)) {
    const searchResults = await result.body.json();
    console.log("Search results:", searchResults);
} else {
    console.error("Search failed:", result.toString());
}
```

### Custom Headers and Authentication

```ts
import { gotcha, isOk } from "@yankeeinlondon/gotcha";

const result = await gotcha("https://api.example.com/protected", {
    headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs...",
        "Accept": "application/json",
        "X-API-Version": "2.0"
    },
    timeout: 10000
});

if (isOk(result)) {
    const protectedData = await result.body.json();
    console.log("Protected data:", protectedData);
} else {
    console.error("Auth failed:", result.toString());
}
```

### File Upload with Timeout

```ts
import { gotcha, isOk } from "@yankeeinlondon/gotcha";
import { createReadStream } from "fs";

const fileStream = createReadStream("./large-file.zip");

const result = await gotcha("https://api.example.com/upload", {
    method: "PUT",
    body: fileStream,
    timeout: 120000, // 2 minutes for large uploads
    headers: {
        "Content-Type": "application/zip",
        "Authorization": "Bearer token"
    }
});

if (isOk(result)) {
    const uploadResult = await result.body.json();
    console.log("Upload successful:", uploadResult);
} else {
    console.error("Upload failed:", result.toString());
}
```

## Migration from fetch/undici

Gotcha is designed to be a drop-in replacement with enhanced error handling:

```ts
// Before (with fetch)
try {
    const response = await fetch("https://api.example.com/data");
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
} catch (error) {
    // Generic error handling
    console.error("Request failed:", error);
}

// After (with gotcha)
import { gotcha, isOk } from "gotcha";

const result = await gotcha("https://api.example.com/data", {
    timeout: 5000 // bonus: built-in timeout
});

if (isOk(result)) {
    const data = await result.body.json();
} else {
    // Specific error handling with nice formatting
    console.error("Request failed:", result.toString());
}
```

## TypeScript Support

Gotcha is written in TypeScript and provides full type safety:

```ts
import { gotcha, isOk, timedOut, type NetworkResponse } from "@yankeeinlondon/gotcha";

// Result is typed as NetworkResponse | Error
const result = await gotcha("https://api.example.com/data");

// Type narrowing works naturally with type guards
if (isOk(result)) {
    // result is typed as NetworkResponse (undici response)
    // Full undici response API is available
    const data = await result.body.json();
} else if (timedOut(result)) {
    // result.context is typed with timeout-specific properties
    console.log(`Timeout: ${result.context.timeout}ms`);
    console.log(`Elapsed: ${result.context.elapsedTime}ms`);
} else {
    // result.kind is typed as "redirection" | "client-error" | "server-error"
    // result.context is typed with appropriate properties
    console.error(result.toString());
}
```

## License

MIT 

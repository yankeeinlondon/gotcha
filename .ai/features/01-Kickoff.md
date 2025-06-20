# Feature Specification: Core Testing and Code Validation

## Overview
This specification covers the implementation of comprehensive unit tests for the existing `gotcha` functionality, which currently serves as a type-safe wrapper around the undici network client.

## Current State Analysis
- The `gotcha` function wraps undici's `request` function with enhanced error handling
- No test suite currently exists
- Core functionality includes HTTP status code error conversion (300+ → typed errors)
- Uses `@yankeeinlondon/kind-error` for structured error handling

## Requirements

### 1. Test Infrastructure Setup
- [ ] Configure vitest test runner (already in package.json)
- [ ] Set up test utilities and helpers
- [ ] Create mock server or use test fixtures for HTTP responses

### 2. Core Functionality Tests

#### 2.1 Successful Requests (Status < 300)
- [ ] Test GET requests returning 200 status
- [ ] Test POST requests with various payloads
- [ ] Test requests with custom headers
- [ ] Test requests with query parameters
- [ ] Verify returned NetworkResponse matches undici response structure

#### 2.2 Redirection Handling (300-399)
- [ ] Test 301, 302, 304, 307, 308 status codes
- [ ] Verify `Redirection` error is returned (not thrown)
- [ ] Validate error contains proper headers, status code, and body
- [ ] Test redirection with different URL formats

#### 2.3 Client Error Handling (400-499)
- [ ] Test 400, 401, 403, 404, 422, 429 status codes  
- [ ] Verify `ClientError` is returned with correct metadata
- [ ] Test client errors with response bodies
- [ ] Validate error context preservation

#### 2.4 Server Error Handling (500+)
- [ ] Test 500, 502, 503, 504 status codes
- [ ] Verify `ServerError` is returned with proper structure
- [ ] Test server errors with various response formats

### 3. URL Handling Tests
- [ ] Test string URLs (most common case)
- [ ] Test URL object format with hostname, port, path
- [ ] Test edge cases for URL parsing in error messages
- [ ] Validate URL reconstruction in error contexts

### 4. Type Safety Tests
- [ ] Test function overloads work correctly
- [ ] Verify GotchaRequest type compatibility with undici parameters
- [ ] Test Configure type handling (currently throws - verify behavior)
- [ ] Validate return type assertions

### 5. Integration Tests  
- [ ] Test with real HTTP endpoints (httpbin.org or similar)
- [ ] Test timeout scenarios
- [ ] Test with various content types (JSON, HTML, binary)
- [ ] Test large response handling

## Acceptance Criteria

1. **Test Coverage**: Achieve >90% code coverage across all source files
2. **All Tests Pass**: No failing tests in CI/CD pipeline
3. **Error Scenarios**: All HTTP status codes 300+ properly convert to typed errors
4. **Successful Scenarios**: Status codes <300 return NetworkResponse unchanged
5. **Type Safety**: TypeScript compilation succeeds without errors
6. **Documentation**: Test cases serve as usage documentation

## Implementation Notes

- Use vitest as the testing framework (already configured)
- Create test utilities for mocking HTTP responses
- Follow existing code style and naming conventions
- Ensure tests are deterministic and can run in parallel
- Add test scripts to package.json if needed

## Definition of Done

- [ ] Complete test suite covering all specified scenarios
- [ ] All tests pass consistently
- [ ] Code coverage meets acceptance criteria
- [ ] Any bugs discovered during testing are fixed
- [ ] Tests serve as living documentation of the API
- [ ] CI/CD integration works properly

## Risk Mitigation

- **Network Dependencies**: Use mocked responses to avoid flaky tests
- **Async Handling**: Proper async/await patterns in all test cases
- **Error Object Validation**: Deep equality checks for error structure
- **Type Compatibility**: Ensure tests work with strict TypeScript settings
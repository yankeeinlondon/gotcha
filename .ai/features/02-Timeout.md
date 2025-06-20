# Feature Specification: Request Timeout Support

## Overview
This specification covers the implementation of configurable request timeouts for the `gotcha` library. The feature will allow users to specify a timeout duration in milliseconds for HTTP requests, with automatic cancellation via `AbortController` when the timeout is exceeded.

## Current State Analysis
- The `gotcha` function currently accepts standard undici request parameters
- A `Timeout` error type is already defined in `src/errors.ts` but not yet used
- No timeout mechanism currently exists in the request handling logic
- The type system needs extension to support timeout configuration

## Requirements

### 1. Core Timeout Implementation

#### 1.1 Request Options Extension
- [ ] Extend request options interface to include optional `timeout` property (number in milliseconds)
- [ ] Ensure backward compatibility - timeout should be optional
- [ ] Integrate with existing GotchaRequest type system
- [ ] Support timeout in both string URL and URL object request variants

#### 1.2 AbortController Integration
- [ ] Implement `AbortController` mechanism for request cancellation
- [ ] Create timeout logic that cancels requests after specified duration
- [ ] Ensure proper cleanup of timers and abort controllers
- [ ] Handle race conditions between request completion and timeout

#### 1.3 Timeout Error Handling
- [ ] Return `Timeout` error (not throw) when timeout is exceeded
- [ ] Include relevant context in timeout errors (URL, timeout duration, elapsed time)
- [ ] Preserve request context and metadata in timeout errors
- [ ] Ensure timeout errors follow same pattern as other gotcha errors

### 2. Type System Updates

#### 2.1 Request Interface Extension
- [ ] Add `timeout?: number` to request options type
- [ ] Update `GotchaRequest` type to support timeout parameter
- [ ] Ensure TypeScript compilation succeeds with new types
- [ ] Maintain type safety and inference for timeout parameter

#### 2.2 Return Type Consistency
- [ ] Update return types to include `Timeout` error possibility
- [ ] Ensure `GotchaReturn` type reflects new error possibility
- [ ] Maintain existing error handling patterns

### 3. Implementation Details

#### 3.1 Timeout Logic
```typescript
// Pseudo-code for implementation approach
const controller = new AbortController();
const timeoutId = setTimeout(() => {
    controller.abort();
}, timeout);

try {
    const response = await undiciRequest(url, {
        ...options,
        signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
} catch (error) {
    if (controller.signal.aborted) {
        return Timeout(`Request timed out after ${timeout}ms`, {
            url,
            timeout,
            // ... other context
        });
    }
    // Handle other errors...
}
```

#### 3.2 Configuration Options
- **Default Behavior**: No timeout (maintains current behavior)
- **Timeout Range**: Accept any positive number (milliseconds)
- **Minimum Timeout**: Consider 1ms minimum (or no minimum)
- **Maximum Timeout**: No maximum limit (let users decide)

### 4. Testing Requirements

#### 4.1 Unit Tests
- [ ] Test timeout functionality with mock server delays
- [ ] Test various timeout durations (short, medium, long)
- [ ] Test timeout with different HTTP methods (GET, POST, PUT, DELETE)
- [ ] Test timeout with successful requests (should not timeout)
- [ ] Test timeout error structure and properties

#### 4.2 Edge Cases
- [ ] Test timeout = 0 (immediate timeout)
- [ ] Test very short timeouts (1ms, 10ms)
- [ ] Test timeout longer than request duration
- [ ] Test timeout with redirects
- [ ] Test timeout with large response bodies
- [ ] Test concurrent requests with different timeouts

#### 4.3 Error Scenarios
- [ ] Verify `Timeout` error is returned (not thrown)
- [ ] Verify timeout error contains correct context information
- [ ] Test cleanup of resources when timeout occurs
- [ ] Test that aborted requests don't interfere with subsequent requests

#### 4.4 Integration Tests
- [ ] Test timeout with real HTTP endpoints
- [ ] Test timeout behavior with slow external services
- [ ] Verify timeout works with various network conditions

### 5. Documentation Updates

#### 5.1 README.md Enhancements
- [ ] Add basic timeout usage examples
- [ ] Include advanced timeout scenarios
- [ ] Document timeout error handling patterns
- [ ] Provide performance recommendations for timeout values
- [ ] Show integration with existing error handling

#### 5.2 Usage Examples
```typescript
// Basic timeout example
const result = await gotcha("https://api.example.com/data", {
    timeout: 5000 // 5 second timeout
});

// Advanced timeout with error handling
const result = await gotcha("https://slow-api.example.com/endpoint", {
    method: "POST",
    timeout: 10000,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: "payload" })
});

if (result instanceof Error && result.kind === "timeout") {
    console.log(`Request timed out after ${result.context.timeout}ms`);
}
```

#### 5.3 API Documentation
- [ ] Document timeout parameter in function signatures
- [ ] Explain timeout behavior and AbortController usage
- [ ] Document timeout error properties and structure
- [ ] Provide best practices for timeout configuration

### 6. Performance Considerations

#### 6.1 Resource Management
- [ ] Ensure timers are properly cleared on request completion
- [ ] Verify AbortController cleanup prevents memory leaks
- [ ] Test performance impact of timeout mechanism
- [ ] Optimize timeout implementation for high-throughput scenarios

#### 6.2 Concurrency
- [ ] Verify timeout works correctly with concurrent requests
- [ ] Test that one timeout doesn't affect other requests
- [ ] Ensure thread-safety of timeout implementation

### 7. Backward Compatibility

#### 7.1 Existing API Preservation
- [ ] All existing gotcha usage should continue working unchanged
- [ ] No breaking changes to current function signatures
- [ ] Optional timeout parameter maintains backward compatibility
- [ ] Existing error handling patterns remain unchanged

#### 7.2 Migration Path
- [ ] Users can gradually adopt timeout feature
- [ ] No required changes to existing codebases
- [ ] Clear upgrade path for enhanced error handling

## Acceptance Criteria

### Core Functionality
1. **Timeout Implementation**: Requests timeout after specified milliseconds using AbortController
2. **Error Handling**: Timeout errors are returned (not thrown) with proper context
3. **Type Safety**: TypeScript types support optional timeout parameter
4. **Backward Compatibility**: All existing functionality remains unchanged

### Quality Assurance
1. **Test Coverage**: >95% code coverage including timeout functionality
2. **All Tests Pass**: No regressions in existing functionality
3. **Performance**: Minimal overhead when timeout is not specified
4. **Memory Management**: No memory leaks from timeout implementations

### Documentation
1. **README Updated**: Clear examples of timeout usage and error handling
2. **API Documentation**: Complete documentation of timeout parameter
3. **Migration Guide**: Clear instructions for adopting timeout feature

## Implementation Phases

### Phase 1: Core Implementation
- Extend type definitions for timeout support
- Implement AbortController-based timeout mechanism
- Update request.ts with timeout logic
- Add Timeout error context handling

### Phase 2: Testing
- Create comprehensive test suite for timeout functionality
- Add edge case testing
- Verify integration with existing tests
- Performance testing and optimization

### Phase 3: Documentation
- Update README.md with usage examples
- Add API documentation
- Create migration guidelines
- Add troubleshooting guides

## Risk Mitigation

### Technical Risks
- **AbortController Compatibility**: Ensure compatibility across Node.js versions
- **Race Conditions**: Proper handling of concurrent timeout and completion
- **Resource Leaks**: Comprehensive cleanup of timers and controllers

### User Experience Risks
- **Breaking Changes**: Maintain strict backward compatibility
- **Performance Impact**: Minimize overhead for non-timeout requests
- **Error Consistency**: Maintain consistent error handling patterns

## Definition of Done

- [ ] Timeout functionality implemented and working correctly
- [ ] All existing tests continue to pass
- [ ] New comprehensive test suite for timeout feature
- [ ] README.md updated with clear examples
- [ ] TypeScript types updated and compilation successful
- [ ] No memory leaks or resource management issues
- [ ] Performance impact negligible for existing usage patterns
- [ ] Documentation complete and accurate
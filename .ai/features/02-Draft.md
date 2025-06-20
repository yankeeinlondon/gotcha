# Timeouts

In this feature we're going to add an option in the request options for a timeout (in ms).

- this feature should use the `AbortController` mechanism of cancelling a promise when the timeout is reached
- The `Timeout` error (defined in `src/errors.ts`) will be returned (not thrown) when the timeout is reached.
- We need to be sure that the _type_ for the request API is updated to allow a user to add a timeout.

## Testing

- We should make sure we add the appropriate tests for this new feature
- and ensure that all tests are passing once done with implementation

## README.md

- let's update the README.md with several usage examples that show basic use as well as a few more advanced options
- let's be sure to highlight the new Timeout feature we've added.


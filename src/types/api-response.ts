// Every response uses one of these two envelopes, so clients can always check
// for `data` or `error` without guessing the shape per endpoint.
export interface SuccessResponse<T> {
  data: T;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

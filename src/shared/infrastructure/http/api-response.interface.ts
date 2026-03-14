/**
 * Standard API response interface for success responses.
 * All successful API responses follow this structure.
 *
 * @example
 * ```json
 * {
 *   "data": {
 *     "id": "550e8400-e29b-41d4-a716-446655440000",
 *     "name": "John Doe"
 *   }
 * }
 * ```
 */
export interface ApiSuccessResponse<T = unknown> {
  data: T;
}

/**
 * Standard API response interface for error responses.
 * All error responses follow this structure.
 *
 * @example
 * ```json
 * {
 *   "error": {
 *     "statusCode": 404,
 *     "message": "User not found with id: 123",
 *     "error": "Not Found",
 *     "code": "USER_NOT_FOUND",
 *     "metadata": {
 *       "identifier": "123",
 *       "type": "id"
 *     },
 *     "timestamp": "2025-01-15T10:30:00.000Z",
 *     "path": "/api/users/123"
 *   }
 * }
 * ```
 */
export interface ApiErrorResponse {
  error: {
    statusCode: number;
    message: string;
    error: string;
    code: string;
    metadata?: Record<string, unknown>;
    timestamp: string;
    path?: string;
  };
}

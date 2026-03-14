/**
 * Standard HTTP exception response interface.
 * This interface defines the structure of all error responses returned by the API.
 *
 * @example
 * ```json
 * {
 *   "statusCode": 404,
 *   "message": "User not found with id: 123",
 *   "error": "Not Found",
 *   "code": "USER_NOT_FOUND",
 *   "metadata": {
 *     "identifier": "123",
 *     "type": "id"
 *   },
 *   "timestamp": "2025-01-15T10:30:00.000Z",
 *   "path": "/api/users/123"
 * }
 * ```
 */
export interface HttpExceptionResponse {
  statusCode: number;
  message: string;
  error: string;
  code: string;
  metadata?: Record<string, any>;
  timestamp: string;
  path?: string;
}

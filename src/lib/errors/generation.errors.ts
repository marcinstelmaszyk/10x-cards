/**
 * Base class for all AI-related errors in the application
 */
export class AIBaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Error thrown when the AI service encounters an issue during generation
 */
export class AIServiceError extends AIBaseError {}

/**
 * Error thrown when there's an issue with database operations related to generations
 */
export class DatabaseError extends AIBaseError {}

/**
 * Error thrown when the input validation fails for the generation request
 */
export class ValidationError extends AIBaseError {}

/**
 * Error thrown when a request times out
 */
export class TimeoutError extends AIBaseError {
  constructor(message = "Request timed out") {
    super(message);
  }
}

/**
 * Maps error types to appropriate HTTP status codes
 */
export const errorStatusMap = {
  AIServiceError: 500,
  DatabaseError: 500,
  ValidationError: 400,
  TimeoutError: 504,
};

// Error handling utility for the client application

export interface AppError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
  timestamp: Date;
}

export class AppError extends Error {
  public code?: string;
  public status?: number;
  public details?: any;
  public timestamp: Date;

  constructor(message: string, code?: string, status?: number, details?: any) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
    this.timestamp = new Date();
  }
}

// Error codes for different types of errors
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
} as const;

// Error messages for different error types
export const ERROR_MESSAGES = {
  [ERROR_CODES.NETWORK_ERROR]: 'Network error - unable to connect to server. Please check your internet connection and try again.',
  [ERROR_CODES.AUTH_ERROR]: 'Authentication failed. Please log in again.',
  [ERROR_CODES.VALIDATION_ERROR]: 'Invalid data provided. Please check your input and try again.',
  [ERROR_CODES.SERVER_ERROR]: 'Server error. Please try again later or contact support.',
  [ERROR_CODES.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
  [ERROR_CODES.TIMEOUT_ERROR]: 'Request timed out. Please try again.',
  [ERROR_CODES.PERMISSION_ERROR]: 'You do not have permission to perform this action.',
} as const;

// Function to create user-friendly error messages
export const createUserFriendlyError = (error: any): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  // Handle axios errors
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message || error.message;
    
    if (status === 401) {
      return new AppError(ERROR_MESSAGES[ERROR_CODES.AUTH_ERROR], ERROR_CODES.AUTH_ERROR, status);
    } else if (status === 403) {
      return new AppError(ERROR_MESSAGES[ERROR_CODES.PERMISSION_ERROR], ERROR_CODES.PERMISSION_ERROR, status);
    } else if (status === 422) {
      return new AppError(ERROR_MESSAGES[ERROR_CODES.VALIDATION_ERROR], ERROR_CODES.VALIDATION_ERROR, status);
    } else if (status >= 500) {
      return new AppError(ERROR_MESSAGES[ERROR_CODES.SERVER_ERROR], ERROR_CODES.SERVER_ERROR, status);
    } else {
      return new AppError(message || 'Request failed', 'REQUEST_ERROR', status);
    }
  }

  // Handle network errors
  if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
    return new AppError(ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR], ERROR_CODES.NETWORK_ERROR);
  }

  // Handle timeout errors
  if (error.code === 'ECONNABORTED') {
    return new AppError(ERROR_MESSAGES[ERROR_CODES.TIMEOUT_ERROR], ERROR_CODES.TIMEOUT_ERROR);
  }

  // Handle unknown errors
  return new AppError(
    error.message || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
    ERROR_CODES.UNKNOWN_ERROR
  );
};

// Function to log errors (in production, this could send to a logging service)
export const logError = (error: AppError, context?: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context || 'App'}] Error:`, {
      message: error.message,
      code: error.code,
      status: error.status,
      details: error.details,
      timestamp: error.timestamp,
      stack: error.stack,
    });
  }
  
  // In production, you might want to send this to a logging service
  // Example: sendToLoggingService(error, context);
};

// Function to handle errors globally
export const handleGlobalError = (error: any, context?: string) => {
  const appError = createUserFriendlyError(error);
  logError(appError, context);
  
  // You can add global error handling logic here
  // For example, showing a toast notification, redirecting, etc.
  
  return appError;
};

// Function to check if an error is retryable
export const isRetryableError = (error: AppError): boolean => {
  const retryableCodes = [
    ERROR_CODES.NETWORK_ERROR,
    ERROR_CODES.TIMEOUT_ERROR,
    ERROR_CODES.SERVER_ERROR,
  ];
  
  return retryableCodes.includes(error.code as any);
};

// Function to get retry delay based on error type
export const getRetryDelay = (error: AppError, attempt: number): number => {
  if (error.code === ERROR_CODES.TIMEOUT_ERROR) {
    return Math.min(1000 * Math.pow(2, attempt), 10000); // Exponential backoff, max 10s
  }
  
  if (error.code === ERROR_CODES.SERVER_ERROR) {
    return Math.min(2000 * Math.pow(2, attempt), 30000); // Slower backoff for server errors
  }
  
  return 1000; // Default 1 second delay
};

const errorHandler = {
  AppError,
  ERROR_CODES,
  ERROR_MESSAGES,
  createUserFriendlyError,
  logError,
  handleGlobalError,
  isRetryableError,
  getRetryDelay,
};

export default errorHandler;

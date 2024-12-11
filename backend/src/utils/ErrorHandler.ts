import { Request, Response, NextFunction } from 'express';
import logger from './Logger';

class ApplicationError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends ApplicationError {
  constructor(message: string) {
    super(message, 400);
  }
}

class AuthenticationError extends ApplicationError {
  constructor(message: string) {
    super(message, 401);
  }
}

class NotFoundError extends ApplicationError {
  constructor(message: string) {
    super(message, 404);
  }
}

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  logger.error(err.message, { stack: err.stack });

  if (err instanceof ApplicationError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  res.status(500).json({ error: 'Internal Server Error' });
};

export {
  errorHandler,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  ApplicationError,
};

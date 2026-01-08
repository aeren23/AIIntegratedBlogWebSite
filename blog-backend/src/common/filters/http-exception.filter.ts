import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ValidationError {
  message: string[];
  error: string;
  statusCode: number;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorMessage = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Handle validation errors from class-validator
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const validationResponse = exceptionResponse as ValidationError;
        
        if (Array.isArray(validationResponse.message)) {
          // Join multiple validation messages
          errorMessage = validationResponse.message.join(', ');
        } else if (typeof validationResponse.message === 'string') {
          errorMessage = validationResponse.message;
        } else if ('error' in validationResponse) {
          errorMessage = validationResponse.error;
        }
      } else if (typeof exceptionResponse === 'string') {
        errorMessage = exceptionResponse;
      }
    } else if (exception instanceof Error) {
      errorMessage = exception.message;
    }

    // Log the error
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${errorMessage}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    // Return ServiceResponse-compatible format
    response.status(status).json({
      value: null,
      success: false,
      errorMessage: errorMessage,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

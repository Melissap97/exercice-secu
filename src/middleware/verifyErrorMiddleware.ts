import { Request, Response, NextFunction } from 'express';

// Custom Error Handling Middleware
const verifyErrorMiddleware = (err: any, req: Request, res: Response, next: NextFunction): void => {
  // Log the full error stack to the console (you can change this to log to a file if needed)
  console.error(err.stack);

  // Check the environment (production or development)
  if (process.env.NODE_ENV === 'production') {
    // In production, send a generic error message without revealing internal details
    res.status(500).json({ message: 'Something went wrong!' });
    return; // Ensure we stop further execution after sending the response
  }

  // In development, send the detailed error message (for debugging purposes)
  res.status(500).json({
    message: 'Internal server error',
    error: err.stack, // Send stack trace only in development
  });
};

export default verifyErrorMiddleware;

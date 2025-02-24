import { Request, Response, NextFunction } from 'express';


export const verifyErrorMiddleware = (err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error(err.stack);

  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ message: 'Something went wrong!' });
  }

  res.status(500).json({
    message: 'Internal server error',
    error: err.stack,
  });
};

export default verifyErrorMiddleware;

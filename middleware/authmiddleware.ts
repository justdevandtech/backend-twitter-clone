import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

const isAuthenticated = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    req.user = undefined;
    return res.status(401).json({ error: 'Unauthorized User.' });
  }

  const token = authorizationHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY as string,
    ) as JwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    req.user = undefined;
    return res.status(401).json({ error: 'Unauthorized User.' });
  }
};

export default isAuthenticated;

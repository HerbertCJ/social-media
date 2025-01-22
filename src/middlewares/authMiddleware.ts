import jwt, { JwtPayload } from 'jsonwebtoken'
import { UnauthorizedError } from '../types/errors';
import getSecret from '../config/awsSecret';

async function verifyToken(req, res, next) {
  const token = req.header('Authorization');
  if (!token) {
    throw new UnauthorizedError('Access denied');
  }

  try {
    const secret = await getSecret();
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    next(error);
  }
};

export default verifyToken;
import jwt from 'jsonwebtoken'
import { getAuthSecret } from '../config/awsSecret';
import User from '../models/User';

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }


  const token = authHeader.split(' ')[1];

  try {
    const secret = await getAuthSecret();
    const decoded = jwt.verify(token, secret) as { uuid: string };


    const user = await User.findOne({ uuid: decoded.uuid });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your email before proceeding' });
    }

    req.uuid = user.uuid;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export default verifyToken;
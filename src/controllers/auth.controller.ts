import { BadRequestError } from '../types/errors';
import * as authService from '../services/auth.service';

export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError('Missing required fields');
    }

    const data = await authService.register(email, password);
    res.status(201).json({ message: 'User created successfully', data });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new BadRequestError('Missing email or password');
    }

    const token = await authService.login(email, password);
    res.status(200).json({ token });
  } catch (error) {
    next(error);
  }
}

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token) {
      throw new BadRequestError('Token is required');
    }

    await authService.verifyEmail(token as string);

    res.status(200).json({ message: 'Email verified successfully!' });
  } catch (error) {
    next(error);
  }
}
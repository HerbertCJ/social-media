import { BadRequestError } from '../types/errors';
import * as authService from '../services/auth.service';
import { authSchema } from '../validators/auth.validator';

export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { error } = authSchema.validate({ email, password });
    if (error) {
      throw new BadRequestError(error.message);
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

    const { error } = authSchema.validate({ email, password });
   
    if (error) {
      throw new BadRequestError(error.message);
    }

    const { authToken, refreshToken } = await authService.login(email, password);
    res.status(200).json({ authToken, refreshToken });
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

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new BadRequestError('Refresh token is required');
    }

    const data = await authService.refreshToken(refreshToken);

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new BadRequestError('Refresh Token is required');
    }

    await authService.logout(refreshToken as string);

    res.status(200).json({ message: 'Logged out successfully!' });
  } catch (error) {
    next(error);
  }
}


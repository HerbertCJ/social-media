import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { getAuthSecret, getRefreshSecret } from "../config/awsSecret";
import { sendEmail } from "../config/sendMail";
import User from "../models/User";
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from "../types/errors";
import authRepository from "../repository/auth.repository";
import { v4 as uuidv4 } from 'uuid';
import RefreshToken from "../models/RefreshToken";

export async function register(email: string, password: string) {
  try {
    const userExists = await authRepository.findOne(User, email);

    if (userExists) {
      throw new ConflictError('User already exists');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const secret = await getAuthSecret();
    const verificationToken = jwt.sign({ email, uuid: uuidv4() }, secret, {
      expiresIn: '1h',
    });
    const user = new User({ email, password: hashedPassword, verificationToken, verificationTokenExpires: new Date(Date.now() + 3600000) });

    await authRepository.save(user);
    await sendEmail(email, 'Verify Your Email', `http://localhost:8080/auth/verify-email?token=${verificationToken}`);
  } catch (error) {
    throw error;
  }

}

export async function login(email: string, password: string) {
  try {
    const user = await authRepository.findOneByEmail(User, email);
    if (!user) {
      throw new BadRequestError('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new BadRequestError('Email isnt verified yet');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new BadRequestError('Invalid credentials');
    }

    const { authToken, refreshToken } = await createTokens(user);

    return { authToken, refreshToken };
  } catch (error) {
    throw error;
  }
}

export const verifyEmail = async (token: string) => {
  try {
    const secret = await getAuthSecret();
    const decoded = jwt.verify(token as string, secret) as { email: string };

    if (!decoded) {
      throw new UnauthorizedError('Invalid token');
    }

    const user = await authRepository.findOne(User, decoded.email);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.verificationTokenExpires && user.verificationTokenExpires < new Date()) {
      throw new BadRequestError('Verification token expired');
    }

    if (user.verificationToken !== token) {
      throw new BadRequestError('Invalid verification token');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await authRepository.save(user);
  } catch (error) {
    throw error;
  }
}

export const refreshToken = async (refreshToken: string) => {
  try {
    const secret = await getRefreshSecret();
    const decoded = jwt.verify(refreshToken as string, secret) as { uuid: string };

    if (!decoded) {
      throw new UnauthorizedError('Invalid token');
    }

    const user = await authRepository.findOne(User, decoded.uuid);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const storedToken = await authRepository.findOneByUserId(RefreshToken, user.uuid);

    if (!storedToken) {
      throw new UnauthorizedError('Refresh token not found');
    }

    if (storedToken.refreshToken !== refreshToken) {
      throw new UnauthorizedError('Refresh token is not equal');
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token expired');
    }

    const authSecret = await getAuthSecret();
    const authToken = jwt.sign({ uuid: user.uuid }, authSecret, {
      expiresIn: '15m',
    });

    return { authToken, refreshToken };
  } catch (error) {
    throw error;
  }
}

export const createTokens = async (user) => {
  const authSecret = await getAuthSecret();
  const refreshSecret = await getRefreshSecret();

  const authToken = jwt.sign({ uuid: user.uuid }, authSecret, {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign({ uuid: user.uuid }, refreshSecret, {
    expiresIn: '7d',
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await authRepository.storeTokens(user.uuid, refreshToken, expiresAt);
  return { authToken, refreshToken };
}

export async function logout(refreshToken: string) {
  try {
    const refreshSecret = await getRefreshSecret();
    const decoded = jwt.verify(refreshToken as string, refreshSecret) as { uuid: string };

    if (!decoded) {
      throw new UnauthorizedError('Invalid token');
    }

    const response = await authRepository.deleteToken(RefreshToken, decoded.uuid);
    if (!response) {
      throw new UnauthorizedError('Invalid token');
    }
    return { message: 'Logout successful' };
  } catch (error) {
    throw error;
  }
}
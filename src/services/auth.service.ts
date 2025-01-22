import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import getSecret from "../config/awsSecret";
import { sendEmail } from "../config/sendMail";
import User from "../models/User";
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from "../types/errors";
import authRepository from "../repository/auth.repository";

export async function register(email: string, password: string) {
  try {
    const userExists = await authRepository.findOne(User, { email });

    if (userExists) {
      throw new ConflictError('User already exists');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const secret = await getSecret();
    const verificationToken = jwt.sign({ email }, secret, {
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
    const user = await authRepository.findOne(User, email);
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

    const secret = await getSecret();
    const token = jwt.sign({ userId: user._id }, secret, {
      expiresIn: '1h',
    });

    return token;
  } catch (error) {
    throw error;
  }
}

export const verifyEmail = async (token: string) => {
  try {
    const secret = await getSecret();
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
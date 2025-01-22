import express from 'express'
import User from '../models/User'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { BadRequestError, ConflictError } from '../types/errors';
import getSecret from '../config/awsSecret';


const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new BadRequestError('Missing required fields');
    }

    const userExists = await User.findOne({ username });

    if (userExists) {
      throw new ConflictError('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });

    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      throw new BadRequestError('Invalid credentials');

    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new BadRequestError('Invalid credentials');
    }
    const secret = await getSecret();
    const token = jwt.sign({ userId: user._id }, secret, {
      expiresIn: '1h',
    });
    res.status(200).json({ token });
  } catch (error) {
    next(error);
  }
});

export default router;
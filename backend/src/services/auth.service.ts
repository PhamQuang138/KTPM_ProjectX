import bcrypt from 'bcrypt';
import jwt, {SignOptions} from 'jsonwebtoken';
import {prisma} from '../config/prisma';

export const authService = {
  async signup(email: string, password: string, name: string, avatar?: string) {
    const normalizedEmail = email.toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      return undefined;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: passwordHash,
        name,
        avatar,
      },
    });

    const secret = process.env.JWT_SECRET ?? 'change-me-in-production';
    const options: SignOptions = {
      expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'],
    };
    const token = jwt.sign({sub: user.id, email: user.email}, secret, {
      ...options,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    };
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (!user) {
      return undefined;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return undefined;
    }

    const secret = process.env.JWT_SECRET ?? 'change-me-in-production';
    const options: SignOptions = {
      expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'],
    };
    const token = jwt.sign({sub: user.id, email: user.email}, secret, {
      ...options,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    };
  },
};

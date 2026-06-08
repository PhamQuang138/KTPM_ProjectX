import bcrypt from 'bcrypt';
import {randomInt} from 'crypto';
import jwt, {SignOptions} from 'jsonwebtoken';
import {prisma} from '../config/prisma';
import {getJwtSecret} from '../config/env';
import {mailService} from './mail.service';

const PASSWORD_RESET_EXPIRES_MS = 10 * 60 * 1000;

const createResetCode = () => randomInt(100000, 1000000).toString();

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

    const options: SignOptions = {
      expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'],
    };
    const token = jwt.sign({sub: user.id, email: user.email}, getJwtSecret(), {
      ...options,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
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

    const options: SignOptions = {
      expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'],
    };
    const token = jwt.sign({sub: user.id, email: user.email}, getJwtSecret(), {
      ...options,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    };
  },

  async requestPasswordReset(email: string) {
    const normalizedEmail = email.toLowerCase();
    const user = await prisma.user.findUnique({
      where: {email: normalizedEmail},
      select: {id: true, email: true},
    });

    if (!user) {
      return;
    }

    const code = createResetCode();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRES_MS);

    await prisma.passwordResetToken.updateMany({
      where: {userId: user.id, usedAt: null},
      data: {usedAt: new Date()},
    });

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        codeHash,
        expiresAt,
      },
    });

    await mailService.sendPasswordResetCode(user.email, code);
  },

  async resetPassword(email: string, code: string, newPassword: string) {
    const normalizedEmail = email.toLowerCase();
    const user = await prisma.user.findUnique({
      where: {email: normalizedEmail},
      select: {id: true},
    });

    if (!user) {
      return false;
    }

    const tokens = await prisma.passwordResetToken.findMany({
      where: {
        userId: user.id,
        usedAt: null,
        expiresAt: {gt: new Date()},
      },
      orderBy: {createdAt: 'desc'},
      take: 3,
    });

    for (const token of tokens) {
      const isValid = await bcrypt.compare(code, token.codeHash);
      if (!isValid) continue;

      await prisma.$transaction([
        prisma.user.update({
          where: {id: user.id},
          data: {password: await bcrypt.hash(newPassword, 10)},
        }),
        prisma.passwordResetToken.update({
          where: {id: token.id},
          data: {usedAt: new Date()},
        }),
        prisma.passwordResetToken.updateMany({
          where: {userId: user.id, usedAt: null},
          data: {usedAt: new Date()},
        }),
      ]);

      return true;
    }

    return false;
  },
};

import createError from 'http-errors';
import { User, UserModel } from '../models/user';
import { ClientInfo, RefreshTokenModel } from '../models/refresh-token';
import { comparePasswords, hashPassword } from '../helpers/hash.helper';
import jwt from 'jsonwebtoken';
import uuid from 'uuid';
import { addMinutes } from 'date-fns';
import { AnyARecord } from 'dns';

export interface ILoginResponse {
  user?: User;
  token?: string;
}

export interface IRegisterResponse {
  user?: User;
  exists?: boolean;
}

const createToken = async (user: any, clientInfo: ClientInfo): Promise<string> => {
  const token = jwt.sign(user, process.env['JWT_SECRET'], {
    expiresIn: process.env['TOKEN_EXPIRES_IN'],
  });
  await RefreshTokenModel.add(
    token,
    process.env['REFRESH_TOKEN_EXPIRES_IN'],
    user.email,
    clientInfo
  );
  return token;
};

export const login = async (
  email: string, 
  password: string, 
  clientInfo?: ClientInfo): Promise<ILoginResponse> => {
  const user: any = await UserModel.authenticate(email, password);
  const response: ILoginResponse = {}
  if (user.email) {
    const token = await createToken(user.toJSON(), clientInfo);
    response.user = user;
    response.token = token;
    return response;
  } else if (user.errorCode) {
    throw createError(user.errorCode, user.errorMesage);
  }
};

export const refreshToken = async (refreshToken: string) => {
  const token = await RefreshTokenModel.getByToken(refreshToken);
  const user = await UserModel.getByEmail(token.userId);
  return { token, user };
};

export const register = async (user: User): Promise<IRegisterResponse> => {
  const response: IRegisterResponse = {};
  const existingUser = await UserModel.getByEmail(user.email);
  if (existingUser) {
    response.exists = true;
  } else {
    response.exists = false;
    response.user = await UserModel.createUser(user);
  }
  return response;
};

export const forgotPassword = async (email: string) => {
  try {
    const existingUser = await UserModel.getByEmail(email);
    if (!existingUser) {
      throw createError(403, 'There was a problem. User does not exist');
    }
    const now = new Date();
    const passwordResetTokenExpires = addMinutes(now, 10);
    const passwordResetToken = uuid.v4();
    await existingUser.updateOne({
      passwordResetTokenExpires,
      passwordResetToken,
      updatedAt: now,
    });
    console.log('reset token:', passwordResetToken);
    console.log('reset token:', email);

    return { success: true };
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (email: string, password: string, token: string) => {
  try {
    const user: User = await UserModel.getByEmail(email);
    // const user = await UserModel.getByEmail(email, false);
    if (!user) {
      throw createError(403, 'There was a problem reseting your password. User does not exist');
    }
    if (user.passwordResetToken !== token) {
      throw createError(403, 'There was a problem reseting your password. Invalid Token');
    }
    if (user.passwordResetTokenExpires < new Date()) {
      throw createError(403, 'There was a problem reseting your password. Token expired');
    }
    const hashedPassword = hashPassword(password);
    await UserModel.updateUser(email, { password: hashedPassword, loginErrorCount: 0 });
    return { success: true };
  } catch (error) {
    throw error;
  }
};

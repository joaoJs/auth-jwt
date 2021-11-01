import mongoose from 'mongoose';
import * as db  from './db';
import { User } from '../models/user';
import * as auth from '../controllers/auth.controller';
import { IRegisterResponse, ILoginResponse } from '../controllers/auth.controller';

let mockUser: User;
let createdUser: IRegisterResponse;

beforeAll(async () => {
  await db.connect();
  mockUser = {
    email: 'test',
    password: 'test',
    name: 'test',
    role: 'test'
  }
  process.env.JWT_SECRET = 'test';
  process.env.TOKEN_EXPIRES_IN = '5000';
  process.env.REFRESH_TOKEN_EXPIRES_IN = '365';
});
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

describe('user', () => {
  it('can register user', async () => {
      createdUser = await auth.register(mockUser);
      expect(mockUser.email).toEqual(createdUser.user.email);
  });

  it('can login user', async () => {
    createdUser = await auth.register(mockUser);
    const { user, token }: ILoginResponse = await auth.login(mockUser.email, mockUser.password);
    expect(mockUser.email).toEqual(user.email);
    expect(token.length).toBeGreaterThan(0);
  });

  it('create refresh token on login', async () => {
    createdUser = await auth.register(mockUser);
    const { token }: ILoginResponse = await auth.login(mockUser.email, mockUser.password);
    const refreshToken = await auth.refreshToken(token);
    expect(token).toBe(refreshToken._id);
  });
  
});

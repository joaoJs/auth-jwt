import mongoose from 'mongoose';
import * as db  from './db';
import { UserModel, User } from '../models/user';
import { login, register } from '../controllers/auth.controller';

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

describe('user', () => {
  it('can register user', async () => {
      const user: User = {
          email: 'test',
          password: 'test',
          name: 'test',
          role: 'test'
      }
      
      const createdUser = await register(user);
      expect(user.email).toEqual(createdUser.email);
  });

  it('can login user', async () => {
    const mockUser: User = {
        email: 'test',
        password: 'test',
        name: 'test',
        role: 'test'
    }
    await register(mockUser);
    process.env.JWT_SECRET = 'test';
    process.env.TOKEN_EXPIRES_IN = '5000' 
    const { user, token } = await login(mockUser.email, mockUser.password);
    expect(mockUser.email).toEqual(user.email);
    expect(token.length).toBeGreaterThan(0);
  });
});

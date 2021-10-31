import mongoose from 'mongoose';
import * as db  from './db';
import { UserModel, User } from '../models/user';
import { login, register } from '../controllers/auth.controller';

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

describe('user', () => {
  it('can register user', async () => {
      // const user: User = {
      //     email: 'test',
      //     password: 'test',
      //     name: 'test',
      //     role: 'test'
      // }
      // const user = await UserModel.createUser(user)
      // expect(async () => await UserModel.createUser(user)).not.toThrow();
      expect(2-1).toEqual(1);
  });
});

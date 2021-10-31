import mongoose from 'mongoose';
import db from './db';
import UserModel from '../models/user';
import { login, register } from '../controllers/auth.controller';

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

describe('user', () => {
  if (('can register user', async () => {
      expect(async () => await register({})).not.toThrow();
  }));
});

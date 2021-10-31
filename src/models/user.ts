import { prop, getModelForClass, ReturnModelType, pre, plugin, Ref } from '@typegoose/typegoose';
import paginate from 'mongoose-paginate-v2';
import * as bcrypt from 'bcryptjs';

// You User Model definition here

@pre<User>('save', async function(next) {
  const user = this;
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
  next();
})
export class User {
  @prop()
  public email: string;

  @prop()
  public password: string;

  @prop()
  public passwordResetToken: string;

  @prop()
  public passwordResetTokenExpires: Date;

  static async getUsers(
    this: ReturnModelType<typeof User>, 
    page: number, 
    limit: number,
    parsedFilter: any) {
    return this.find({});
  }

  static async getByEmail(this: ReturnModelType<typeof User>, email: string) {
    return this.findOne({ _id: email });
  }

  static async getById(this: ReturnModelType<typeof User>, userId: string) {
    return this.findById(userId);
  }

  static async updateUser(this: ReturnModelType<typeof User>, email: string, payload: any) {
    return this.findOneAndUpdate({ email: email }, payload);
  }

  static async deleteById(this: ReturnModelType<typeof User>, userId: string) {
    return this.deleteOne({ _id: userId });
  }

  static async createUser(this: ReturnModelType<typeof User>, payload: any) {
    return this.create(payload);
  }

  static async authenticate(this: ReturnModelType<typeof User>, email: string, plainTextPassword: string) {
    const user = await this.findOne({ email: email})
    if (user && await bcrypt.compare(plainTextPassword, user.password)) return user
    return false
  }
}

const DefaultTransform = {
  schemaOptions: {
    collection: 'users',
    toJSON: {
      virtuals: true,
      getters: true,
      // versionKey: false,
      transform: (doc, ret, options) => {
        delete ret._id;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      getters: true,
      transform: (doc, ret, options) => {
        delete ret._id;
        return ret;
      },
    },
  },
};

export const UserModel = getModelForClass(User, DefaultTransform);

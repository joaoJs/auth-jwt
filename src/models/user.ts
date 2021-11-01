import { prop, getModelForClass, ReturnModelType, pre, plugin, Ref } from '@typegoose/typegoose';
import paginate from 'mongoose-paginate-v2';
import * as bcrypt from 'bcryptjs';

// You User Model definition here

@pre<User>('save', async function (next) {
  const user = this;
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
  next();
})
export class User {
  @prop({ required: true, unique: true })
  public email!: string;

  @prop({ required: true })
  public password!: string;

  @prop({ required: true })
  public name!: string;

  @prop()
  public dob?: string;

  @prop({ required: true })
  public role!: string;

  @prop({ default: 0 })
  private loginErrorCount?: number;

  @prop()
  public passwordResetToken?: string;

  @prop()
  public passwordResetTokenExpires?: Date;

  static async getUsers(
    this: ReturnModelType<typeof User>,
    page: number,
    limit: number,
    parsedFilter: any
  ) {
    return this.find({});
  }

  static async getByEmail(this: ReturnModelType<typeof User>, email: string) {
    return this.findOne({ email });
  }

  static async getById(this: ReturnModelType<typeof User>, userId: string) {
    return this.findById(userId);
  }

  static async updateUser(this: ReturnModelType<typeof User>, email: string, payload: any) {
    return this.findOneAndUpdate({ email }, payload);
  }

  static async deleteById(this: ReturnModelType<typeof User>, userId: string) {
    return this.deleteOne({ _id: userId });
  }

  static async createUser(this: ReturnModelType<typeof User>, payload: any) {
    return this.create(payload);
  }

  static async authenticate(
    this: ReturnModelType<typeof User>,
    email: string,
    plainTextPassword: string
  ) {
    const user = await this.findOne({ email });
    if (!user) {
      return {errorCode: 404, errorMessage: 'user not found'}
    }
    if ( 
      user.loginErrorCount < 3 &&
      (await bcrypt.compare(plainTextPassword, user.password))) {
      let authenticatedUser = user;
      if (user.loginErrorCount > 0) {
        authenticatedUser = await this.findOneAndUpdate({ email }, { loginErrorCount: 0 }, { new: true });
      }
      return authenticatedUser;
    } else {
      if (user.loginErrorCount >= 3) {
        // TODO: force password reset here
      } else {
        user.loginErrorCount++;
        await this.findOneAndUpdate({ email }, { loginErrorCount: user.loginErrorCount }, { new: true });
      }
      return {errorCode: 401, errorMessage: 'invalid credentials'};
    }
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

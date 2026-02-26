import mongoose, { Document } from 'mongoose';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export interface IUser {
  firstName: string;
  lastName?: string;
  emailId: string;
  password: string;
  age?: number;
  gender?: 'male' | 'female' | 'others';
  photoUrl: string;
  about: string;
  skills?: string[];
}

interface IUserMethods {
  getJWT(): Promise<string>;
  comparePasswords(passwordByUser: string): Promise<boolean>;
}

interface IUserDocument extends IUser, IUserMethods, Document {}

const userSchema = new mongoose.Schema<IUserDocument>(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 20,
    },

    lastName: String,

    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value: string) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid Email');
        }
      },
    },

    password: {
      type: String,
      required: true,
      validate(value: string) {
        if (!validator.isStrongPassword(value)) {
          throw new Error('Weak Password');
        }
      },
    },

    age: {
      type: Number,
      min: 18,
    },

    gender: {
      type: String,
      enum: {
        values: ['male', 'female', 'others'],
        message: '{VALUE} is not a valid gender',
      },

      // validate(value: string) {
      //     if (!["male", "female", "others"].includes(value)){
      //         throw new Error("Not Valid Gender")
      //     }
      // }
    },

    photoUrl: {
      type: String,
      default:
        'https://storage.needpix.com/rsynced_images/blank-profile-picture-973460_1280.png',
      validate(value: string) {
        if (!validator.isURL(value)) {
          throw new Error('Invalid photoUrl');
        }
      },
    },

    about: {
      type: String,
      default: 'This is the default about section.',
      maxLength: 50,
    },

    skills: {
      type: [String],
      default: [],
      validate(value: string[]) {
        if (value.length > 10) {
          throw new Error('Skills cannot be more than 10');
        }
      },
    },
  },
  { timestamps: true }
);

userSchema.methods.getJWT = async function (): Promise<string> {
  if (!process.env.JWT_SECRET_KEY)
    throw new Error('JWT_SECRET_KEY is not defined');
  const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: '7d',
  });
  return token;
};

userSchema.methods.comparePasswords = async function (
  passwordByUser: string
): Promise<boolean> {
  return bcrypt.compare(passwordByUser, this.password);
};

const User = mongoose.model<IUserDocument>('User', userSchema);

export default User;

import mongoose, { HydratedDocument } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';

export interface IUser {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName?: string;
  emailId: string;
  password: string;
  refreshToken: string | null;
  age?: number;
  gender?: 'male' | 'female' | 'others';
  photoUrl?: string;
  about: string;
  skills?: string[];
  githubUsername?: string;
  membershipType: 'FREE' | 'PRO' | 'ELITE';
  billingCycle?: 'MONTHLY' | 'YEARLY';
  membershipExpiry: Date | null;
  onboardingComplete: boolean;
  emailVerified: boolean;
  emailVerifyToken?: string;
  emailVerifyExpiry?: Date;
}

interface IUserMethods {
  comparePasswords(passwordByUser: string): Promise<boolean>;
}

export type UserDocument = HydratedDocument<IUser, IUserMethods>;

const userSchema = new mongoose.Schema<
  IUser,
  mongoose.Model<IUser>,
  {},
  IUserMethods
>(
  {
    firstName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 20,
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

    refreshToken: { type: String, default: null },

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
      // default:
      //   'https://storage.needpix.com/rsynced_images/blank-profile-picture-973460_1280.png',
      validate(value: string) {
        if (!validator.isURL(value)) {
          throw new Error('Invalid photoUrl');
        }
      },
    },

    about: {
      type: String,
      default: 'This is the default about section.',
      maxlength: 500,
    },

    skills: {
      type: [String],
      default: [],
      validate(value: string[]) {
        if (value.length > 10) {
          throw new Error('Max 10 skills allowed');
        }

        const cleaned = value.map((v) => v.trim().toLowerCase());

        if (cleaned.some((v) => v.length < 2)) {
          throw new Error('Skill too short');
        }

        const unique = new Set(cleaned);
        if (unique.size !== cleaned.length) {
          throw new Error('Duplicate Skills are not allowed');
        }
      },
    },

    githubUsername: {
      type: String,
      trim: true,
      default: null,
    },

    membershipType: {
      type: String,
      enum: ['FREE', 'PRO', 'ELITE'],
      default: 'FREE',
    },

    billingCycle: {
      type: String,
      enum: ['MONTHLY', 'YEARLY'],
      default: null,
    },

    membershipExpiry: {
      type: Date,
      default: null,
    },
    onboardingComplete: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    emailVerifyToken: { type: String },
    emailVerifyExpiry: { type: Date },
  },
  { timestamps: true }
);

userSchema.methods.comparePasswords = async function (
  passwordByUser: string
): Promise<boolean> {
  return bcrypt.compare(passwordByUser, this.password);
};

const User = mongoose.model<IUser, mongoose.Model<IUser, {}, IUserMethods>>(
  'User',
  userSchema
);

export default User;

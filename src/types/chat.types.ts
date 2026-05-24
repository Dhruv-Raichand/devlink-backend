import { Types } from 'mongoose';

export interface PopulatedUser {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  photoUrl: string;
}

import mongoose, { Document, Types } from 'mongoose';

export type ConnectionStatus =
  | 'interested'
  | 'ignored'
  | 'accepted'
  | 'rejected';
interface IConnectionModel {
  pairKey: string;
  fromUserId: Types.ObjectId;
  toUserId: Types.ObjectId;
  status: ConnectionStatus;
}

interface IConnectionModelDocument extends IConnectionModel, Document {}

const connectionSchema = new mongoose.Schema<IConnectionModelDocument>(
  {
    pairKey: { type: String, unique: true },

    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ['interested', 'ignored', 'accepted', 'rejected'],
        message: '{VALUE} is not a valid status',
      },
    },
  },
  { timestamps: true }
);

connectionSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

connectionSchema.pre('save', function (next) {
  if (this.fromUserId.equals(this.toUserId)) {
    throw new Error('Cannot send request to yourself!');
  }
  const ids = [this.fromUserId.toString(), this.toUserId.toString()].sort();
  this.pairKey = ids.join('_');
  next();
});

const ConnectionModel = mongoose.model<IConnectionModelDocument>(
  'ConnectionModel',
  connectionSchema
);

export default ConnectionModel;

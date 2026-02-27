import mongoose, { Document, Types, InferSchemaType } from 'mongoose';

// export interface IMessageInput {
//   senderId: Types.ObjectId;
//   text: string;
// }

// export interface IMessage extends IMessageInput {
//   createdAt: Date;
//   updatedAt: Date;
// }

// interface IChat {
//   participants: Types.ObjectId[];
//   messages: IMessage[];
// }

// interface IChatDocument extends IChat, Document {}

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export type IMessage = InferSchemaType<typeof messageSchema>;
export type IMessageInput = Pick<IMessage, 'senderId' | 'text'>;

const chatSchema = new mongoose.Schema({
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ],
  messages: [messageSchema],
});

export type IChat = InferSchemaType<typeof chatSchema>;

const Chat = mongoose.model<IChat>('Chat', chatSchema);

export default Chat;

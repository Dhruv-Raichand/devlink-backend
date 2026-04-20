import mongoose, { Types, InferSchemaType } from 'mongoose';

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

const chatSchema = new mongoose.Schema(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ],
    messages: [messageSchema],
  },
  { timestamps: true }
);

export type IChat = InferSchemaType<typeof chatSchema> & {
  createdAt: Date;
  updatedAt: Date;
};

const Chat = mongoose.model<IChat>('Chat', chatSchema);

export default Chat;

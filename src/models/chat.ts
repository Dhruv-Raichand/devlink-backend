import mongoose, { Document, Types } from 'mongoose';

interface IMessage {
  senderId: Types.ObjectId;
  text: string;
}

interface IChat {
  participants: Types.ObjectId[];
  messages: IMessage[];
}

interface IChatDocument extends IChat, Document {}

const messageSchema = new mongoose.Schema<IMessage>(
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

const chatSchema = new mongoose.Schema<IChatDocument>({
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ],
  messages: [messageSchema],
});

const Chat = mongoose.model<IChatDocument>('Chat', chatSchema);

export default Chat;

import { Schema } from 'mongoose';

export const MessageSchema = new Schema({
  sender_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiver_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  conversation_id: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  content: { type: String, required: true },
  send_time: { type: Date, default: Date.now },
});

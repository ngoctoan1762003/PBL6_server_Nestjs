import { Schema } from 'mongoose';

export const ConversationSchema = new Schema({
  user_id_1: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  user_id_2: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
});

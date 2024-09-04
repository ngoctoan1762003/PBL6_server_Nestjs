import { Schema } from 'mongoose';

export const UserPostShareSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  post_id: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  shared_time: { type: Date, default: Date.now },
});

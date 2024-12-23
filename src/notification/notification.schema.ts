import { Schema } from 'mongoose';

export const NotificationSchema = new Schema({
  receiver_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  type: { type: String, default: null },
  is_new: { type: Boolean, default: true },
  link_post: { type: String, default: null },
  link_comment: { type: String, default: null },
  link_user: { type: String, ref: 'User', default: null },
  link_group: { type: String, default: null },
  created_time: { type: Date, default: Date.now },
});

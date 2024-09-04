import { Document, Types } from 'mongoose';

export interface UserPostShare extends Document {
  readonly user_id: Types.ObjectId;
  readonly post_id: Types.ObjectId;
  readonly shared_time: Date;
}

import { Document, Types } from 'mongoose';

export interface Notification extends Document {
  readonly receiver_id: Types.ObjectId;
  readonly content: string;
  is_new: boolean;
  readonly link_post?: string;
  readonly link_comment?: string;
  readonly link_user?: string;
  readonly link_group?: string;
  readonly created_time: Date;
}

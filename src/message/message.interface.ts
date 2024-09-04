import { Document, Types } from 'mongoose';

export interface Message extends Document {
  readonly sender_id: Types.ObjectId;
  readonly receiver_id: Types.ObjectId;
  readonly conversation_id: Types.ObjectId;
  readonly content: string;
  readonly send_time: Date;
}

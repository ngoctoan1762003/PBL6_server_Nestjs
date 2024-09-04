import { Document } from 'mongoose';

export interface Conversation extends Document {
  readonly user_id_1: string;
  readonly user_id_2: string;
}

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({
  timestamps: { createdAt: 'created_time' }  // Maps the `created_time` field to the automatic timestamp
})
export class Comment extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  post_id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  user_id: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    set: (value: string | null) => value === '' ? null : value
  })
  parent_comment_id: MongooseSchema.Types.ObjectId | null;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema, Types } from "mongoose";

@Schema({
  timestamps: { createdAt: "created_time", updatedAt: "updatedAt" ,}, // Rename createdAt to created_time
  collection: "posts",
})
export class PostUser extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  user_id: Types.ObjectId;

  @Prop({ required: false })
  content: string;

  @Prop({ required: true })
  status: string;

  @Prop({ type: [MongooseSchema.Types.ObjectId], default: [] })
  like_user_id: Types.ObjectId[];

  @Prop({ type: [MongooseSchema.Types.ObjectId], default: [] })
  dislike_user_id: Types.ObjectId[];

  @Prop({ type: [MongooseSchema.Types.ObjectId], default: [] })
  angry_user_id: Types.ObjectId[];

  @Prop({ type: [MongooseSchema.Types.ObjectId], default: [] })
  haha_user_id: Types.ObjectId[];

  @Prop({ type: [MongooseSchema.Types.ObjectId], default: [] })
  comment_id: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  tag: string[];

  @Prop({ type: Types.ObjectId, required: false, default: null }) // Make group_id optional
  group_id: Types.ObjectId | null;

  @Prop({ type: Date })
  created_time: Date; // Explicitly define created_time

  @Prop({ type: Date })
  updated_time: Date; // Explicitly define updatedAt

  @Prop({ type: [String], default: [] })
  photo: string[];

  @Prop({ type: [String], default: [] })
  tag_friend: string[];
}

export const PostSchema = SchemaFactory.createForClass(PostUser);

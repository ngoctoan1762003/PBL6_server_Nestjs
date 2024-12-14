/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema, Types } from "mongoose";

@Schema({
    timestamps: { createdAt: "created_time", updatedAt: "updatedAt" },
    collection: "report_posts", // Use a unique collection name for ReportPost
})
export class ReportPost extends Document {
    @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
    user_id: Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
    post_id: Types.ObjectId;

    @Prop({ required: false })
    content: string;
}


export const ReportPostSchema = SchemaFactory.createForClass(ReportPost);

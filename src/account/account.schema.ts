import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

@Schema({
    timestamps: { createdAt: 'created_at' }  // Maps the `created_at` field to the automatic timestamp
})
export class User extends Document {
    @Prop({ required: true, unique: true })
    username: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    hash_password: string;

    @Prop({ required: true })
    salt: string;

    @Prop()
    password_reset_token: string;

    @Prop()
    reset_token_expire_time: Date;

    @Prop({ required: true })
    role: string;

    @Prop()
    status: string;

    @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }], default: [] })
    friend: MongooseSchema.Types.ObjectId[];

    @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }], default: [] })
    follower_id: MongooseSchema.Types.ObjectId[];

    @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }], default: [] })
    following_id: MongooseSchema.Types.ObjectId[];

    @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }], default: [] })
    block_id: MongooseSchema.Types.ObjectId[];

    @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Post' }], default: [] })
    save_post: MongooseSchema.Types.ObjectId[];

    @Prop()
    image: string;

    @Prop()
    background_image: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

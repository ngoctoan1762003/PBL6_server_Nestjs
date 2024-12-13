import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

class Emotion {
    @Prop({ required: true })
    emotion_name: string;

    @Prop({ required: true })
    emotion_percent: string;
}

@Schema({
    timestamps: { createdAt: 'created_at' },
})
export class Diary extends Document {
    @Prop({ required: true })
    user_id: string;

    @Prop({ required: true })
    content: string;

    @Prop({ required: true, type: [{ emotion_name: String, emotion_percent: String }] })
    emotion: Emotion[];

    @Prop({required: true})
    day: Date;

    @Prop({ required: true })
    images: string[];
}

export const DiarySchema = SchemaFactory.createForClass(Diary);

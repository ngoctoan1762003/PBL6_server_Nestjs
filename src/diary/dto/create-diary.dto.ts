import { IsString, IsArray, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class Emotion {
    @IsString()
    emotion_name: string;

    @IsString()
    emotion_percent: string;
}

export class CreateDiaryDto {
    @IsString()
    user_id: string;

    @IsString()
    content: string;

    @IsString()
    title: string;

    @IsArray()
    @ArrayMinSize(3)
    @ValidateNested({ each: true })
    @Type(() => Emotion)
    emotion: Emotion[];
}

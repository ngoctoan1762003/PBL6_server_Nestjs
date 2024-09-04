import { IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateMessageDto {
  @IsNotEmpty()
  sender_id: Types.ObjectId;

  @IsNotEmpty()
  receiver_id: Types.ObjectId;

  @IsNotEmpty()
  conversation_id: Types.ObjectId;

  @IsNotEmpty()
  @IsString()
  content: string;
}

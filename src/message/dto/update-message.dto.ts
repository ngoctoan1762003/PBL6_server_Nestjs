import { IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateMessageDto {
  @IsString()
  content?: string;
}

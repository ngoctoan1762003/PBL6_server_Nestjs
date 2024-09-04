import { IsNotEmpty, IsOptional, IsBoolean, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateNotificationDto {
  @IsNotEmpty()
  receiver_id: Types.ObjectId;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  link_post?: string;

  @IsOptional()
  @IsString()
  link_comment?: string;

  @IsOptional()
  @IsString()
  link_user?: string;

  @IsOptional()
  @IsString()
  link_group?: string;
}

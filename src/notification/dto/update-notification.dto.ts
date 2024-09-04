import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateNotificationDto {
  @IsOptional()
  receiver_id?: Types.ObjectId;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsBoolean()
  is_new?: boolean;

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

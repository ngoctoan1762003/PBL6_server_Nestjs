import { IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class CreateUserPostShareDto {
  @IsNotEmpty()
  user_id: Types.ObjectId;

  @IsNotEmpty()
  post_id: Types.ObjectId;
}

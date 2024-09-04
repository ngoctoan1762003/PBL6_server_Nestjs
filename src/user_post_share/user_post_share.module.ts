import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserPostShareController } from './user_post_share.controller';
import { UserPostShareService } from './user_post_share.service';
import { UserPostShareSchema } from './user_post_share.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'UserPostShare', schema: UserPostShareSchema }])],
  controllers: [UserPostShareController],
  providers: [UserPostShareService],
})
export class UserPostShareModule {}

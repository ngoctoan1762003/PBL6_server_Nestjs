import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { MessageSchema } from './message.schema';
import { AccountService } from 'src/account/account.service';
import { JwtService } from '@nestjs/jwt';
import { User, UserSchema } from 'src/account/account.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Message', schema: MessageSchema }, {name: User.name, schema: UserSchema}])],
  controllers: [MessageController],
  providers: [MessageService, AccountService, JwtService],
})
export class MessageModule {}

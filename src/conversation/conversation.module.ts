import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { ConversationSchema } from './conversation.schema';  // Import your ConversationSchema here
import { AccountService } from 'src/account/account.service';
import { User, UserSchema } from 'src/account/account.schema';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Conversation', schema: ConversationSchema }, {name: User.name, schema: UserSchema}])],
  controllers: [ConversationController],
  providers: [ConversationService, AccountService, JwtService],
})
export class ConversationModule {}

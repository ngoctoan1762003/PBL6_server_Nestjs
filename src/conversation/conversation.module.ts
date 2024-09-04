import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { ConversationSchema } from './conversation.schema';  // Import your ConversationSchema here

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Conversation', schema: ConversationSchema }])],
  controllers: [ConversationController],
  providers: [ConversationService],
})
export class ConversationModule {}

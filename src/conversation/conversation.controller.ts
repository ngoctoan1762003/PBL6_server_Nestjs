import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { Types } from 'mongoose';
import { ConversationService } from './conversation.service';

@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  async createConversation(
    @Body('user_id_1') user_id_1: string,
    @Body('user_id_2') user_id_2: string,
  ) {
    return this.conversationService.createConversation(
      new Types.ObjectId(user_id_1), 
      new Types.ObjectId(user_id_2)
    );
  }

  @Get()
  async getAllConversationsByUserId(
    @Query('user_id') userId: string  
  ) {
    return this.conversationService.getAllConversationsByUserId(userId);
  }

  @Get(':id')
  async getConversationById(@Param('id') id: string) {
    return this.conversationService.getConversationById(id);
  }

  @Delete(':id')
  async deleteConversation(@Param('id') id: string) {
    return this.conversationService.deleteConversation(id);
  }
}

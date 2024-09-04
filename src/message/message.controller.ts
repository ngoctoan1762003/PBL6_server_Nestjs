import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { MessageService } from './message.service';
import { Types } from 'mongoose';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async createMessage(@Body() createMessageDto: CreateMessageDto) {
    return this.messageService.createMessage(createMessageDto);
  }

  @Get()
  async getAllMessagesByConversationId(
    @Body('conversation_id') conversationId: string
  ) {
    return this.messageService.getAllMessagesByConversationId(conversationId);
  }

  @Get(':id')
  async getMessageById(@Param('id') id: string) {
    return this.messageService.getMessageById(id);
  }

  @Put(':id')
  async updateMessage(
    @Param('id') id: string,
    @Body() updateMessageDto: UpdateMessageDto,
  ) {
    return this.messageService.updateMessage(id, updateMessageDto);
  }

  @Delete(':id')
  async deleteMessage(@Param('id') id: string) {
    return this.messageService.deleteMessage(id);
  }
}

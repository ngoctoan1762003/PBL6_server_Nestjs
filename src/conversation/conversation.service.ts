import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversation } from './conversation.interface';  // Import your Conversation interface here

@Injectable()
export class ConversationService {
  constructor(
    @InjectModel('Conversation') private readonly conversationModel: Model<Conversation>,
  ) {}

  async createConversation(user_id_1: Types.ObjectId, user_id_2: Types.ObjectId): Promise<Conversation> {
    const newConversation = new this.conversationModel({ user_id_1, user_id_2 });
    return newConversation.save();
  }

  async getAllConversationsByUserId(userId: string): Promise<Conversation[]> {
    return this.conversationModel.find({
      $or: [
        { user_id_1: userId },
        { user_id_2: userId }
      ]
    }).exec();
  }

  async getConversationById(id: string): Promise<Conversation> {
    const conversation = await this.conversationModel.findById(id).exec();
    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }
    return conversation;
  }

  async deleteConversation(id: string): Promise<{ message: string }> {
    const result = await this.conversationModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }
    return { message: 'Conversation successfully deleted' };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversation } from './conversation.interface';  // Import your Conversation interface here
import { AccountService } from 'src/account/account.service';
import { User } from 'src/account/account.schema';

@Injectable()
export class ConversationService {
  constructor(
    @InjectModel('Conversation') private readonly conversationModel: Model<Conversation>,
    private accountService: AccountService,  // Inject AccountService

  ) { }

  async createConversation(user_id_1: Types.ObjectId, user_id_2: Types.ObjectId): Promise<Conversation> {
    const conversations = await this.conversationModel.find({
      $or: [
        { user_id_1: user_id_1, user_id_2: user_id_2 },
        { user_id_2: user_id_1, user_id_1: user_id_2 },
      ]
    }).exec();

    if (conversations.length > 0) {
      return conversations[0];
    }

    const newConversation = new this.conversationModel({ user_id_1, user_id_2 });
    return newConversation.save();
  }

  async getAllConversationsByUserId(userId: string): Promise<any[]> {
    const conversations = await this.conversationModel.find({
      $or: [
        { user_id_1: userId },
        { user_id_2: userId }
      ]
    }).exec();

    const userIdsData = await Promise.all(
      conversations.map(async (conversation) => {
        const isUserSender = conversation.user_id_1.toString().trim() === userId.trim(); // Ensure both are strings and trimmed

        const senderRaw = await this.getUsersByIds([isUserSender ? conversation.user_id_1 : conversation.user_id_2]);
        const recipientRaw = await this.getUsersByIds([isUserSender ? conversation.user_id_2 : conversation.user_id_1]);

        const sender = senderRaw.map(user => ({
          username: user.username,
          email: user.email,
          image: user.image,
          _id: user._id,
        }))[0];

        const recipient = recipientRaw.map(user => ({
          username: user.username,
          email: user.email,
          image: user.image,
          _id: user._id,
        }))[0];

        return { id: conversation.id, sender, recipient };
      })
    );


    return userIdsData;
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

  private async getUsersByIds(userIds: string[]): Promise<User[]> {
    return this.accountService.findByIds(userIds);
  }
}

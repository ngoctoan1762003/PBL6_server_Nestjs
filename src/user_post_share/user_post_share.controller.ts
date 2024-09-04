import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { UserPostShareService } from './user_post_share.service';
import { CreateUserPostShareDto } from './dto/create_user_post_share.dto';

@Controller('user-post-share')
export class UserPostShareController {
  constructor(private readonly userPostShareService: UserPostShareService) {}

  @Post()
  async createUserPostShare(@Body() createUserPostShareDto: CreateUserPostShareDto) {
    return this.userPostShareService.createUserPostShare(createUserPostShareDto);
  }

  @Get('user/:userId')
  async getAllSharesByUser(@Param('userId') userId: string) {
    return this.userPostShareService.getAllSharesByUser(userId);
  }

  @Get('post/:postId')
  async getAllSharesByPost(@Param('postId') postId: string) {
    return this.userPostShareService.getAllSharesByPost(postId);
  }

  @Delete(':id')
  async deleteUserPostShare(@Param('id') id: string) {
    return this.userPostShareService.deleteUserPostShare(id);
  }
}

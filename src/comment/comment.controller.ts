import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { CommentService } from './comment.service';
import { Comment } from './comment.schema';
import { UpdateCommentDto } from './dto/comment.dto';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  async createComment(@Body() createCommentDto: any): Promise<Comment> {
    return this.commentService.createComment(createCommentDto);
  }

  @Get()
  async getAllCommentsByPostId(
    @Body() postId: string
  ): Promise<Comment[]> {
    return this.commentService.getAllCommentsByPostId(postId);
  }

  @Get(':id')
  async getCommentById(@Param('id') id: string): Promise<Comment> {
    return this.commentService.getCommentById(id);
  }

  @Put(':id')
  async updateComment(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    return this.commentService.updateComment(id, updateCommentDto);
  }

  @Delete(':id')
  async deleteComment(@Param('id') id: string): Promise<{ message: string }> {
    return this.commentService.deleteComment(id);
  }
}

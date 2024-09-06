import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('post')
export class PostController {
    constructor(private postService: PostService) {}

    @Post()
    async createPost(@Body() createPostDto: CreatePostDto) {
        return this.postService.createPost(createPostDto);
    }

    @Get()
    async getAllPosts() {
        return this.postService.getAllPosts();
    }

    @Get(':id')
    async getPostById(@Param('id') postId: string) {
        return this.postService.getPostById(postId);
    }

    @Get('/user/:id')
    async getPostByUserId(@Param('id') postId: string) {
        return this.postService.getAllPostAndShareByUserId(postId);
    }

    @Put(':id')
    async updatePost(@Param('id') postId: string, @Body() updatePostDto: UpdatePostDto) {
        return this.postService.updatePost(postId, updatePostDto);
    }

    @Put('/approve/:id')
    async approvePost(@Param('id') postId: string, @Body() updatePostDto: UpdatePostDto) {
        return this.postService.approvePost(postId);
    }

    @Delete(':id')
    async deletePost(@Param('id') postId: string) {
        return this.postService.deletePost(postId);
    }

    @Put(':id/like')
    async likePost(@Param('id') postId: string, @Body('userId') userId: string) {
        return this.postService.likePost(postId, userId);
    }

    @Put(':id/dislike')
    async dislikePost(@Param('id') postId: string, @Body('userId') userId: string) {
        return this.postService.dislikePost(postId, userId);
    }
}

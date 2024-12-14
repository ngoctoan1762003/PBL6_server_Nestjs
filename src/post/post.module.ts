/* eslint-disable prettier/prettier */
import { UserPostShareSchema } from './../user_post_share/user_post_share.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostService } from './post.service';
import { AccountService } from 'src/account/account.service';
import { PostController } from './post.controller';
import { PostUser, PostSchema } from './post.schema';
import { Comment, CommentSchema } from 'src/comment/comment.schema';
import { User, UserSchema } from 'src/account/account.schema';
import { JwtService } from '@nestjs/jwt';
import { ReportPost, ReportPostSchema } from './reportpost.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: PostUser.name, schema: PostSchema }, {name: "UserPostShare", schema: UserPostShareSchema}, {name: Comment.name, schema: CommentSchema}, {name: User.name, schema: UserSchema}, {name: ReportPost.name, schema: ReportPostSchema}])],
    providers: [PostService, AccountService, JwtService],
    controllers: [PostController],
})
export class PostModule {}

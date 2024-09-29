import { UserPostShareSchema } from './../user_post_share/user_post_share.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { Post, PostSchema } from './post.schema';
import { Comment, CommentSchema } from 'src/comment/comment.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }, {name: "UserPostShare", schema: UserPostShareSchema}, {name: Comment.name, schema: CommentSchema}])],
    providers: [PostService],
    controllers: [PostController],
})
export class PostModule {}

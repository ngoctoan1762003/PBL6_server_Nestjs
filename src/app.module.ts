import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AccountModule } from './account/account.module';
import { DiaryModule } from './diary/diary.module';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { MessageModule } from './message/message.module';
import { ConversationModule } from './conversation/conversation.module';
import { NotificationModule } from './notification/notification.module';
import { UserPostShareModule } from './user_post_share/user_post_share.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true, // Makes ConfigModule available throughout the app
        }),
        MongooseModule.forRoot(process.env.DB_URL),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('SECRET_KEY'),
                signOptions: { expiresIn: '1h' },
            }),
        }),
        AccountModule,
        DiaryModule,
        PostModule,
        CommentModule,
        MessageModule,
        ConversationModule,
        NotificationModule,
        UserPostShareModule,
    ],
})
export class AppModule {}

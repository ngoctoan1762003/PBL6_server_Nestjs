/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Delete, Param, Put, UseGuards, Headers } from '@nestjs/common';
import { AccountService } from './account.service';
import { User } from './account.schema';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { AdminAuthGuard } from 'src/guard/admin_auth.guard';

@Controller('account')
export class AccountController {
    constructor(private accountService: AccountService) { }

    @Get()
    // @UseGuards(AdminAuthGuard)
    async getAllAccount(): Promise<User[]> {
        return this.accountService.findAll();
    }

    @Post('signup')
    async signup(@Body() signupDto: SignupDto): Promise<User> {
        return this.accountService.signup(signupDto);
    }

    @Delete(':id')
    async deleteUser(@Param('id') userId: string): Promise<{ message: string }> {
        return this.accountService.deleteUserById(userId);
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto): Promise<{ accessToken: string }> {
        return this.accountService.login(loginDto);
    }

    @Post('forgot-password')
    async forgotPassword(@Body('email') email: string): Promise<{ message: string }> {
        return this.accountService.forgotPassword(email);
    }

    @Post('change-password')
    async changePassword(@Body('token') token: string, @Body('newPassword') newPassword: string) {
        return this.accountService.changePassword(token, newPassword);
    }
    
    @Put('add-friend')
    async addFriend(
        @Body('friendId') friendId: string,
        @Body('userId') userId: string
    ): Promise<{ message: string }> {
        return this.accountService.addFriend(userId, friendId);
    }

    @Put('confirm-friend')
    async confirmFriend(
        @Body('friendId') friendId: string,
        @Body('userId') userId: string
    ): Promise<{ message: string }> {
        return this.accountService.confirmFriend(userId, friendId);
    }

    @Put('unfriend')
    async unFriend(
        @Body('friendId') friendId: string,
        @Body('userId') userId: string
    ): Promise<{ message: string }> {
        return this.accountService.unFriend(userId, friendId);
    }

    @Put('remove-friend-invite')
    async removeFriend(
        @Body('friendId') friendId: string,
        @Body('userId') userId: string
    ): Promise<{ message: string }> {
        return this.accountService.removeFriendInvite(userId, friendId);
    }

    @Put('change-info')
    @UseGuards(JwtAuthGuard)
    async changeUserInformation(
        @Headers('authorization') authHeader: string,
        @Body('username') username: string,
        @Body('password') password: string,
        @Body('image') image: string,
    ): Promise<{ message: string }> {
        const userToken = authHeader.split(' ')[1];

        return this.accountService.changeUserInformation(
            username,
            password,
            image,
            userToken,
        );
    }

    @Put('change-background')
    async changeBackground(
        @Body('backgroundLink') backgroundLink: string,
        @Body('userId') userId: string,
    ): Promise<{ message: string }> {
        return this.accountService.changeBackground(backgroundLink, userId);
    }

    @Get('user/:id')
    async getInfo(
        @Param('id') userId: string
    ): Promise<{ _id: string; username: string; email: string; friend: string[]; image: string; background_image: string; }> {
        return this.accountService.getInfo(userId);
    }


    @Get(':id')
    async getUserById(@Param('id') userId: string) {
        return this.accountService.getUserById(userId);
    }

    @Post('search')
    async search(@Body('partialName') partialName: string, @Body('selfId') selfId: string): Promise<User[]> {
        return this.accountService.getUserByPartialName(partialName, selfId);
    }

    @Post('friend-status')
    async getFriendStatus(
        @Body('senderId') senderId: string,
        @Body('receiverId') receiverId: string,
    ): Promise<{ isFriend: boolean; isPending: boolean }> {
        return this.accountService.getFriendStatus(senderId, receiverId);
    }

    @Get('list-friend_request/:id')
    async getListFriendRequestById(@Param('id') userId: string) {
        return this.accountService.getListFriendRequestById(userId);
    }

    @Get('list-friend/:id')
    async getListFriendById(@Param('id') userId: string) {
        return this.accountService.getListFriendById(userId);
    }

    @Get('list-friend-sent/:id')
    async getListFriendSentById(@Param('id') userId: string) {
        return this.accountService.getListFriendSentById(userId);
    }
}

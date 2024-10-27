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
    constructor(private accountService: AccountService){} 

    @Get()
    @UseGuards(AdminAuthGuard)
    async getAllAccount() : Promise<User[]>{
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
    ): Promise<{ message: string }>
    {
        return this.accountService.changeBackground(backgroundLink, userId);
    }
    
    @Get('me/info')
    @UseGuards(JwtAuthGuard)
    async getSelf(
        @Headers('authorization') authHeader: string
    ): Promise<User>  {
        const userToken = authHeader.split(' ')[1];
        return this.accountService.getSelfInfo(userToken);
    }
    
    @Get(':id')
    async getUserById(@Param('id') userId: string){
        return this.accountService.getUserById(userId);
    }
}

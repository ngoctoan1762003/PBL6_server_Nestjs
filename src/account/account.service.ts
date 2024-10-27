/* eslint-disable prettier/prettier */
import { SignupDto } from './dto/signup.dto';
import { Injectable, HttpStatus, HttpException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './account.schema';
import mongoose from 'mongoose';
import { generateSaltAndHash, validatePassword } from './auth.utils'; // Import the utility function
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto'; // To generate a secure token
import * as nodemailer from 'nodemailer'; // For sending emails
 
@Injectable()
export class AccountService {
    constructor(
        @InjectModel(User.name)
        private accountModel: mongoose.Model<User>,
        private jwtService: JwtService
    ) { }

    async findAll(): Promise<User[]> {
        const accounts = await this.accountModel.find();
        return accounts;
    }

    async signup(signupDto: SignupDto): Promise<User> {
        // Check if the email is already registered
        const email = signupDto.email;
        const password = signupDto.password;
        const existingAccount = await this.accountModel.findOne({ email });
        if (existingAccount) {
            throw new HttpException({
                status: HttpStatus.CONFLICT,
                error: 'Email is already registered',
            }, HttpStatus.CONFLICT);
        }

        // Hash the password
        const { salt, hashPassword } = await generateSaltAndHash(password);

        // Create the new account with default values
        const newAccount = new this.accountModel({
            username: email,  // Use email as the default username
            email,
            hash_password: hashPassword,
            salt,
            role: 'user',  // Default role is 'user'
            status: 'normal',  // Default status is 'normal'
            friend: [],  // Initialize empty arrays
            follower_id: [],
            following_id: [],
            block_id: [],
            save_post: [],
            password_reset_token: null,  // No value at first
            reset_token_expire_time: null,  // No value at first
            image: ''
        });
        // Save and return the new account
        return newAccount.save();
    }

    async deleteUserById(userId: string): Promise<{ message: string }> {
        const user = await this.accountModel.findByIdAndDelete(userId);

        if (!user) {
            throw new HttpException({
                status: HttpStatus.NOT_FOUND,
                error: 'User not found',
            }, HttpStatus.NOT_FOUND);
        }

        return { message: 'User successfully deleted' };
    }


    async login(loginDto: LoginDto): Promise<{ userName: string, userId: any, accessToken: string }> {
        const { email, password } = loginDto;

        // Find the user by email
        const user = await this.accountModel.findOne({ email });
        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        // Validate the password
        const isPasswordValid = await validatePassword(password, user.hash_password, user.salt);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
        }

        // Create a payload with the user's data
        const payload = { username: user.username, role: user.role, email: user.email };
        
        // Sign the JWT token
        const accessToken = this.jwtService.sign(payload);

        return { userId: user._id.toString(), userName: user.username, accessToken };
        const userName = user.username;
        const userId = user._id;
        return { userName, userId, accessToken };
    }

    async findByIds(userIds: string[]): Promise<User[]> {
        return this.accountModel.find({ _id: { $in: userIds } }).exec();
    }

    async forgotPassword(email: string): Promise<{ message: string }> {
        // Check if the email exists in the database
        const user = await this.accountModel.findOne({ email });
        if (!user) {
            throw new HttpException({
                status: HttpStatus.NOT_FOUND,
                error: 'User with this email does not exist',
            }, HttpStatus.NOT_FOUND);
        }

        // Generate a reset token
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Set token expiration time (10 minutes from now)
        const resetTokenExpireTime = Date.now() + 10 * 60 * 1000; // 10 minutes

        // Update the user in the database
        user.password_reset_token = resetToken;
        user.reset_token_expire_time = new Date(resetTokenExpireTime);
        await user.save();

        // Send an email with the reset link
        const resetUrl = `http://yourfrontend.com/reset-password?token=${resetToken}`; // Replace with your frontend URL


        console.log(process.env.EMAIL_USER)
        console.log(process.env.EMAIL_PASS)
        // Create a transporter object using SMTP transport
        const transporter = nodemailer.createTransport({
            service: 'Gmail', // You can use any service like Gmail, Yahoo, etc.
            auth: {
                user: process.env.EMAIL_USER, // Your email address
                pass: process.env.EMAIL_PASS, // Your email password
            },
        });

        // Send email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request',
            text: `You requested a password reset. Please use the following link to reset your password: ${resetUrl}. This link will expire in 10 minutes.`,
        });

        return { message: 'Reset link sent to your email' };
    }

    async changePassword(resetToken: string, newPassword: string): Promise<{ message: string }> {
        // Find the user by the reset token
        const user = await this.accountModel.findOne({
            password_reset_token: resetToken,
        });

        if (!user) {
            throw new HttpException({
                status: HttpStatus.BAD_REQUEST,
                error: 'Invalid password reset token',
            }, HttpStatus.BAD_REQUEST);
        }

        // Check if the reset token has expired
        if (user.reset_token_expire_time && user.reset_token_expire_time.getTime() < Date.now()) {
            throw new HttpException({
                status: HttpStatus.BAD_REQUEST,
                error: 'Password reset token has expired',
            }, HttpStatus.BAD_REQUEST);
        }

        // Hash the new password
        const { salt, hashPassword } = await generateSaltAndHash(newPassword);

        // Update the user's password, salt, and clear the reset token and expiration time
        user.hash_password = hashPassword;
        user.salt = salt;
        user.password_reset_token = null;
        user.reset_token_expire_time = null;

        // Save the updated user to the database
        await user.save();

        return { message: 'Password has been successfully updated' };
    }

    async changeBackground(backgroundLink: string, userId: string): Promise<{ message: string }> {
        console.log(backgroundLink, userId)
        const user = await this.getUserById(userId)

        if (!user) {
            throw new HttpException({
                status: HttpStatus.BAD_REQUEST,
                error: 'No user found',
            }, HttpStatus.BAD_REQUEST);
        }

        user.background_image = backgroundLink;

        await user.save();

        return { message: 'Background has been set succesfully' };
    }

    async changeUserInformation(username: string, password: string, image: string, userToken: string): Promise<{ message: string }> {
        // Verify and decode the token
        let decodedToken;
        try {
            decodedToken = this.jwtService.verify(userToken);
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }

        const userEmail = decodedToken.email;

        // Find the user by email
        const user = await this.accountModel.findOne({ email: userEmail });
        if (!user) {
            throw new HttpException({
                status: HttpStatus.NOT_FOUND,
                error: 'User not found',
            }, HttpStatus.NOT_FOUND);
        }

        // Update the user information
        if (username) user.username = username;
        if (password) {
            const { salt, hashPassword } = await generateSaltAndHash(password);
            user.hash_password = hashPassword;
            user.salt = salt;
        }
        if (image) user.image = image;

        // Save the updated user information
        await user.save();

        return { message: 'User information updated successfully' };
    }

    async getUserById(userId: string): Promise<User> {
        return this.accountModel.findById(userId);
    }

    async getSelfInfo(userToken: string): Promise<User> {
        let decodedToken;
        try {
            decodedToken = this.jwtService.verify(userToken);
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    
        const email = decodedToken.email;
    
        // Find the user by email
        const user = await this.accountModel.findOne({ email });
    
        if (!user) {
            throw new HttpException({
                status: HttpStatus.NOT_FOUND,
                error: 'User not found',
            }, HttpStatus.NOT_FOUND);
        }
    
        return user;
    }
}

import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';  // Import the base JwtAuthGuard
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminAuthGuard extends JwtAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, jwtService: JwtService) {
    super(jwtService);  // Call the parent constructor with jwtService
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First, verify the JWT using the base JwtAuthGuard logic
    await super.canActivate(context);

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user.role !== 'admin') {
      throw new UnauthorizedException('You do not have permission to perform this action');
    }

    return true;
  }
}

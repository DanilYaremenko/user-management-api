import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { DecodedToken, Token } from './types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  getToken(): Token {
    const payload = { id: uuidv4() };
    const token = this.jwtService.sign(payload);

    return { token };
  }

  async verifyToken(token: string): Promise<DecodedToken> {
    try {
      const decoded = this.jwtService.verify(token);

      const tokenExists = await this.prisma.usedToken.findUnique({
        where: { token },
      });

      if (tokenExists) {
        throw new UnauthorizedException('Token has already been used');
      }

      return decoded;
    } catch (error) {
      this.handleTokenError(error);
    }
  }

  async markTokenAsUsed(token: string): Promise<void> {
    await this.prisma.usedToken.create({
      data: { token },
    });
  }

  private handleTokenError(error: any): void {
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedException('Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new UnauthorizedException('Invalid token');
    } else {
      throw new HttpException(error.message, 500);
    }
  }
}

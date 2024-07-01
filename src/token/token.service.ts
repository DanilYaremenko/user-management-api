import {
  HttpException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { Token } from './types';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { JWT_TTL } from '../common/constants';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async getToken(): Promise<Token> {
    const payload = { id: uuidv4() };
    const token = this.jwtService.sign(payload);

    await this.cacheManager.set(token, payload, JWT_TTL);

    return { token };
  }

  async verifyToken(token: string): Promise<void> {
    try {
      this.jwtService.verify(token);
      const tokenCached = await this.cacheManager.get(token);

      if (!tokenCached) {
        throw new UnauthorizedException('Token has already been used');
      }
    } catch (error) {
      this.handleTokenError(error);
    }
  }

  async markTokenAsUsed(token: string): Promise<void> {
    try {
      this.cacheManager.del(token);
    } catch (error) {
      throw new HttpException('Error marking token as used', 500);
    }
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

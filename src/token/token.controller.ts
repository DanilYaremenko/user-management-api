import { Controller, Get } from '@nestjs/common';
import { TokenService } from './token.service';
import { Token } from './types';

@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Get()
  getToken(): Promise<Token> {
    return this.tokenService.getToken();
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Position } from '@prisma/client';

@Injectable()
export class PositionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllPositions(): Promise<Position[]> {
    return await this.prisma.position.findMany();
  }
}

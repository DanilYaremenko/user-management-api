import { Controller, Get, NotFoundException } from '@nestjs/common';
import { PositionsService } from './positions.service';
import { Position } from './types';

@Controller('positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Get()
  async getAllPositions(): Promise<{ positions: Position[] }> {
    const result = await this.positionsService.getAllPositions();

    if (result.length === 0) {
      throw new NotFoundException('No positions found');
    }

    const positions: Position[] = result.map((pos) => ({
      id: pos.id,
      name: pos.name,
    }));

    return { positions };
  }
}

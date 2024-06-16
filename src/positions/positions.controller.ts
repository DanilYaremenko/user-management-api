import { Controller, Get, NotFoundException } from '@nestjs/common';
import { PositionsService } from './positions.service';
import { PositionDto } from './dto';

@Controller('positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Get()
  async getAllPositions(): Promise<{ positions: PositionDto[] }> {
    const result = await this.positionsService.getAllPositions();

    if (result.length === 0) {
      throw new NotFoundException('No positions found');
    }

    const positions: PositionDto[] = result.map((pos) => ({
      id: pos.id,
      name: pos.name,
    }));

    console.log(positions);

    return { positions };
  }
}

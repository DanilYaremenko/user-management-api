import { Controller, Get, NotFoundException } from '@nestjs/common';
import { PositionsService } from './positions.service';

@Controller('positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Get()
  async getAllPositions(): Promise<any> {
    const result = await this.positionsService.getAllPositions();

    if (result.length === 0) {
      throw new NotFoundException('No positions found');
    }

    const positions: any[] = result.map((pos) => ({
      id: pos.id,
      name: pos.name,
    }));

    // return { success: true, positions: positions };
    return positions;
  }
}

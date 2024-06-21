import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  FileTypeValidator,
  ImageResolutionValidator,
  MaxFileSizeValidator,
} from './validators/';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  @UseInterceptors(FileInterceptor('photo'))
  async registerUser(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
          new FileTypeValidator({ fileType: 'jpeg' }),
          new ImageResolutionValidator({ minWidth: 70, minHeight: 70 }),
        ],
      }),
    )
    photo: Express.Multer.File,
    @Body() dto: RegisterUserDto,
    @Headers('token') token: string,
  ) {
    return this.userService.registerUser(dto, photo, token);
  }

  @Get()
  getAllUsers(
    @Query('page', ParseIntPipe) page: number,
    @Query('count', ParseIntPipe) count: number,
  ) {
    return this.userService.getAllUsers(page, count);
  }

  @Get(':id')
  getUserById(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.userService.getUserById(id);
  }
}

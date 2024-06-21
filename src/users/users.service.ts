import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterUserDto } from './dto';
import tinify from 'tinify';
import { resolve } from 'path';
import * as fs from 'fs';
import { TokenService } from '../token/token.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  async registerUser(
    dto: RegisterUserDto,
    photo: Express.Multer.File,
    token: string,
  ) {
    const decodedToken = await this.tokenService.verifyToken(token);

    const userExists = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { phone: dto.phone }],
      },
    });

    if (userExists) {
      throw new ConflictException(
        'User with this phone or email already exists',
      );
    }

    const imageName = `photo-${Date.now()}.jpg`;
    const imageUrl = this.getUrl() + '/uploads/' + imageName;

    await this.cropImageAndSave(photo, imageName);

    const user = await this.prisma.user.create({
      data: {
        ...dto,
        photo: imageUrl,
      },
    });

    await this.tokenService.markTokenAsUsed(token);

    return user;
  }

  async getAllUsers(page: number, count: number) {
    const totalUsers = await this.prisma.user.count();
    const totalPages = Math.ceil(totalUsers / count);

    if (page > totalPages || page < 1) {
      throw new NotFoundException('Page not found');
    }

    const users = await this.prisma.user.findMany({
      skip: (page - 1) * count,
      take: count,
    });

    const nextUrl =
      page < totalPages
        ? `${this.getUrl()}/users?page=${page + 1}&count=${count}`
        : null;
    const prevUrl =
      page > 1
        ? `${this.getUrl()}/users?page=${page - 1}&count=${count}`
        : null;

    return {
      page,
      total_pages: totalPages,
      total_users: totalUsers,
      count,
      links: {
        next_url: nextUrl,
        prev_url: prevUrl,
      },
      users,
    };
  }

  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private getUrl(): string {
    return process.env.BASE_URL || 'http://localhost:3000';
  }

  private async cropImageAndSave(
    photo: Express.Multer.File,
    imageName: string,
  ) {
    const _tinyApiKey = process.env.TINYPNG_API_KEY;
    tinify.key = _tinyApiKey;

    const croppedImageBuffer = await tinify
      .fromBuffer(photo.buffer)
      .resize({ method: 'cover', width: 70, height: 70 })
      .toBuffer();

    const dirPath = resolve(__dirname, '../../../uploads');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const imagePath = resolve(dirPath, imageName);

    fs.writeFileSync(imagePath, croppedImageBuffer);
  }
}

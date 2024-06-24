import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterUserDto } from './dto';
import { TokenService } from '../token/token.service';
import { v2 as cloudinary } from 'cloudinary';
import { GetUsersResponse, RegisterUserResponse } from './types';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async registerUser(
    dto: RegisterUserDto,
    photo: Express.Multer.File,
    token: string,
  ): Promise<RegisterUserResponse> {
    await this.tokenService.verifyToken(token);

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

    const imageUrl = await this.cropImageAndUpload(photo);

    const user = await this.prisma.user.create({
      data: {
        ...dto,
        photo: imageUrl,
      },
    });

    await this.tokenService.markTokenAsUsed(token);

    return {
      user_id: user.id,
      message: 'New user successfully registered',
    };
  }

  async getAllUsers(page: number, count: number): Promise<GetUsersResponse> {
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

  async getUserById(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private getUrl(): string {
    return process.env.BASE_URL || 'http://localhost:3000';
  }

  private async cropImageAndUpload(
    photo: Express.Multer.File,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'user_photos',
            width: 70,
            height: 70,
            crop: 'fill',
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result.secure_url);
            }
          },
        )
        .end(photo.buffer);
    });
  }
}

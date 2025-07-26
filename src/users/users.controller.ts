import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ForbiddenException, UseInterceptors, BadRequestException, UploadedFile } from '@nestjs/common';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import * as path from 'path';
import { diskStorage } from 'multer';
import type { File as MulterFile } from 'multer';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { CreateUserCheckDto, CreateUserDto } from './dtos/create-user.dto';
import { UpdatePasswordDto } from './dtos/update-password.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
    @Get()
    @UseGuards(AdminGuard)
    @Throttle({ default: { limit: 100, ttl: 60 } })
    findAll() {
        return this.userService.findAll();
    }

    @ApiOperation({ summary: 'Get a user by ID' })
    @ApiResponse({ status: 200, description: 'User retrieved successfully' })
    @Get(':id')
    @UseGuards(AdminGuard)
    @Throttle({ default: { limit: 100, ttl: 60 } })
    findOne(@Param('id') id: string) {
        return this.userService.findOne(+id);
    }

    @ApiOperation({ summary: 'User registration verification' })
    @ApiResponse({ status: 200, description: 'User registration verified successfully' })
    @Post('registration/check')
    @Throttle({ default: { limit: 100, ttl: 60 } })
    registrationCheck(@Body() data: CreateUserCheckDto) {
        return this.userService.registrationCheck(data);
    }

    @ApiOperation({ summary: 'User registration' })
    @ApiResponse({ status: 200, description: 'User registered successfully' })
    @Post('activation')
    @Throttle({ default: { limit: 100, ttl: 60 } })
    registration(@Body() data: CreateUserDto) {
        return this.userService.registration(data);
    }

    @ApiOperation({ summary: 'Create a new admin' })
    @ApiResponse({ status: 200, description: 'Admin created successfully' })
    @Post('registration/admin')
    @UseGuards(AdminGuard)
    @Throttle({ default: { limit: 100, ttl: 60 } })
    registrationAdmin(@Body() data: CreateUserDto) {
        return this.userService.registrationAdmin(data);
    }

    @ApiOperation({ summary: 'Update user password' })
    @ApiResponse({ status: 200, description: 'User password updated successfully' })
    @Post(':id/update/password')
    @UseGuards(JwtGuard)
    updatePassword(@Param('id') id: string, @Body() data: UpdatePasswordDto, @Req() request: Request) {
        if (+id !== request.user?.id) {
            throw new ForbiddenException('You must be logged in to update your password');
        }
        return this.userService.updatePassword(+id, data);
    }

    @ApiOperation({ summary: 'Update user details' })
    @ApiResponse({ status: 200, description: 'User updated successfully' })
    @Patch(':id')
    @UseGuards(JwtGuard)
    @Throttle({ default: { limit: 100, ttl: 60 } })
    update(@Param('id') id: string, @Body() data: UpdateUserDto, @Req() request: Request) {
        if (+id !== request.user?.id) {
            throw new ForbiddenException('You must be logged in to update your details');
        }
        return this.userService.update(+id, data);
    }

    @ApiOperation({ summary: 'Update user photo' })
    @ApiResponse({ status: 200, description: 'User photo updated successfully' })
    @Post(':id/photo')
    @UseGuards(JwtGuard)
    @UseInterceptors(FileInterceptor('photo', {
        storage: diskStorage({
            destination: './uploads/users',
            filename: (req, file, cb) => {
                const ext = path.extname(file.originalname);
                cb(null, `user_${req.params.id}${ext}`);
            }
        }),
        fileFilter: (_req, file, cb) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
                return cb(new BadRequestException('Only image files are allowed!'), false);
            }
            cb(null, true);
        }
    }))
    async uploadPhoto(@Param('id') id: string, @UploadedFile() file: MulterFile, @Req() request: Request) {
        if (+id !== request.user?.id) {
            throw new ForbiddenException('You must be logged in to update your photo');
        }
        return this.userService.updatePhoto(+id, file?.path);
    }

    @ApiOperation({ summary: 'Delete user photo' })
    @ApiResponse({ status: 200, description: 'User photo deleted successfully' })
    @Delete(':id/photo')
    @UseGuards(JwtGuard)
    async deletePhoto(@Param('id') id: string, @Req() request: Request) {
        if (+id !== request.user?.id) {
            throw new ForbiddenException('You must be logged in to delete your photo');
        }
        return this.userService.deletePhoto(+id);
    }

    @ApiOperation({ summary: 'Delete a user by ID' })
    @ApiResponse({ status: 200, description: 'User deleted successfully' })
    @Delete(':id')
    @UseGuards(AdminGuard)
    @Throttle({ default: { limit: 100, ttl: 60 } })
    remove(@Param('id') id: string) {
        return this.userService.remove(+id);
    }
}
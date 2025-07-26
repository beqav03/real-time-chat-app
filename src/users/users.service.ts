import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs/promises';
import { Validators } from 'src/common/validators';
import { UsersRepository } from './users.repository';
import { AuditLogService } from 'src/audit/audit-log.service';
import { CreateUserCheckDto, CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UpdatePasswordDto } from './dtos/update-password.dto';
import { OtpService } from 'src/otp/otp.service';

@Injectable()
export class UsersService {
    constructor(
        private readonly userRepo: UsersRepository,
        private readonly auditLogService: AuditLogService,
        private readonly otpService: OtpService
    ) {}

    findAll() {
        const users = this.userRepo.findAll();
        if (!users) {
            throw new NotFoundException('No users found');
        }

        return users;
    }

    async findOne(id: number) {
        const users = await this.userRepo.findOne(id);
        if (!users) {
            throw new NotFoundException(`Users with ID ${id} not found`);
        }

        return users;
    }

    async findByEmail(email: string) {
        const users = await this.userRepo.checkExistUser({ email });
        if (!users) {
            throw new NotFoundException(`Users with email ${email} not found`);
        }

        return users;
    }

    async registrationCheck(data: CreateUserCheckDto) {
        if (data.password !== data.confirmPassword) {
            throw new BadRequestException('Passwords do not match');
        }

        if (!Validators.isValidEmail(data.email)) {
            throw new BadRequestException('Invalid email format');
        }

        const existingUser = await this.userRepo.checkExistUser({email: data.email});
        if (existingUser) {
            throw new BadRequestException('Users with this email or phone already exists');
        }

        if (!Validators.isValidPassword(data.password)) {
            throw new BadRequestException('Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters');
        }

        const pendingId = await this.otpService.sendOneTimeCode(data.email);
        return { pendingId, message: 'OTP sent to email for registration' };
    }

    async registrationAdmin(data: CreateUserDto) {
        const existingAdmin = await this.userRepo.checkExistAdmin({ email: data.email });
        if (existingAdmin) {
            throw new BadRequestException('Admin with this email already exists');
        }  

        if (data.password !== data.confirmPassword) {
            throw new BadRequestException('Passwords do not match');
        }

        if (!Validators.isValidEmail(data.email)) {
            throw new BadRequestException('Invalid email format');
        }

        if (!Validators.isValidPassword(data.password)) {
            throw new BadRequestException('Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters');
        }

        const createdAdmin = await this.userRepo.createAdmin(data);
        await this.auditLogService.log('admin_registration', createdAdmin.id, { target: data.email });
        return { message: 'Admin registration completed successfully' };
    }

    async registration(data: CreateUserDto) {
        const otpCheck = await this.otpService.verifyOneTimeCode(+data.pendingId, data.otp);
        if (!otpCheck) {
            throw new BadRequestException('Invalid or expired OTP');
        }

        const existingUser = await this.userRepo.checkExistUser({ email: data.email });
        if (existingUser) {
            throw new BadRequestException('Users with this email already exists');
        }
        if (!Validators.isValidPassword(data.password)) {
            throw new BadRequestException('Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters');
        }

        const newUser = await this.userRepo.create(data);
        await this.auditLogService.log('user_registration', newUser.id, { target: data.email });
        return { message: 'User registration completed successfully', userId: newUser.id };
    }

    async update(id: number, data: UpdateUserDto) {
        const existingUser = await this.findOne(id);
        if (!existingUser) {
            throw new BadRequestException('User not found');
        }

        const validUpdateKeys = Object.keys(data).filter(key => data[key] !== undefined);
        if (validUpdateKeys.length === 0) {
            throw new BadRequestException('No update data provided');
        }

        if (data.email) {
            if (!Validators.isValidEmail(data.email)) {
                throw new BadRequestException('Invalid email format');
            }

            const emailExists = await this.userRepo.checkExistUser({ email: data.email });
            if (emailExists && emailExists.id !== id) {
                throw new BadRequestException('Email is already in use');
            }
        }

        await this.userRepo.update(id, data);
        await this.auditLogService.log('user_update', id, { target: id });
        return { message: 'Update completed successfully' };
    }

    async updateAttempts(id: number, attempts?: number): Promise<boolean> {
        const existingUser = await this.findOne(id);
        if (!existingUser) {
            throw new BadRequestException('Users not found');
        }

        if (attempts === undefined || attempts === null) {
            attempts = existingUser.loginAttempts + 1;
        }

        const add = await this.userRepo.updateAttempts(id, attempts);
        if (!add) {
            throw new BadRequestException('Failed to update login attempts');
        }

        if (existingUser.loginAttempts >= 5) {
            await this.addBlock(id);
        }

        return true;
    }

    async addBlock(id: number): Promise<boolean> {
        const existingUser = await this.findOne(id);
        if (!existingUser) {
            throw new BadRequestException('Users not found');
        }

        const add = await this.userRepo.blockUser(id);
        if (!add) {
            throw new BadRequestException('Failed to update status');
        }

        return true;
    }

    async updatePassword(id: number, data: UpdatePasswordDto) {
        const user = await this.userRepo.findOne(id);
        if (!user) {
            throw new BadRequestException('User not found');
        }

        if (data.oldPassword !== user.password) {
            throw new BadRequestException('Old password is incorrect');
        }

        const newPassword = data.newPassword;
        const confirmNewPassword = data.confirmNewPassword;
        if (newPassword !== confirmNewPassword) {
            throw new BadRequestException('New password and confirm password do not match');
        }

        if (!Validators.isValidPassword(newPassword)) {
            throw new BadRequestException('Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters');
        }

        await this.userRepo.updatePassword(id, newPassword);
        await this.auditLogService.log('user_password_update', id, { target: id });
        return { message: 'Password updated successfully' };
    }

    async updatePasswordByEmail (id: number, email: string, newPassword: string) {
        const user = await this.userRepo.findOne(id);
        if (!user) {
            throw new BadRequestException('User not found');
        }

        if (!Validators.isValidPassword(newPassword)) {
            throw new BadRequestException('Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters');
        }

        await this.userRepo.updatePassword(id, newPassword);
        await this.auditLogService.log('user_password_update_by_email', id, { target: email });
        return { message: 'Password updated successfully' };
    }

    async updatePhoto(id: number, photoPath: string) {
        const user = await this.userRepo.findOne(id);
        if (!user) throw new NotFoundException('User not found');

        if (user.photoUrl) {
            try { await fs.unlink(user.photoUrl); } catch {}

        }
        user.photoUrl = photoPath;
        await this.userRepo.updatePhoto(user);
        return { message: 'Photo updated successfully', photoUrl: photoPath };
    }

    async deletePhoto(id: number) {
        const user = await this.userRepo.findOne(id);
        if (!user) throw new NotFoundException('User not found');

        if (user.photoUrl) {
            try { await fs.unlink(user.photoUrl); } catch {}
            user.photoUrl = null;
            await this.userRepo.deletePhoto(user);
        }
        return { message: 'Photo deleted successfully' };
    }

    async remove(id: number) {
        const existingUser = await this.findOne(id);
        if (!existingUser) {
            throw new BadRequestException('Users not found');
        }

        await this.userRepo.delete(id);

        return { message: 'delete completed successfully' };
    }
}
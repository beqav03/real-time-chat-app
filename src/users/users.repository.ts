import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { CryptoUtils } from "src/utils/crypto.util";
import { User } from "./entities/user.entity";
import { userRoles, userStatus } from "src/common/enume/enum";
import { CreateUserDto } from "./dtos/create-user.dto";
import { UpdateUserDto } from "./dtos/update-user.dto";

@Injectable()
export class UsersRepository {
    constructor(
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        private readonly configService: ConfigService
    ) {}

    async findAll(): Promise<User[] | null> {
        return this.userRepo.createQueryBuilder('user')
            .where('user.status = :status', { status: userStatus.ACTIVE })
            .andWhere('user.role != :role', { role: userRoles.ADMIN })
            .getMany();
    }

    async findOne(userId: number): Promise<User | null> {
        return this.userRepo.createQueryBuilder('user')
            .where('user.id = :id', { id: userId })
            .andWhere('user.status = :status', { status: userStatus.ACTIVE })
            .andWhere('user.role != :role', { role: userRoles.ADMIN })
            .getOne();
    }

    async checkExistAdmin(data: { email: string }): Promise<User | null> {
        return this.userRepo.createQueryBuilder('user')
            .where('user.email = :email', { email: data.email })
            .andWhere('user.status IN (:...statuses)', { statuses: [userStatus.ACTIVE, userStatus.BLOCKED] })
            .andWhere('user.role = :role', { role: userRoles.ADMIN })
            .getOne();
    }

    async checkExistUser(data: { email: string}): Promise<User | null> {
        return this.userRepo.createQueryBuilder('user')
            .where('user.email = :email', { email: data.email })
            .andWhere('user.status IN (:...statuses)', { statuses: [userStatus.ACTIVE, userStatus.BLOCKED] })
            .andWhere('user.role = :role', { role: userRoles.USER })
            .getOne();
    }

    async create(data: CreateUserDto) {
        const hashedPassword = await CryptoUtils.hashString(data.password, this.configService);
        const newUser = this.userRepo.create({
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: userRoles.USER,
            status: userStatus.ACTIVE,
        });
        return await this.userRepo.save(newUser);
    }

    async createAdmin(data: CreateUserDto) {
        const hashedPassword = await CryptoUtils.hashString(data.password, this.configService);
        const newUser = this.userRepo.create({
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: data.role,
            status: userStatus.ACTIVE,
        });
        return await this.userRepo.save(newUser);
    }

    async update(id: number, data: UpdateUserDto) {
        const user = await this.userRepo.update(id, data);
        return user;
    }

    async updatePassword(id: number, newPassword: string) {
        const hashedPassword = await CryptoUtils.hashString(newPassword, this.configService);
        const updatePassword = await this.userRepo.update(id, { password: hashedPassword });
        return updatePassword;
    }

    async updateAttempts(id: number, attempts: number) {
        return await this.userRepo.update(id, { loginAttempts: attempts });
    }

    async blockUser(id: number) {
        return await this.userRepo.update(id, { status: userStatus.BLOCKED });
    }

    async updatePhoto(user: User): Promise<User> {
        return this.userRepo.save(user);
    }

    async deletePhoto(user: User): Promise<User> {
        user.photoUrl = null;
        return this.userRepo.save(user);
    }

    async delete(id: number) {
        return await this.userRepo
            .createQueryBuilder('user')
            .update()
            .set({ status: userStatus.DELETED })
            .set({ deletedAt: new Date() })
            .where('user.id = :id', { id })
            .execute();
    }
}
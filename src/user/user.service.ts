import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        // 1️⃣ Check if email exists
        const existingUser = await this.userModel.findOne({ email: createUserDto.email });
        if (existingUser) {
            throw new ConflictException({
                errors: { email: ['Email already exists'] },
            });
        }

        // 2️⃣ Hash password
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        // 3️⃣ Create user
        try {
            return await this.userModel.create({ ...createUserDto, password: hashedPassword });
        } catch (error: any) {
            // Handle MongoDB duplicate key (race condition)
            if (error.code === 11000) {
                throw new ConflictException({
                    errors: { email: ['Email already exists'] },
                });
            }

            console.error('Create User Error:', error);
            throw new InternalServerErrorException({
                errors: { server: ['Failed to create user'] },
            });
        }
    }


    async findAll(): Promise<User[]> {
        try {
            return this.userModel.find().exec();
        } catch (error) {
            console.error('Find All Users Error:', error);
            throw new InternalServerErrorException('Failed to fetch users');
        }
    }

    async findOne(id: string): Promise<User> {
        try {
            const user = await this.userModel.findById(id).exec();
            if (!user) throw new NotFoundException(`User #${id} not found`);
            return user;
        } catch (error) {
            console.error(`Find User #${id} Error:`, error);
            throw new InternalServerErrorException('Failed to fetch user');
        }
    }
    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        try {
            if (updateUserDto.password) {
                updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
            }

            const updatedUser = await this.userModel
                .findByIdAndUpdate(id, updateUserDto, { new: true })
                .exec();

            if (!updatedUser) throw new NotFoundException(`User #${id} not found`);
            return updatedUser;
        } catch (error) {
            console.error(`Update User #${id} Error:`, error);
            throw new InternalServerErrorException('Failed to update user');
        }
    }

    async remove(id: string): Promise<User> {
        try {
            const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
            if (!deletedUser) throw new NotFoundException(`User #${id} not found`);
            return deletedUser;
        } catch (error) {
            console.error(`Delete User #${id} Error:`, error);
            throw new InternalServerErrorException('Failed to delete user');
        }
    }
    async findByEmail(email: string): Promise<User> {
        const user = await this.userModel.findOne({ email }).exec();
        if (!user) throw new NotFoundException('User not found');
        return user;
    }
}

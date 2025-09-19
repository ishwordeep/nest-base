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

    async createUser(createUserDto: CreateUserDto): Promise<User> {

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        let newUser;
        try {
            newUser = await this.userModel.create({ ...createUserDto, password: hashedPassword });
        } catch (error: any) {
            // Handle MongoDB duplicate key (race condition)
            if (error.code === 11000) {
                throw new ConflictException("Email already exists. Please use a different email address.");
            }

            console.error("Create User Error:", error);
            throw new InternalServerErrorException("Failed to create user");
        }

        return newUser.toObject() as User;
    }



    async findAll(): Promise<User[]> {
        try {
            return this.userModel.find().exec();
        } catch (error) {
            console.error('Find All Users Error:', error);
            throw new InternalServerErrorException({
                message: "Failed to fetch users",
                // errors: { "Failed to fetch users" }
            });
        }
    }

    async findOne(id: string): Promise<User> {
        let userDoc;

        try {
            userDoc = await this.userModel.findById(id).exec();
        } catch (err) {
            throw new InternalServerErrorException("Failed to fetch user");
        }
        if (!userDoc) {
            throw new NotFoundException(`User #${id} not found`);
        }

        return userDoc.toObject() as User;
    }



    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        try {
            if (updateUserDto.password) {
                updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
            }

            const updatedUser = await this.userModel
                .findByIdAndUpdate(id, updateUserDto, { new: true })
                .exec();

            if (!updatedUser) {
                throw new NotFoundException({
                    message: `User #${id} not found`,
                });
            }
            return updatedUser;
        } catch (error) {
            console.error(`Update User #${id} Error:`, error);
            throw new InternalServerErrorException({
                message: "Failed to update user",
                errors: { server: ["Failed to update user"] }
            });
        }
    }

     
    async findByEmail(email: string): Promise<User> {
        const user = await this.userModel.findOne({ email }).exec();
        if (!user) {
            throw new NotFoundException({
                message: "User not found",
            });
        }
        return user;
    }
}

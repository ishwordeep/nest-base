import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateShippingAddressDto } from './dto/create-shipping-address.dto';

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

    async createShippingAddress(userId: string, createShippingAddressDto: CreateShippingAddressDto){
        try {
            const user = await this.userModel.findById(userId).exec();

            if (!user) {
                throw new NotFoundException(`User #${userId} not found`);
            }

            

            // Handle isDefault flag
            const isNewAddressDefault = createShippingAddressDto.isDefault === true;

            // Get current addresses or initialize empty array
            const currentAddresses = user.shippingAddresses || [];

            // Create update operation based on isDefault flag
            let updateOperation;

            if (isNewAddressDefault) {
                // If new address is default, set all existing addresses to non-default
                // and add the new address as default
                updateOperation = {
                    $set: {
                        'shippingAddresses.$[].isDefault': false
                    },
                    $push: {
                        shippingAddresses: { ...createShippingAddressDto, isDefault: true }
                    }
                };
            } else {
                // If no addresses exist yet, make this one default regardless of input
                const shouldMakeDefault = currentAddresses.length === 0;

                // Add the new address (default only if it's the first address)
                updateOperation = {
                    $push: {
                        shippingAddresses: { 
                            ...createShippingAddressDto, 
                            isDefault: shouldMakeDefault 
                        }
                    }
                };
            }

            // Update the user with the new shipping address
            const updatedUser = await this.userModel
                .findByIdAndUpdate(
                    userId,
                    updateOperation,
                    { new: true }
                )
                .exec();

            return updatedUser;
        } catch (error) {
            console.error(`Create Shipping Address for User #${userId} Error:`, error);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException({
                message: "Failed to create shipping address",
                errors: { server: ["Failed to create shipping address"] }
            });
        }
    }
}

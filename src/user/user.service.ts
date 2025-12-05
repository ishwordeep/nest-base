import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { ShippingAddress, User } from './schema/user.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateShippingAddressDto } from './dto/create-shipping-address.dto';
import { UpdateShippingAddressDto } from './dto/update-shipping-address.dto';

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

   async createShippingAddress(userId: string, dto: CreateShippingAddressDto) {
    try {
        const user = await this.userModel.findById(userId);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Determine if this new address should be default
        let shouldBeDefault = dto.isDefault ?? false;

        // If user has no default address yet, force this one to be default
        const hasDefaultAlready = user.shippingAddresses.some(
            (addr) => addr.isDefault === true,
        );

        if (!hasDefaultAlready) {
            shouldBeDefault = true;
        }

        // If this address is default, unset default on all existing addresses
        if (shouldBeDefault) {
            user.shippingAddresses.forEach((addr: ShippingAddress) => {
                addr.isDefault = false;
            });
        }

        const newAddress = {
            street: dto.street,
            apartment: dto.apartment,
            city: dto.city,
            state: dto.state,
            zipCode: dto.zipCode,
            country: dto.country ?? 'USA',
            isDefault: shouldBeDefault,
        };

        console.log("newAddress:", newAddress);

        user.shippingAddresses.push(newAddress as any);

        await user.save();

        return user.shippingAddresses[user.shippingAddresses.length - 1];
    } catch (error) {
        console.error("❌ ERROR in createShippingAddress:", error);
        console.error("STACK TRACE:", error.stack);
        throw error; // rethrow so Nest handles it
    }
}

    async updateShippingAddress(userId: string, addressId: string, dto: UpdateShippingAddressDto) {
        try {
            if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(addressId)) {
                throw new NotFoundException('Invalid user ID or address ID');
            }

            const user = await this.userModel.findById(userId);

            if (!user) {
                throw new NotFoundException('User not found');
            }

            // Find the address to update
            const addressIndex = user.shippingAddresses.findIndex(
                (addr) => (addr._id as any).toString() === addressId,
            );

            if (addressIndex === -1) {
                throw new NotFoundException('Shipping address not found');
            }

            // Update the address fields
            const updatedAddress = {
                ...user.shippingAddresses[addressIndex].toObject(),
                ...dto,
            };

            // Handle default address logic
            if (dto.isDefault === true) {
                // If this address is being set as default, unset default on all other addresses
                user.shippingAddresses.forEach((addr: ShippingAddress, index) => {
                    if (index !== addressIndex) {
                        addr.isDefault = false;
                    }
                });
            }

            // Update the address in the array
            user.shippingAddresses[addressIndex] = updatedAddress as any;

            await user.save();

            return user.shippingAddresses[addressIndex];
        } catch (error) {
            console.error("❌ ERROR in updateShippingAddress:", error);
            console.error("STACK TRACE:", error.stack);
            throw error;
        }
    }

    async deleteShippingAddress(userId: string, addressId: string) {
        try {
            if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(addressId)) {
                throw new NotFoundException('Invalid user ID or address ID');
            }

            const user = await this.userModel.findById(userId);

            if (!user) {
                throw new NotFoundException('User not found');
            }

            // Find the address to delete
            const addressIndex = user.shippingAddresses.findIndex(
                (addr: ShippingAddress) => (addr._id as any).toString() === addressId,
            );

            if (addressIndex === -1) {
                throw new NotFoundException('Shipping address not found');
            }

            // Check if the address being deleted is the default
            const isDefault = user.shippingAddresses[addressIndex].isDefault;

            // Remove the address
            user.shippingAddresses.splice(addressIndex, 1);

            // If the deleted address was the default and there are other addresses,
            // set the first remaining address as the default
            if (isDefault && user.shippingAddresses.length > 0) {
                user.shippingAddresses[0].isDefault = true;
            }

            await user.save();

            return { success: true, message: 'Shipping address deleted successfully' };
        } catch (error) {
            console.error("❌ ERROR in deleteShippingAddress:", error);
            console.error("STACK TRACE:", error.stack);
            throw error;
        }
    }
}

import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from './schema/user.schema';
import { CreateShippingAddressDto } from './dto/create-shipping-address.dto';
import { UpdateShippingAddressDto } from './dto/update-shipping-address.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  findOne(@Request() req) {
    const userId = req.user.sub;
    return this.userService.findOne(userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('shipping-address')
  createShippingAddress(
    @Request() req,
    @Body() createShippingAddressDto: CreateShippingAddressDto,
  ) {
    const userId = req.user.sub;
    console.log("user:",userId);
    return this.userService.createShippingAddress(userId, createShippingAddressDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('shipping-address/:id')
  updateShippingAddress(
    @Request() req,
    @Param('id') addressId: string,
    @Body() updateShippingAddressDto: UpdateShippingAddressDto,
  ) {
    const userId = req.user.sub;
    return this.userService.updateShippingAddress(userId, addressId, updateShippingAddressDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('shipping-address/:id')
  deleteShippingAddress(
    @Request() req,
    @Param('id') addressId: string,
  ) {
    const userId = req.user.sub;
    return this.userService.deleteShippingAddress(userId, addressId);
  }
}

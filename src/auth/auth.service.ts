import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from 'src/user/schema/user.schema';


@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService
    ) { }
   async login(dto: LoginDto) {
  try {
    const user = await this.userService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException({
        message: "Invalid email or password.",
        errors: { credentials: ["Invalid email or password"] },
      });
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException({
        message: "Invalid email or password.",
        errors: { credentials: ["Invalid email or password"] },
      });
    }

    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
    };

    return {
      success: true,
      message: "Login successful.",
      data: {
        accessToken: this.jwtService.sign(payload, { expiresIn: "1d" }),
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    throw new UnauthorizedException({
      message: "Invalid email or password.",
      errors: { credentials: ["Invalid email or password"] },
    });
  }
}

  async register(dto: RegisterDto) {
    try {
      // Create user with USER role
      const user = await this.userService.createUser({
        email: dto.email,
        password: dto.password,
        role: UserRole.CUSTOMER,
        ...(dto.name && { name: dto.name }),
        ...(dto.phone && { phone: dto.phone }),
      });

      // Generate JWT token
      const payload = {
        sub: user._id,
        email: user.email,
        role: user.role,
      };

      return {
        success: true,
        message: "Registration successful.",
        data: {
          accessToken: this.jwtService.sign(payload, { expiresIn: "1d" }),
        },
      };
    } catch (error) {
      console.error("Registration error:", error);

      if (error instanceof ConflictException) {
        throw error; // Re-throw email conflict error
      }

      throw new InternalServerErrorException({
        message: "Failed to register user.",
        errors: { server: ["Failed to register user"] },
      });
    }
  }
}

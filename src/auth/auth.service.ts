import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';


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
                throw new UnauthorizedException('Invalid credentials');
            }

            const isPasswordValid = await bcrypt.compare(dto.password, user.password);

            if (!isPasswordValid) {
                throw new UnauthorizedException('Invalid credentials');
            }

            const payload = {
                sub: user._id,
                email: user.email
            };

            // ✅ No need to manually set secret here if JwtModule was configured correctly
            return {
                accessToken: this.jwtService.sign(payload, { expiresIn: '15m' }),
            };
        } catch (error) {
            console.error('Login error:', error);
            throw new UnauthorizedException('Invalid credentials');
        }
    }
}

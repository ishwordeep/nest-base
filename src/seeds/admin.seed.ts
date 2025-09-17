
import { AppModule } from '../app.module'
import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserRole } from 'src/user/schema/user.schema';
import { UserService } from 'src/user/user.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userService = app.get(UserService);

  const adminEmail = 'admin@admin.com';

  const dto: CreateUserDto = {
    email: adminEmail,
    password: 'Admin@123', // Plain text, let service hash it
    role: UserRole.ADMIN,
  };


  const admin = await userService.createUser(dto);

  console.log('✅ Admin created: email:', dto.email, " password:", dto.password);
  await app.close();
}

bootstrap();

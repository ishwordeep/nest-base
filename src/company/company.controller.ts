import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/user/schema/user.schema';
import { User } from 'src/decorators/user.decorator';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) { }



  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() createCompanyDto: CreateCompanyDto, @User('_id') userId: string) {
    return this.companyService.create(createCompanyDto, userId)
  }
}

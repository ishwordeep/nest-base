import { Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Company, CompanyDocument } from './schema/create.schema';
import { Model } from 'mongoose';

@Injectable()
export class CompanyService {
    constructor(@InjectModel(Company.name) private companyModel: Model<CompanyDocument>) { }
    async create(createCompanyDto: CreateCompanyDto, userId: string): Promise<any> {
        const companyData = { ...createCompanyDto, createdBy: userId };
        return this.companyModel.create(companyData);
    }
}

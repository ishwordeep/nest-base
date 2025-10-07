import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Setting, SettingDocument } from './schema/create.schema';
import { CreateSettingDto } from './dto/create.dto';
import { Model } from 'mongoose';

@Injectable()
export class SettingService {
    constructor(@InjectModel(Setting.name) private settingModel: Model<SettingDocument>) { }
    async create(createSettingDto: CreateSettingDto): Promise<any> {
        const SettingData = { ...createSettingDto};
        return this.settingModel.create(SettingData);
    }
}

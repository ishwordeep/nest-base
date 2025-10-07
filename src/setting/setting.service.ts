import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Setting, SettingDocument } from './schema/create.schema';
import { CreateSettingDto } from './dto/create.dto';
import { Model } from 'mongoose';
import { UpdateSettingDto } from './dto/update.dto';

@Injectable()
export class SettingService {
    constructor(@InjectModel(Setting.name) private settingModel: Model<SettingDocument>) { }

    async create(createSettingDto: CreateSettingDto): Promise<any> {
        const SettingData = { ...createSettingDto };
        return this.settingModel.create(SettingData);
    }

    async findOne(): Promise<Setting | null> {
        return this.settingModel.findOne({}, {}, { sort: { createdAt: -1 } }).lean();
    }

    async update(id: string, dto: UpdateSettingDto): Promise<Setting> {
        const updated = await this.settingModel
            .findByIdAndUpdate(id, { $set: dto }, { new: true })
            .lean();

        if (!updated) {
            throw new NotFoundException(`Setting with id ${id} not found`);
        }

        return updated as unknown as Setting;
    }


}

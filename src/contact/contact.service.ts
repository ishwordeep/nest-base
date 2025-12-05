import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
 
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactAdminDto } from './dto/update-contact-admin.dto';
import { QueryContactDto } from './dto/query-contact.dto';
import { ContactMessage, ContactMessageDocument, ContactStatus } from './schema/contact.schema';

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(ContactMessage.name)
    private readonly contactModel: Model<ContactMessageDocument>,
  ) {}

  // ---------- Public side ----------
  async createPublic(dto: CreateContactDto): Promise<ContactMessage> {
    const created = new this.contactModel({
      ...dto,
      status: ContactStatus.NEW,
    });
    return created.save();
  }

  // ---------- Admin side ----------
  async findAllAdmin(query: QueryContactDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const filter: FilterQuery<ContactMessageDocument> = {};
    if (query.status) {
      filter.status = query.status;
    }

    if (query.search) {
      // Use text index if available
      filter.$text = { $search: query.search };
    }

    const [items, total] = await Promise.all([
      this.contactModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      this.contactModel.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOneAdmin(id: string): Promise<ContactMessage> {
    const doc = await this.contactModel.findById(id).exec();
    if (!doc) {
      throw new NotFoundException('Contact message not found');
    }
    return doc;
  }

  async updateAdmin(
    id: string,
    dto: UpdateContactAdminDto,
  ): Promise<ContactMessage> {
    const doc = await this.contactModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();

    if (!doc) {
      throw new NotFoundException('Contact message not found');
    }
    return doc;
  }

  async removeAdmin(id: string): Promise<void> {
    const res = await this.contactModel.findByIdAndDelete(id).exec();
    if (!res) {
      throw new NotFoundException('Contact message not found');
    }
  }
}

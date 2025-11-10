import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { HomepageSection, HomepageSectionDocument } from './schema/create.schema';
import { CreateHomepageSectionDto } from './dto/create.dto';
import { UpdateHomepageSectionDto } from './dto/update.dto';
import { generateUniqueSlug } from 'src/common/utils/slug.util';

type FindAllQuery = {
    page?: number;          // default 1
    limit?: number;         // default 20
    search?: string;        // matches title/slug
    isActive?: boolean;     // filter by status
    sortBy?: 'sortOrder' | 'createdAt' | 'title' | 'slug';
    sortOrder?: 'asc' | 'desc';
};

@Injectable()
export class HomepageSectionService {
    constructor(@InjectModel(HomepageSection.name) private homepageSectionModel: Model<HomepageSectionDocument>) { }

    async create(createHomepageSectionDto: CreateHomepageSectionDto): Promise<any> {
        try {
            const slug = await generateUniqueSlug(this.homepageSectionModel, createHomepageSectionDto.title);
            const homepageSectionData = { ...createHomepageSectionDto, slug };
            return await this.homepageSectionModel.create(homepageSectionData);
        } catch (error) {
            if (error.code === 11000 && error.keyPattern?.title) {
                throw new BadRequestException(`Homepage section with title "${createHomepageSectionDto.title}" already exists`);
            }
            throw error;
        }
    }

    async update(id: string, updateHomepageSectionDto: UpdateHomepageSectionDto): Promise<any> {
        try {
            const existingHomepageSection = await this.homepageSectionModel.findById(id);

            if (!existingHomepageSection) {
                throw new NotFoundException(`Homepage section not found: ${id}`);
            }

            // Update the homepage section
            const updated = await this.homepageSectionModel
                .findByIdAndUpdate(id, updateHomepageSectionDto, { new: true, lean: true })
                .exec();

            return updated;
        } catch (error) {
            if (error.code === 11000 && error.keyPattern?.title) {
                throw new BadRequestException(`Homepage section with title "${updateHomepageSectionDto.title}" already exists`);
            }
            throw error;
        }
    }

    async findOne(idOrSlug: string): Promise<HomepageSection> {
        const isId = Types.ObjectId.isValid(idOrSlug);
        const doc = isId
            ? await this.homepageSectionModel.findById(idOrSlug).lean()
            : await this.homepageSectionModel.findOne({ slug: idOrSlug }).lean();

        if (!doc) {
            throw new NotFoundException(`Homepage section not found: ${idOrSlug}`);
        }
        return doc as unknown as HomepageSection;
    }

    async findAll(q: FindAllQuery = {}) {
        const {
            page = 1,
            limit = 20,
            search,
            isActive,
            sortBy,
            sortOrder,
        } = q;

        const filter: FilterQuery<HomepageSectionDocument> = {};

        if (typeof isActive === 'boolean') {
            filter.isActive = isActive;
        }

        if (search?.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            filter.$or = [{ title: regex }, { slug: regex }, { subtitle: regex }, { caption: regex }];
        }

        // Sorting
        const sort: Record<string, 1 | -1> = {};
        if (sortBy) {
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        } else {
            // Default: manual order first, then newest
            sort.sortOrder = 1;
            sort.createdAt = -1;
        }

        const skip = (Math.max(1, page) - 1) * Math.max(1, limit);

        const [data, total] = await Promise.all([
            this.homepageSectionModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
            this.homepageSectionModel.countDocuments(filter),
        ]);

        return {
            data,
            pagination: {
                total,
                page: Math.max(1, page),
                limit: Math.max(1, limit),
                pages: Math.ceil(total / Math.max(1, limit)) || 1,
            }
        };
    }
}

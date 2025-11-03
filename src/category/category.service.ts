import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Category, CategoryDocument } from './schema/create.schema';
import { CreateCategoryDto } from './dto/create.dto';
import { generateUniqueSlug } from 'src/common/utils/slug.util';
import { UpdateCategoryDto } from './dto/update.dto';


type FindAllQuery = {
    page?: number;          // default 1
    limit?: number;         // default 20
    search?: string;        // matches name/slug
    isActive?: boolean;     // filter by status
    sortBy?: 'displayOrder' | 'createdAt' | 'name' | 'slug';
    sortOrder?: 'asc' | 'desc';
};


@Injectable()
export class CategoryService {
    constructor(@InjectModel(Category.name) private categoryModel: Model<CategoryDocument>) { }

    async create(createCompanyDto: CreateCategoryDto): Promise<any> {
        const slug = await generateUniqueSlug(this.categoryModel, createCompanyDto.name);
        const categoryData = { ...createCompanyDto, slug };
        return this.categoryModel.create(categoryData);
    }
    async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<any> {
        const existingCategory = await this.categoryModel.findById(id);

        if (!existingCategory) {
            throw new NotFoundException(`Category not found: ${id}`);
        }

        // If name is being changed, regenerate slug
        if (updateCategoryDto.name && updateCategoryDto.name !== existingCategory.name) {
            const newSlug = await generateUniqueSlug(this.categoryModel, updateCategoryDto.name);
            updateCategoryDto.slug = newSlug;
        }

        // Update the category
        const updated = await this.categoryModel
            .findByIdAndUpdate(id, updateCategoryDto, { new: true, lean: true })
            .exec();

        return updated;
    }


    async findOne(idOrSlug: string): Promise<Category> {
        const isId = Types.ObjectId.isValid(idOrSlug);
        const doc = isId
            ? await this.categoryModel.findById(idOrSlug).lean()
            : await this.categoryModel.findOne({ slug: idOrSlug }).lean();

        if (!doc) {
            throw new NotFoundException(`Category not found: ${idOrSlug}`);
        }
        return doc as unknown as Category;
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

        const filter: FilterQuery<CategoryDocument> = {};

        if (typeof isActive === 'boolean') {
            filter.isActive = isActive;
        }

        if (search?.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            filter.$or = [{ name: regex }, { slug: regex }, { description: regex }];
        }

        // Sorting
        const sort: Record<string, 1 | -1> = {};
        if (sortBy) {
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        } else {
            // Default: manual order first, then newest
            sort.displayOrder = 1;
            sort.createdAt = -1;
        }

        const skip = (Math.max(1, page) - 1) * Math.max(1, limit);

        const [data, total] = await Promise.all([
            this.categoryModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
            this.categoryModel.countDocuments(filter),
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

    async listActiveIdName(search?: string) {
        const filter: FilterQuery<CategoryDocument> = { isActive: true };

        if (search?.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            filter.$or = [{ name: regex }, { slug: regex }, { description: regex }];
        }

        const docs = await this.categoryModel
            .find(filter)
            .sort({ displayOrder: 1, name: 1 })
            .select({ _id: 1, name: 1 })
            .lean();

        return docs.map(d => ({ id: d._id.toString(), name: d.name }));
    }


}

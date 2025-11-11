import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../../product/schema/create.schema';
import { Category, CategoryDocument } from '../../category/schema/create.schema';

type SortOrderNum = 1 | -1;

class FindAllProductsQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  colors?: string[];
  sizes?: string[];
  isFeatured?: boolean;
  isNew?: boolean;
  isTrending?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class FrontendProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) { }

  async findOne(idOrSlug: string) {
    // Only return active products for frontend
    const doc = Types.ObjectId.isValid(idOrSlug)
      ? await this.productModel.findOne({ _id: idOrSlug, isActive: true }).populate('categoryDetails').lean()
      : await this.productModel.findOne({ slug: idOrSlug, isActive: true }).populate('categoryDetails').lean();

    if (!doc) {
      return null;
    }

    return doc as unknown as Product;
  }

  async findAll(q: FindAllProductsQuery = {}) {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      minPrice,
      maxPrice,
      tags,
      colors,
      sizes,
      isFeatured,
      isNew,
      isTrending,
      sortBy,
      sortOrder,
    } = q;

    // For frontend, always filter for active products
    const filter: FilterQuery<ProductDocument> = { isActive: true };

    // booleans for featured flags
    if (typeof isFeatured === 'boolean') filter.isFeatured = isFeatured;
    if (typeof isNew === 'boolean') filter.isNew = isNew;
    if (typeof isTrending === 'boolean') filter.isTrending = isTrending;

    // search across key fields
    if (search?.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: regex },
        { slug: regex },
        { description: regex },
        { tags: regex },
      ];
    }

    // category by id or slug
    if (category?.trim()) {
      if (Types.ObjectId.isValid(category)) {
        filter.category = category;
      } else {
        const catDoc = await this.categoryModel.findOne({ slug: category.trim() }).select('_id').lean();
        if (!catDoc?._id) {
          // If category slug not found, return empty result set quickly
          return {
            data: [],
            pagination: {
              total: 0,
              page: Math.max(1, page),
              limit: Math.max(1, limit),
              pages: 1
            }
          };
        }
        filter.category = catDoc._id;
      }
    }

    // price range
    if (typeof minPrice === 'number' || typeof maxPrice === 'number') {
      filter.price = {};
      if (typeof minPrice === 'number') filter.price.$gte = minPrice;
      if (typeof maxPrice === 'number') filter.price.$lte = maxPrice;
    }

    // array filters (any match)
    if (tags?.length) filter.tags = { $in: tags };
    if (colors?.length) filter.colors = { $in: colors };
    if (sizes?.length) filter.sizes = { $in: sizes };

    // sorting
    const sort: Record<string, SortOrderNum> = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      // Default: featured first, then newest
      sort.isFeatured = -1;
      sort.createdAt = -1;
    }

    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, limit);
    const skip = (safePage - 1) * safeLimit;

    const [data, total] = await Promise.all([
      this.productModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(safeLimit)
        .populate('categoryDetails', { _id: 1, name: 1 })
        .lean(),
      this.productModel.countDocuments(filter),
    ]);

    return {
      data,
      pagination: {
        total,
        page: safePage,
        limit: safeLimit,
        pages: Math.ceil(total / safeLimit) || 1,
      }
    };
  }

  async getProductsByFlag(flag: 'new' | 'trending' | 'featured') {
    const flagMap = {
      new: 'isNew',
      trending: 'isTrending',
      featured: 'isFeatured',
    };

    const field = flagMap[flag];
    if (!field) {
      return [];
    }

    const filter: FilterQuery<ProductDocument> = { isActive: true };
    filter[field] = true;

    const data = await this.productModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('categoryDetails', { _id: 1, name: 1 })
      .lean();

    return data;
  }

  async listByCategoryBasic(categoryIdOrSlug: string) {
    let categoryId: string;

    if (Types.ObjectId.isValid(categoryIdOrSlug)) {
      categoryId = categoryIdOrSlug;
    } else {
      const category = await this.categoryModel.findOne({ slug: categoryIdOrSlug }).select('_id').lean();
      if (!category) {
        return { data: [] };
      }
      categoryId = category._id.toString();
    }

    const products = await this.productModel
      .find({ category: categoryId, isActive: true })
      .sort({ createdAt: -1 })
      .populate('categoryDetails', { _id: 1, name: 1 })
      .lean();

    return products;
  }
}

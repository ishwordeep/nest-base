import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Category, CategoryDocument } from '../../category/schema/create.schema';
import { Product, ProductDocument } from '../../product/schema/create.schema';

type SortOrderNum = 1 | -1;

class FindAllCategoriesQuery {
}

@Injectable()
export class FrontendCategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async findOne(idOrSlug: string) {
    // Only return active categories for frontend
    const doc = Types.ObjectId.isValid(idOrSlug)
      ? await this.categoryModel.findOne({ _id: new Types.ObjectId(idOrSlug), isActive: true }).lean()
      : await this.categoryModel.findOne({ slug: idOrSlug, isActive: true }).lean();

    if (!doc) {
      return null;
    }

    // Count products in this category
    const productCount = await this.productModel.countDocuments({ 
      category: new Types.ObjectId(doc._id.toString()), 
      isActive: true 
    });

    return { ...doc, productCount } as unknown as Category & { productCount: number };
  }

  async findAll(q: FindAllCategoriesQuery = {}) {
    // Always return only active categories for frontend
    const filter: FilterQuery<CategoryDocument> = { isActive: true };

    // sorting by displayOrder (always ascending)
    const sort: Record<string, SortOrderNum> = {};
    sort.displayOrder = 1;
    sort.name = 1;

    const categories = await this.categoryModel
      .find(filter)
      .sort(sort)
      .lean();

    // Get product counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const productCount = await this.productModel.countDocuments({ 
          category: new Types.ObjectId(category._id.toString()), 
          isActive: true 
        });
        return { ...category, productCount };
      })
    );

    return categoriesWithCounts;
  }
}

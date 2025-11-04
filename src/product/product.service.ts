import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './schema/create.schema';
import { FilterQuery, Model, Types } from 'mongoose';
import { generateUniqueSlug } from 'src/common/utils/slug.util';
import { UpdateProductDto } from './dto/update.dto';
import { Category, CategoryDocument } from 'src/category/schema/create.schema';


type SortOrderNum = 1 | -1;

export interface FindAllProductsQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  category?: string; // id or slug
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  colors?: string[];
  sizes?: string[];
  isFeatured?: boolean;
  isNew?: boolean;
  isTrending?: boolean;
  sortBy?: 'displayOrder' | 'createdAt' | 'name' | 'slug' | 'price';
  sortOrder?: 'asc' | 'desc';
}


@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) { }

  private readonly keyToFieldMap = {
    new: 'isNew',
    trending: 'isTrending',
    featured: 'isFeatured',
  } as const;


  async create(createProductDto: CreateProductDto): Promise<any> {
    // Always generate a unique slug from the product name
    const slug = await generateUniqueSlug(this.productModel, createProductDto.name);

    // Create the product
    const doc = await this.productModel.create({ ...createProductDto, slug });

    // Return with categoryDetails populated, lean object
    const created = await this.productModel
      .findById(doc._id)
      .populate('categoryDetails')
      .lean()
      .exec();

    return created;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<any> {
    // Check if product exists
    const existingProduct = await this.productModel.findById(id);

    if (!existingProduct) {
      throw new NotFoundException(`Product not found: ${id}`);
    }

    let updateData: any = { ...updateProductDto };

    // If name changed, regenerate slug
    if (
      updateProductDto.name &&
      updateProductDto.name.trim() &&
      updateProductDto.name !== existingProduct.name
    ) {
      const newSlug = await generateUniqueSlug(this.productModel, updateProductDto.name);
      updateData.slug = newSlug;
    }

    // Update and return the updated document
    const updated = await this.productModel
      .findByIdAndUpdate(id, updateData, {
        new: true,
        lean: true,
        runValidators: true, // enforce validation
      })
      .populate('categoryDetails')
      .exec();

    return updated;
  }

  async findOne(idOrSlug: string): Promise<Product> {
    const isId = Types.ObjectId.isValid(idOrSlug);

    const doc = isId
      ? await this.productModel.findById(idOrSlug).populate('categoryDetails').lean()
      : await this.productModel.findOne({ slug: idOrSlug }).populate('categoryDetails').lean();

    if (!doc) {
      throw new NotFoundException(`Product not found: ${idOrSlug}`);
    }

    return doc as unknown as Product;
  }

  async findAll(q: FindAllProductsQuery = {}) {
    const {
      page = 1,
      limit = 20,
      search,
      isActive,
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

    const filter: FilterQuery<ProductDocument> = {};

    // booleans
    if (typeof isActive === 'boolean') filter.isActive = isActive;
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
      // Default: manual order first, then newest
      sort.displayOrder = 1;
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
        .populate('categoryDetails')
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


  async updateFlag(ids: string[], flag: 'new' | 'trending' | 'featured') {
    const field = this.keyToFieldMap[flag];
    const objectIds = ids.map((id) => new Types.ObjectId(id));

    // 1️⃣ Set all other products to false
    await this.productModel.updateMany(
      { _id: { $nin: objectIds } },
      { $set: { [field]: false } },
    );

    // 2️⃣ Set selected IDs to true
    const result = await this.productModel.updateMany(
      { _id: { $in: objectIds } },
      { $set: { [field]: true } },
    );

    return { modifiedCount: result.modifiedCount };
  }

  async listActiveIdName(search?: string) {
    const filter: FilterQuery<ProductDocument> = { isActive: true };

    if (search?.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: regex }, { slug: regex }, { description: regex }];
    }

    const docs = await this.productModel
      .find(filter)
      .sort({ name: 1 })
      .select({ _id: 1, name: 1 })
      .lean();

    return docs.map(d => ({ _id: d._id.toString(), name: d.name }));
  }

  async getProductsByFlag(flag: 'new' | 'trending' | 'featured') {
    const field = this.keyToFieldMap[flag];
    if (!field) {
      throw new BadRequestException('Invalid flag provided');
    }

    const products = await this.productModel
      .find({ [field]: true }, { _id: 1 }) // return only _id
      .lean();

    return products.map((p) => p._id);

  }

 async listByCategoryBasic(categoryIdOrSlug: string) {
  const filter: FilterQuery<ProductDocument> = { isActive: true };

  if (categoryIdOrSlug?.trim()) {
    if (Types.ObjectId.isValid(categoryIdOrSlug)) {
      // Use ObjectId directly
      filter.category = categoryIdOrSlug;
    } else {
      // Resolve by slug
      const catDoc = await this.categoryModel
        .findOne({ slug: categoryIdOrSlug.trim() })
        .select('_id')
        .lean();

      if (!catDoc?._id) {
        // Category not found → empty list
        return [];
      }

      filter.category = catDoc._id;
    }
  }

  // Fetch active products of this category
  const products = await this.productModel
    .find(filter)
    .sort({ displayOrder: 1, createdAt: -1 }) // manual order first, then newest
    .select({ _id: 1, name: 1, image: 1, price: 1 })
    .lean();

  return products;
}




}

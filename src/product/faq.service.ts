import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schema/create.schema';
import { CreateFaqItemDto, CreateProductFaqDto } from './dto/create-faq.dto';

@Injectable()
export class FaqService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) { }



  async addFaqToProduct(productId: string, faqDto: CreateFaqItemDto) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Add unique ID to the FAQ
    const faqWithId = {
      ...faqDto,
      _id: new Types.ObjectId(),
    };

    // Add FAQ to the product
    const updatedProduct = await this.productModel.findByIdAndUpdate(
      productId,
      { $push: { faqs: faqWithId } },
      { new: true, runValidators: true }
    );

    return {
      success: true,
      message: "Faq added successfully."
    };
  }

  async updateFaq(productId: string, faqId: string, faqDto: CreateFaqItemDto) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('Invalid product ID');
    }

    if (!Types.ObjectId.isValid(faqId)) {
      throw new BadRequestException('Invalid FAQ ID');
    }

    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Update the FAQ
    const updatedProduct = await this.productModel.findOneAndUpdate(
      { _id: productId, 'faqs._id': faqId },
      { $set: { 'faqs.$.question': faqDto.question, 'faqs.$.answer': faqDto.answer } },
      { new: true, runValidators: true }
    ).populate('categoryDetails', { _id: 1, name: 1 }).lean();

    if (!updatedProduct) {
      throw new NotFoundException(`FAQ with ID ${faqId} not found in product ${productId}`);
    }

     return {
      success: true,
      message: "Faq updated successfully."
    };
  }

  async deleteFaq(productId: string, faqId: string) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('Invalid product ID');
    }

    if (!Types.ObjectId.isValid(faqId)) {
      throw new BadRequestException('Invalid FAQ ID');
    }

    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Delete the FAQ
    const updatedProduct = await this.productModel.findByIdAndUpdate(
      productId,
      { $pull: { faqs: { _id: faqId } } },
      { new: true }
    ) ;

     return {
      success: true,
      message: "Faq deleted successfully."
    };
  }

  async getFaqs(productId: string) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productModel.findById(productId).select('faqs').lean();
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    return product.faqs || [];
  }
}
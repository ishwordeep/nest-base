import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSliderDto } from './dto/create.dto';
import { UpdateSliderDto } from './dto/update.dto';
import { Slider, SliderDocument } from './schema/create.schema';

@Injectable()
export class SliderService {
  constructor(
    @InjectModel(Slider.name) private sliderModel: Model<SliderDocument>,
  ) { }

  async create(createSliderDto: CreateSliderDto): Promise<Slider> {
  try {
    // If isButtonEnabled is false, remove the button object before saving
    if (createSliderDto.isButtonEnabled === false) {
      delete createSliderDto.button;
    }

    const createdSlider = new this.sliderModel(createSliderDto);
    return await createdSlider.save();
  } catch (error) {
    console.error('Error creating slider:', error);
    throw new BadRequestException(error.message || 'Error creating slider');
  }
  }


  async findAll(activeOnly: boolean = false): Promise<Slider[]> {
    const query = activeOnly ? { isActive: true } : {};
    return this.sliderModel.find(query).sort({ displayOrder: 1 }).exec();
  }

  async findOne(id: string): Promise<Slider> {
    const slider = await this.sliderModel.findById(id).exec();
    if (!slider) {
      throw new NotFoundException(`Slider with ID ${id} not found`);
    }
    return slider;
  }

  async update(id: string, updateSliderDto: UpdateSliderDto): Promise<Slider> {
    const updatedSlider = await this.sliderModel
      .findByIdAndUpdate(id, updateSliderDto, { new: true })
      .exec();

    if (!updatedSlider) {
      throw new NotFoundException(`Slider with ID ${id} not found`);
    }

    return updatedSlider;
  }

  async remove(id: string): Promise<Slider> {
    const deletedSlider = await this.sliderModel.findByIdAndDelete(id).exec();

    if (!deletedSlider) {
      throw new NotFoundException(`Slider with ID ${id} not found`);
    }

    return deletedSlider;
  }




}
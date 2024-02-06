import { Injectable, NotImplementedException } from '@nestjs/common';
import { CreateImageDto } from './dto/create-image.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Image } from './schemas/image.schema';
import * as moment from 'moment';

@Injectable()
export class ImageService {
  constructor(@InjectModel(Image.name) private catModel: Model<Image>) {}

  async create(createImageDto: CreateImageDto) {
    const createdCat = new this.catModel({
      ...createImageDto,
      uploadDate: moment().toISOString(),
    });
    await createdCat.save();
    return createdCat;
  }

  async findAll() {
    const images = await this.catModel.find().exec();
    return images;
  }

  findOne() {
    throw new NotImplementedException();
  }

  update() {
    throw new NotImplementedException();
  }

  remove() {
    throw new NotImplementedException();
  }
}

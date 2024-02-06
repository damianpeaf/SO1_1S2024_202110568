import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ImageDocument = HydratedDocument<Image>;

@Schema()
export class Image {
  @Prop({ required: true })
  base64: string;

  @Prop({ required: true })
  uploadDate: Date;
}

export const ImageSchema = SchemaFactory.createForClass(Image);

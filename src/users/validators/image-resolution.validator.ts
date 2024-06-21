import { FileValidator } from '@nestjs/common';
import * as sharp from 'sharp';

export type ImageResolutionValidatorOptions = {
  minWidth: number;
  minHeight: number;
};

export class ImageResolutionValidator extends FileValidator<ImageResolutionValidatorOptions> {
  constructor(
    protected readonly validationOptions: ImageResolutionValidatorOptions,
  ) {
    super(validationOptions);
  }

  async isValid(file?: Express.Multer.File): Promise<boolean> {
    if (!this.validationOptions || !file) {
      return true;
    }

    const metadata = await sharp(file.buffer).metadata();
    return (
      metadata.width >= this.validationOptions.minWidth &&
      metadata.height >= this.validationOptions.minHeight
    );
  }

  buildErrorMessage(file: Express.Multer.File): string {
    return `Validation failed (expected resolution is at least ${this.validationOptions.minWidth}x${this.validationOptions.minHeight}px)`;
  }
}

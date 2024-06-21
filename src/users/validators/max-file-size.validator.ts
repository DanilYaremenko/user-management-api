import { FileValidator } from '@nestjs/common';

export type MaxFileSizeValidatorOptions = {
  maxSize: number;
  message?: string | ((maxSize: number) => string);
};

export class MaxFileSizeValidator extends FileValidator<MaxFileSizeValidatorOptions> {
  constructor(
    protected readonly validationOptions: MaxFileSizeValidatorOptions,
  ) {
    super(validationOptions);
  }

  buildErrorMessage(file: Express.Multer.File): string {
    if ('message' in this.validationOptions) {
      if (typeof this.validationOptions.message === 'function') {
        return this.validationOptions.message(this.validationOptions.maxSize);
      }

      return this.validationOptions.message;
    }

    const maxSizeMegabytes = this.validationOptions.maxSize / 1024 / 1024;
    return `Validation failed (expected size is less than ${maxSizeMegabytes} Mb)`;
  }

  isValid(file?: Express.Multer.File): boolean {
    if (!this.validationOptions || !file) {
      return true;
    }

    return 'size' in file && file.size < this.validationOptions.maxSize;
  }
}

import { FileValidator } from '@nestjs/common';

export type FileTypeValidatorOptions = {
  fileType: string | RegExp;
};

export class FileTypeValidator extends FileValidator<FileTypeValidatorOptions> {
  constructor(protected readonly validationOptions: FileTypeValidatorOptions) {
    super(validationOptions);
  }

  buildErrorMessage(file: Express.Multer.File): string {
    return `Validation failed for ${file.originalname} (expected type is ${this.validationOptions.fileType})`;
  }

  isValid(file?: Express.Multer.File): boolean {
    if (!this.validationOptions || !file) {
      return true;
    }

    return (
      !!file &&
      'mimetype' in file &&
      !!file.mimetype.match(this.validationOptions.fileType)
    );
  }
}

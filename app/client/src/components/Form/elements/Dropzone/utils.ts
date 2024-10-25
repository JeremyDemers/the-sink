import { ErrorCode, type FileRejection } from 'react-dropzone';

import { t } from '@plugins/i18n';
import { number } from '@utils/number';

export function handleErrorMessage(
  rejections: readonly FileRejection[],
  allowedFileExtensions: string,
  maxFileSize: number,
): readonly string[] {
  const messages: string[] = [];

  for (const rejection of rejections) {
    for (const error of rejection.errors) {
      switch (error.code) {
        case ErrorCode.FileInvalidType:
          messages.push(
            t('File {{ filename }} is not uploaded, only files with the following extensions are supported: {{ allowedFileExtensions }}', {
              filename: rejection.file.name,
              allowedFileExtensions,
            }),
          );
          break;

        case ErrorCode.FileTooLarge:
          messages.push(
            t('File {{ filename }} is too large, max file size is {{ size }}.', {
              filename: rejection.file.name,
              size: number.format.fileSize(maxFileSize),
            }),
          );
          break;

        default:
          messages.push(
            t('File {{ filename }} is not uploaded. {{ error }}', {
              filename: rejection.file.name,
              error: error.message,
            }),
          );
      }
    }
  }

  return messages;
}

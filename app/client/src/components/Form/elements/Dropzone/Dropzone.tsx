import type { ReadonlyDeep } from 'type-fest';
import React, { useCallback, useMemo } from 'react';
import classNames from 'classnames';
import { toast } from 'react-toastify';
import { useDropzone, type Accept, type DropzoneOptions, type FileRejection, type FileWithPath } from 'react-dropzone';

import type { Form } from '@typedef/form';

import { t } from '@plugins/i18n';
import { number } from '@utils/number';

import { acceptedFiles } from './constants';
import { handleErrorMessage } from './utils';

import './Dropzone.scss';

const defaultConfig = {
  accept: acceptedFiles.pdf,
  maxSize: 32 * 1024 * 1024, // 32 Mb
  maxFiles: 1,
} as const;

interface DropzoneCommonProps {
  readonly disabled?: boolean;
}

interface DropzoneAttrs extends DropzoneCommonProps {
  readonly dropZoneConfig?: ReadonlyDeep<DropzoneOptions>;
}

interface DropzoneFilesProps extends Required<DropzoneCommonProps> {
  readonly files: DropzoneValue;
  readonly onRemove: (files: DropzoneValue) => void;
}

type DropzoneValue = readonly File[] | null;

type DropzoneProps = Form.Item.ChildProps<DropzoneAttrs, DropzoneValue>;

function parseAccept(accept: ReadonlyDeep<Accept>): readonly [label: string, extensions: string] {
  const extensions = Object
    .values(accept)
    .flatMap((type) => type);

  return [
    extensions
      .map((extension) => extension.slice(1).toUpperCase())
      .join(', '),
    extensions
      .join(', ')
  ];
}

const DropzoneFiles: React.FC<DropzoneFilesProps> = ({
  files,
  disabled,
  onRemove,
}) => {
  return !files || files.length === 0 ? null : files.map((file, index) => (
    <div
      key={`${file.name}_${file.lastModified}_${index}`}
      className="dropzone-file align-items-center py-2 mb-3 me-3"
    >
      <i className="font-icon-file me-1" />
      {file.name} | {number.format.fileSize(file.size)}
      <div className="file-actions ms-3">
        <button
          type="button"
          onClick={() => onRemove(files?.filter((item) => item !== file) || null)}
          disabled={disabled}
          className="btn btn-simple btn-delete btn-file-action"
        >
          <span className="visibility-hidden">
            {t('Delete')}
          </span>
          <i className="font-icon-delete" />
        </button>
      </div>
    </div>
  ));
};

export const Dropzone: React.FC<DropzoneProps> = ({
  name,
  value,
  setValue,
  attributes,
}) => {
  const { disabled, dropZoneConfig } = attributes;
  const { accept, maxSize, maxFiles } = { ...defaultConfig, ...dropZoneConfig };
  const [fileExtensions, allowedFileExtensions] = useMemo(() => parseAccept(accept), [accept]);
  const { getRootProps, getInputProps, isDragAccept, isDragReject } = useDropzone({
    accept,
    maxSize,
    maxFiles,
    disabled,
    onDrop: useCallback(
      (acceptedFiles: readonly FileWithPath[], fileRejections: readonly FileRejection[]): void => {
        const errorMessages = handleErrorMessage(fileRejections, allowedFileExtensions, maxSize);

        if (errorMessages.length > 0) {
          errorMessages.forEach((message) => toast.error(message));
        } else {
          setValue((value || []).concat(acceptedFiles));
        }
      },
      [value, setValue, allowedFileExtensions, maxSize],
    ),
  });

  return (
    <div className="dropzone-wrapper own-reset-button">
      {!(value && value.length >= maxFiles) && (
        <div
          {...getRootProps({
            className: classNames(
              'dropzone p-3 mb-3',
              {
                disabled,
                'is-drag-accept': isDragAccept,
                'is-drag-reject': isDragReject,
              },
            ),
          })}
        >
          <input {...getInputProps()} id={name} name={name} />
          <div className="dropzone-inner d-flex flex-column align-items-center">
            <i className="font-icon-upload"/>
            <p className="title mt-1">
              {maxFiles > 1
                ? t('Select up to {{ maxFiles }} files or drag and drop here', { maxFiles })
                : t('Select a file or drag and drop here')
              }
            </p>
            <p className="info">
              {
                t('{{ fileExtensions }}, file size no more than {{ maxSize }}', {
                  fileExtensions,
                  maxSize: number.format.fileSize(maxSize),
                })
              }
            </p>
            <span className="btn--simple">
              {t('Browse Files')}
            </span>
          </div>
        </div>
      )}

      <DropzoneFiles
        files={value}
        disabled={!!disabled}
        onRemove={setValue}
      />
    </div>
  );
};

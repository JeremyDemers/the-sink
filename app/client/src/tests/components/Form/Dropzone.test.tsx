import { toast } from 'react-toastify';
import { queryHelpers, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { t } from '@plugins/i18n';
import { number } from '@utils/number';

import { Dropzone, acceptedFiles, mimeTypes } from '@components/Form/elements/Dropzone';

import { generateFile, selectFileForUpload } from '@tests/jestUtils/form';
import { renderFormItem } from '@tests/jestUtils/RenderFormItem';

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
  },
}));

const renderDropzone = renderFormItem.bind(undefined, Dropzone);

describe(Dropzone, () => {
  it('should render component', () => {
    renderDropzone(
      undefined,
      {
        label: t('Default file uploader, that will accept only PDF files. File size limit is 32 MB by default.'),
      },
    );

    expect(screen.getByText(t('Select a file or drag and drop here'))).toBeInTheDocument();
  });

  it('should upload file', async () => {
    const { container } = renderDropzone(
      undefined,
      {
        dropZoneConfig: {
          accept: acceptedFiles.csv,
          maxSize: 1024 * 1024,
          maxFiles: 1,
        },
      },
    );

    const inputFile = queryHelpers.queryByAttribute('name', container, 'testField') as HTMLInputElement;

    expect(inputFile).toBeInTheDocument();

    await selectFileForUpload(inputFile, mimeTypes.csv);
  });

  it('should remove file', async () => {
    renderDropzone(
      {
        initialValues: {
          testField: [generateFile(mimeTypes.pdf)],
        },
      },
      undefined,
    );

    await userEvent.click(screen.getByRole('button', { name: t('Delete') }));

    await waitFor(() => {
      expect(screen.getByText(t('Browse Files'))).toBeInTheDocument();
    });
  });

  describe('Upload Errors', () => {
    it('should handle file type', async () => {
      const { container } = renderDropzone(
        undefined,
        {
          dropZoneConfig: {
            accept: acceptedFiles.pdf,
            maxSize: 1024 * 1024,
            maxFiles: 1,
          },
        },
      );

      const inputFile = queryHelpers.queryByAttribute('name', container, 'testField') as HTMLInputElement;
      const file = generateFile(mimeTypes.csv);

      await userEvent.upload(inputFile, file, { applyAccept: false });

      expect(toast.error).toHaveBeenCalledWith(
        t(
          'File {{ filename }} is not uploaded, only files with the following extensions are supported: .pdf',
          {
            filename: file.name,
          },
        ),
      );
    });

    it('should handle file size', async () => {
      const { container } = renderDropzone(
        undefined,
        {
          dropZoneConfig: {
            accept: acceptedFiles.csv,
            maxSize: 5,
            maxFiles: 1,
          },
        },
      );

      const inputFile = queryHelpers.queryByAttribute('name', container, 'testField') as HTMLInputElement;
      const file = generateFile(mimeTypes.csv);

      await userEvent.upload(inputFile, file);

      expect(toast.error).toHaveBeenCalledWith(
        t(
          'File {{ filename }} is too large, max file size is {{ size }}.',
          {
            filename: file.name,
            size: number.format.fileSize(5),
          },
        ),
      );
    });
  });
});

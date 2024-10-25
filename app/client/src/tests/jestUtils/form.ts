/* istanbul ignore file */
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';

import type { Form } from '@typedef/form';
import type { ObjectValues } from '@typedef/global';
import type { mimeTypes } from '@components/Form/elements/Dropzone';

import { t } from '@plugins/i18n';

type MimeType = ObjectValues<typeof mimeTypes>;

// List of options for the select, radios, and checkboxes
export const optionsList: readonly Form.Option[] = [
  {
    label: 'option label 1',
    value: '1',
  },
  {
    label: 'option label 2',
    value: '2',
  },
  {
    label: 'option label 3',
    value: '3',
  },
] as const;

export function generateFile(type: MimeType, name = 'example'): File {
  const options: BlobPropertyBag = {
    type,
  };

  return new File([new Blob(['Hello world'], options)], `${name}.${type.split('/')[1]}`, options);
}

export async function selectFileForUpload(fileInput: HTMLInputElement, type: MimeType): Promise<void> {
  await userEvent.upload(fileInput, generateFile(type));

  await waitFor(() => {
    expect(screen.getByText(t('Delete'))).toBeInTheDocument();
  });
}

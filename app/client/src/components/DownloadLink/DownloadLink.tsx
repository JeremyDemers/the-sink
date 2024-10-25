import axios from 'axios';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import classNames from 'classnames';

import { t } from '@plugins/i18n';

import type { Download } from './types.d';
import { DownloadingState } from './constants';

interface DownloadLinkProps extends React.Attributes {
  readonly url: string;
  readonly children: React.ReactNode | React.ComponentType<Download.Link.Children.Props>;
  readonly disabled?: boolean;
  readonly fileName?: string;
  readonly className?: classNames.Argument;
}

const contentDispositionNameExtractRegex = /.+filename="([^"]+)"/;

export async function downloadFile(url: string, fileName?: string): Promise<void> {
  const response = await axios.get(
    url,
    {
      responseType: 'blob',
    },
  );

  const link = document.createElement('a');

  link.href = URL.createObjectURL(response.data);
  link.hidden = true;
  link.download = (
    fileName
    || response.headers['content-disposition']?.replace(contentDispositionNameExtractRegex, '$1')
    || true
  );

  link.click();
  URL.revokeObjectURL(link.href);
}

export const DownloadLink: React.FC<DownloadLinkProps> = ({
  url,
  fileName,
  disabled,
  className,
  children: Children,
}) => {
  const [state, setState] = useState<Download.Link.Children.State>({ value: DownloadingState.Idle });
  const loading = state.value === DownloadingState.Loading;
  const download: React.MouseEventHandler<HTMLAnchorElement> = async (event) => {
    event.preventDefault();

    setState({ value: DownloadingState.Loading });

    try {
      await downloadFile(url, fileName);
      setState({ value: DownloadingState.Idle });
    } catch (error) {
      setState({ value: DownloadingState.Error, error });

      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.error('[dev] DownloadLink:', error);
      }

      toast.error(t('Unable to download the file.'));
    }
  };

  return (
    <a
      href={url}
      onClick={disabled ? undefined : download}
      download={fileName || true}
      aria-disabled={loading || disabled}
      className={
        classNames(
          'link--download',
          'd-flex',
          'gap-2',
          className,
          state.value,
          {
            'pe-none disabled': loading || disabled,
          },
        )
      }
    >
      {/* The function and class components are functions. */}
      {typeof Children === 'function' ? <Children state={state} /> : Children}
      <div className="loader loader--primary" hidden={!loading} />
    </a>
  );
};

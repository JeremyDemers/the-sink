import React from 'react';
import { render, screen } from '@testing-library/react';

import { DownloadLink } from '@components/DownloadLink';

describe(DownloadLink, () => {
  const url = 'https://site.com/file.png' as const;

  it('should render a link', () => {
    render(
      <DownloadLink
        url={url}
        className={['a', { b: true }]}
      >
        Download
      </DownloadLink>,
    );

    const link = screen.getByRole('link');

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('download', '');
    expect(link).toHaveAttribute('href', url);
    expect(link).toHaveAttribute('class', 'link--download d-flex gap-2 a b');
  });
});

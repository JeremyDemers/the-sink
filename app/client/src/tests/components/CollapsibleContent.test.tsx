import React from 'react';
import { screen, render, queryHelpers, waitFor, fireEvent } from '@testing-library/react';
import CollapsibleContent from '@components/CollapsibleContent';
import userEvent from '@testing-library/user-event';

const ChildContent: React.FC = () => {
  return (
    <p>Example of child content.</p>
  );
};

const defaultIconConf = {
  icon: {
    activeName: 'active',
    inactiveName: 'inactive',
    size: '',
  }
};

const renderCollapsibleContent = (iconConfig: object = defaultIconConf, contentConfig?: Record<string, string>) => {
  return render (
    <CollapsibleContent buttonConfig={{
      className: 'button-wrapper',
      buttonLabel: {
        activeName: 'collapse',
        inactiveName: 'expand',
      },
      ...iconConfig,
    }} contentConfig={contentConfig}
    >
      <ChildContent />
    </CollapsibleContent>
  );
};

describe('CollapsibleContent', () => {
  it('should render in a collapsed state by default', () => {
    const { container } = renderCollapsibleContent();

    const contentInnerWrapper = queryHelpers.queryByAttribute(
      'class',
      container,
      'collapsible__wrapper'
    ) as HTMLDivElement;

    expect(screen.getByRole('button', { name: 'expand' })).toBeInTheDocument();

    expect(contentInnerWrapper).not.toBeVisible();
  });

  it('should expand content on button click', async () => {
    const { container } = renderCollapsibleContent();
    const contentWrapper = queryHelpers.queryByAttribute(
      'class',
      container,
      'collapsible__content'
    ) as HTMLDivElement;

    const contentInnerWrapper = queryHelpers.queryByAttribute(
      'class',
      container,
      'collapsible__wrapper'
    );

    userEvent.click(screen.getByRole('button', { name: 'expand' }));

    await waitFor(() => {
      expect(contentWrapper).toHaveClass('collapsible-expanded');
    });

    expect(screen.getByRole('button', { name: 'collapse' })).toBeInTheDocument();

    fireEvent.transitionEnd(contentWrapper);

    expect(contentInnerWrapper).toBeVisible();
  });

  it('should render different icon sizes and position', () => {
    const { container } = renderCollapsibleContent({
      icon: {
        size: 'icon-s',
        activeName: 'active',
        inactiveName: 'inactive',
        position: 'right',
      },
    });

    const icon = container.querySelector('.icon-s');

    expect(icon).toHaveClass('icon-s font-icon-inactive icon-right');
  });

  it('should render button without icon', () => {
    const { container } = renderCollapsibleContent({});
    const icon = queryHelpers.queryByAttribute('class', container, 'icon-s');

    expect(icon).toBe(null);
  });

  it('should render wrapper with extra class name', () => {
    const { container } = renderCollapsibleContent({}, {
      wrapperClassName: 'custom-wrapper',
    });

    const contentInnerWrapper = queryHelpers.queryByAttribute(
      'class',
      container,
      'collapsible__content custom-wrapper'
    );

    expect(contentInnerWrapper).toHaveClass('collapsible__content custom-wrapper');
  });
});

import React from 'react';
import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Modal, type ModalWindow, useModal } from '@components/Modal';

const acceptCallback = vi.fn();
const closeCallback = vi.fn();

const popupText = 'Simple text' as const;
const props: ModalWindow.Props = {
  title: 'Title',
  text: popupText,
  acceptButtonText: 'accept',
  closeButtonText: 'close',
  close: closeCallback,
  accept: acceptCallback,
};

const renderModal = (props: ModalWindow.Props) => <Modal {...props} />;

describe(Modal, () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe(useModal, () => {
    it('should control the modal appearance via API functions', () => {
      const title = `My Modal ${new Date()}` as const;
      const modal = renderHook(
        () => useModal({
          ...props,
          title,
        }),
      );

      // The modal should not be present initially.
      expect(screen.queryByText(title)).not.toBeInTheDocument();
      expect(modal.result.current.open).toBe(false);

      // The modal should appear.
      act(() => modal.result.current.show());
      expect(screen.queryByText(title)).toBeInTheDocument();
      expect(modal.result.current.open).toBe(true);

      // The modal should disappear.
      act(() => modal.result.current.hide());
      expect(screen.queryByText(title)).not.toBeInTheDocument();
      expect(modal.result.current.open).toBe(false);
    });
  });

  it('should render title', () => {
    render(renderModal(props));
    expect(screen.getByText('Title')).toBeInTheDocument();
  });

  describe('Text', () => {
    it('should be rendered', () => {
      render(renderModal(props));
      expect(screen.getByText(popupText)).toBeInTheDocument();
    });

    it('should not be rendered', () => {
      render(renderModal({ ...props, text: undefined }));
      expect(screen.queryByText(popupText)).toBeNull();
    });
  });

  describe('Button Accept', () => {
    it('should be visible', () => {
      render(renderModal(props));
      expect(screen.getByText('accept')).toBeInTheDocument();
    });

    it('should call callback function when clicked', async () => {
      render(renderModal(props));
      await userEvent.click(screen.getByText('accept'));
      expect(acceptCallback).toHaveBeenCalled();
    });
  });

  describe('Button Close', () => {
    it('should be rendered', () => {
      render(renderModal(props));
      expect(screen.getByText('close')).toBeInTheDocument();
    });

    it('should call callback function when clicked', async () => {
      render(renderModal(props));
      await userEvent.click(screen.getByText('close'));
      expect(closeCallback).toHaveBeenCalled();
    });
  });

  describe('Overlay', () => {
    it('should be visible', () => {
      render(renderModal(props));
      expect(screen.getByRole('presentation')).toBeInTheDocument();
    });

    it('should call callback when clicked', async () => {
      render(renderModal(props));
      await userEvent.click(screen.getByRole('presentation') as HTMLDivElement);
      expect(closeCallback).toHaveBeenCalled();
    });

    it('should not call callback when clicked', async () => {
      render(renderModal({ ...props, closeOnOverlayClick: false }));
      await userEvent.click(screen.getByRole('presentation') as HTMLDivElement);
      expect(closeCallback).not.toHaveBeenCalled();
    });
  });

  describe('Icon', () => {
    const withIcon: ModalWindow.Props = {
      ...props,
      icon: {
        name: 'warn',
        color: 'red',
      },
    };

    it('should be displayed', () => {
      render(renderModal(withIcon));
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('should not be rendered', () => {
      render(renderModal(props));
      expect(screen.queryByRole('img')).toBeNull();
    });

    it('should render icon by name', () => {
      render(renderModal(withIcon));
      expect(screen.getByRole('img')).toHaveClass('font-icon-warn');
    });

    describe('Color', () => {
      it('should be red', () => {
        render(renderModal(withIcon));
        expect(screen.getByRole('img')).toHaveClass('red');
      });
      it('should be green', () => {
        const withGreenIcon: ModalWindow.Props = {
          ...props,
          icon: {
            name: 'warn',
            color: 'green',
          },
        };
        render(renderModal(withGreenIcon));
        expect(screen.getByRole('img')).toHaveClass('green');
      });
    });
  });
});

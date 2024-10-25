import React, { useState } from 'react';
import classNames from 'classnames';

import type { ModalWindow } from './types';
import { ModalAction } from './constants';

import './modal.scss';

export const Modal: React.FC<ModalWindow.Props> = ({
  close,
  accept,
  title,
  text,
  closeButtonText,
  acceptButtonText,
  icon,
  onDone,
  onError,
  closeOnOverlayClick = true,
}) => {
  const [action, setAction] = useState<ModalWindow.Action>();
  const getActionHandler = (id: ModalWindow.Action, callback: ModalWindow.Callback) => async () => {
    setAction(id);

    try {
      await callback();
    } catch (error) {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.error('[dev]', error);
      }

      onError?.(id, error);
    }

    setAction(undefined);
    onDone?.();
  };
  const onClose = getActionHandler('closing', close);

  return (
    <div className="dialog-popup d-flex justify-content-center align-items-start p-3 text-center">
      <div role="presentation" className="dialog-popup__overlay" onClick={closeOnOverlayClick ? onClose : undefined} />
      <div className="dialog-popup__content p-4">
        {icon && <i role="img" className={`icon font-icon-${icon.name} ${icon.color}`} />}
        <h3 className="dialog-popup__title">
          {title}
        </h3>

        {text && <p className="dialog-popup__text">{text}</p>}

        <div className="dialog-popup__actions d-flex flex-column align-items-center mt-4 pt-1">
          <button
            type="button"
            className={classNames('btn btn--primary', { 'btn--loading': action === ModalAction.Accepting })}
            onClick={getActionHandler('accepting', accept)}
            disabled={!!action}
          >
            {acceptButtonText}
          </button>
          <button
            type="button"
            className={classNames('btn btn--simple mt-3', { 'btn--loading': action === ModalAction.Closing })}
            onClick={onClose}
            disabled={!!action}
          >
            {closeButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

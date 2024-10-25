import React, { useCallback, useEffect, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import type { ModalWindow } from './types';
import { Modal } from './Modal';

interface Refs {
  /**
   * The container to render a modal within (will be appended to the `body`).
   */
  readonly container: HTMLDivElement;

  /**
   * The React root created for the `container`.
   */
  readonly root: Root;
}

export function useModal(props: ModalWindow.Props): ModalWindow.Controller {
  const [refs, setRefs] = useState<Refs | null>(null);
  const show = () => {
    if (!refs) {
      const container = document.createElement('div');

      setRefs({
        container: document.body.appendChild(container),
        root: createRoot(container),
      });
    }
  };
  const hide = useCallback(
    () => {
      if (refs) {
        refs.container.remove();
        setRefs(null);
      }
    },
    [refs],
  );

  useEffect(
    () => {
      if (refs) {
        refs.root.render(<Modal {...props} onDone={hide} />);
      }
    },
    [hide, props, refs],
  );

  return {
    open: refs !== null,
    toggle: () => refs ? hide() : show(),
    show,
    hide,
  };
}

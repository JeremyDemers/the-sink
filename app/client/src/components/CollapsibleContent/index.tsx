import React, { useRef, useEffect, useState, RefObject } from 'react';
import classNames from 'classnames';

import './_collapsible.scss';

interface Props {
  readonly children: React.ReactNode;
  readonly contentConfig?: {
    readonly wrapperClassName?: string;
    readonly contentClassName?: string;
  };
  readonly buttonConfig: {
    readonly className: string;
    readonly buttonLabel: {
      readonly activeName: string;
      readonly inactiveName: string;
    };
    readonly icon?: {
      readonly activeName: string;
      readonly inactiveName: string;
      readonly size?: string;
      readonly position?: 'left' | 'right';
    };
    readonly buttonWrapperClassName?: string;
  };
}

function toggleOverflow(elementRef: RefObject<HTMLDivElement>, hide = true): void {
  if (elementRef.current) {
    elementRef.current.style.visibility = elementRef.current.style.overflow = hide ? 'hidden' : 'visible';
  }
}

const CollapsibleContent: React.FC<Props> = ({
  children,
  buttonConfig,
  contentConfig,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const toggleContent = () => {
    // To have proper close animation, we must have 'overflow:hidden' before the state update.
    toggleOverflow(contentRef);
    // Toggle state.
    setIsExpanded(prevState => !prevState);
  };

  // Add 'overflow: visible' after the animation is finished.
  // So that elements can extend beyond the container.
  const handleTransitionEnd = () => {
    if (isExpanded) {
      toggleOverflow(contentRef, false);
    }
  };
  // Hide content on page render.
  useEffect(() => {
    toggleOverflow(contentRef);
  }, []);

  const {className, buttonLabel} = buttonConfig;

  return (
    <>
      <div className={buttonConfig?.buttonWrapperClassName}>
        <button
          type="button"
          className={className}
          aria-expanded={isExpanded}
          onClick={toggleContent}
        >
          {isExpanded ? buttonLabel.activeName : buttonLabel.inactiveName}
          {buttonConfig.icon && (
            <i
              className={
                classNames(
                  buttonConfig.icon.size,
                  isExpanded
                    ? `font-icon-${buttonConfig.icon.activeName}`
                    : `font-icon-${buttonConfig.icon.inactiveName}`,
                  {
                    [`icon-${buttonConfig.icon.position}`]: buttonConfig.icon.position,
                  },
                )
              }
            />
          )}
        </button>
      </div>
      <div
        className={classNames(
          'collapsible__content',
          contentConfig?.wrapperClassName,
          {
            'collapsible-expanded': isExpanded,
          },
        )}
        onTransitionEnd={handleTransitionEnd}
      >
        <div ref={contentRef} className="collapsible__wrapper">
          <div className={contentConfig?.contentClassName}>
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default CollapsibleContent;

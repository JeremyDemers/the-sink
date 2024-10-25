import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';

import type { Form } from '@typedef/form';

type TextareaValue = React.JSX.IntrinsicElements['textarea']['value'];

interface TextareaAttrs {
  readonly classname?: classNames.Argument;
}

type TextareaProps = Form.Item.ChildProps<
  Form.Item.IntrinsicElementAttrs<'textarea', TextareaAttrs>,
  TextareaValue
>;

const Textarea: React.FC<TextareaProps> = ({
  name,
  value,
  setValue,
  attributes,
}) => {
  const { className, ...attrs } = attributes;
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const autoresize = () => {
    const element = textareaRef.current;

    // An element's `offsetParent` property returns `null` whenever it,
    // or any of its parents, is hidden via the display style property.
    if (element?.offsetParent && element?.checkVisibility()) {
      element.style.height = 'auto';
      element.style.height = `${element.scrollHeight}px`;
    }
  };

  useEffect(autoresize);

  return (
    <textarea
      {...attrs}
      id={name}
      ref={textareaRef}
      name={name}
      value={value}
      style={{ overflow: 'hidden' }}
      onInput={autoresize}
      onChange={(event) => setValue(event.target.value)}
      className={classNames('form-input form-input--textarea', className)}
    />
  );
};

export default Textarea;

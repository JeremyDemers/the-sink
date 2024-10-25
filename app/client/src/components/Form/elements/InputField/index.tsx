import React from 'react';
import classNames from 'classnames';

import type { Form } from '@typedef/form';

type InputFieldType = Exclude<React.HTMLInputTypeAttribute, 'checkbox' | 'radio'>;

interface InputFieldAttrs {
  readonly type?: InputFieldType;
  readonly prefix?: React.ReactNode;
  readonly suffix?: React.ReactNode;
  readonly className?: classNames.Argument;
}

type InputFieldValue = string | number | undefined;

type InputFieldProps = Form.Item.ChildProps<
  Form.Item.IntrinsicElementAttrs<'input', InputFieldAttrs>,
  InputFieldValue
>;

const casts: Readonly<Partial<Record<InputFieldType, (value: string) => InputFieldValue>>> = {
  number: (value) => value !== ''
    ? Number(value)
    // Avoid casting an empty string to `0`.
    : value,
} as const;

const GroupText: React.FC<React.PropsWithChildren> = ({ children }) => (
  children && <span className="input-group-text">{children}</span>
);

const InputField: React.FC<InputFieldProps> = ({
  name,
  value,
  setValue,
  attributes,
}) => {
  const { type, className, prefix, suffix, ...attrs } = attributes;
  const inputType = type || 'text';
  const cast = casts[inputType] || String;

  return (
    <div className="input-group flex-nowrap">
      <GroupText>{prefix}</GroupText>
      <input
        {...attrs}
        id={name}
        name={name}
        type={inputType}
        value={value ?? ''}
        className={classNames(`form-input form-input--${inputType}`, className)}
        onChange={(event) => setValue(event.target.value)}
        onBlur={(event) => {
          setValue(cast(event.target.value));
          attrs.onBlur?.(event);
        }}
      />
      <GroupText>{suffix}</GroupText>
    </div>
  );
};

export default InputField;

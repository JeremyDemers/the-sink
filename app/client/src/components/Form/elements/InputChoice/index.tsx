import React from 'react';
import classNames from 'classnames';

import type { Form } from '@typedef/form';

import { t } from '@plugins/i18n';

interface InputChoiceAttrs {
  readonly type: 'checkbox' | 'radio';
  readonly options: readonly Form.Option[];
  readonly inline?: boolean;
  readonly className?: classNames.Argument;
}

interface InputChoiceLogic {
  readonly checked: (
    fieldValue: InputChoiceValue,
    optionValue: InputChoiceAttrs['options'][number]['value'],
  ) => boolean;
  readonly onChange: (
    fieldValue: InputChoiceValue,
    optionValue: InputChoiceAttrs['options'][number]['value'],
    options: InputChoiceAttrs['options'],
  ) => InputChoiceValue;
}

type InputChoiceValue =
  | Form.Option['value']
  | readonly Form.Option['value'][]
  | false
  | null;

type InputChoiceProps = Form.Item.ChildProps<
  Form.Item.IntrinsicElementAttrs<
    'input',
    InputChoiceAttrs,
    | 'checked'
    | 'aria-checked'
    | 'defaultChecked'
  >,
  InputChoiceValue
>;

const logics: Record<InputChoiceAttrs['type'], InputChoiceLogic> = {
  checkbox: {
    checked: (fieldValue, optionValue) =>  Array.isArray(fieldValue)
      ? fieldValue.includes(optionValue)
      : !!fieldValue,
    onChange: (fieldValue, optionValue, options) => {
      if (options.length <= 1) {
        return !fieldValue;
      }

      const values = new Set(fieldValue as unknown as Any[] || []);

      if (values.has(optionValue)) {
        values.delete(optionValue);
      } else {
        values.add(optionValue);
      }

      return [...values];
    },
  },
  radio: {
    checked: (fieldValue, optionValue) => fieldValue === optionValue,
    onChange: (_, optionValue) => optionValue,
  },
} as const;

const InputChoice: React.FC<InputChoiceProps> = ({
  name,
  value,
  setValue,
  attributes,
}) => {
  const {
    type,
    options,
    className,
    inline,
    ...rest
  } = attributes;

  return (
    <>
      {options?.map((option , index) => {
        const id = `${name}_${option.value}`;
        const uniqueClass = `input-${type}`;

        return (
          <div
            key={`${id}-${index}`}
            className={classNames('input-choice-wrapper', { 'input-inline me-2': inline })}
          >
            <label
              htmlFor={id}
              className={classNames(`${uniqueClass}-wrapper`, className, { disabled: attributes.disabled })}
            >
              <input
                // Must come first as each item should have its own ID.
                {...rest}
                id={id}
                type={type}
                value={option.value as Any}
                checked={logics[type].checked(value, option.value)}
                className={classNames('form-input', uniqueClass)}
                onChange={() => setValue(logics[type].onChange(value, option.value, options))}
              />
              {option.label}
            </label>
          </div>
        );
      })}

      {(!options || options.length < 1) && (
        <div className="alert alert-warning">
          {t('There are no list options!')}
        </div>
      )}
    </>
  );
};

export default InputChoice;

import React, { useState, useEffect } from 'react';
import Select, { type ClassNamesConfig, type OnChangeValue } from 'react-select';
import classNames from 'classnames';
import { toast } from 'react-toastify';

import type { Form } from '@typedef/form';
import { t } from '@plugins/i18n';

import './Select.scss';

interface InputSelectAttrs {
  readonly options:
    | readonly Form.Option[]
    | Promise<readonly Form.Option[]>
    | (() => Promise<readonly Form.Option[]>);
  readonly message?: string;
  readonly isMulti?: boolean;
  readonly readOnly?: boolean;
  readonly disabled?: boolean;
  readonly className?: classNames.Argument;
  readonly placeholder?: string;
}

interface InputSelectLogic<IsMulti extends boolean, Value, Selection> {
  readonly selected: (value: Value | null, options: readonly Form.Option[]) => Selection;
  readonly onChange: (selected: OnChangeValue<Form.Option, IsMulti>) => Value;
}

interface InputSelectLogics {
  readonly multiple: InputSelectLogic<true, readonly (Form.Option['value'])[], readonly Form.Option[]>;
  readonly single: InputSelectLogic<false, Form.Option['value'], Form.Option | null>;
}

type InputSelectValue =
  | Form.Option['value']
  | readonly (Form.Option['value'])[]
  | null;

type InputSelectProps = Form.Item.ChildProps<
  InputSelectAttrs,
  InputSelectValue
>;

const classNamePrefix = 'select' as const;
const classNamesKnown = {
  multiple: `${classNamePrefix}-multi`,
  readonly: `${classNamePrefix}__control--is-readonly`,
} as const;

const logics: InputSelectLogics = {
  multiple: {
    selected: (value, options) => options
      .filter((option) => value?.includes(option.value)),
    onChange: (selected) => selected
      ? selected.map((option) => option.value)
      : [],
  },
  single: {
    selected: (value, options) => options
      .find((option) => value === option.value) || null,
    onChange: (selected) => selected
      ? selected.value
      : '',
  },
} as const;

function getClassNames(readOnly?: boolean): ClassNamesConfig<Form.Option> {
  return {
    control: () => readOnly ? classNamesKnown.readonly : '',
    loadingIndicator: () => 'loader loader--primary',
  };
}

const InputSelect: React.FC<InputSelectProps> = ({
  name,
  value,
  setValue,
  attributes,
  clearable,
}) => {
  const {
    isMulti,
    message,
    disabled,
    className,
    readOnly,
    options: optionsDefinition,
    ...rest
  } = attributes;

  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<readonly Form.Option[]>([]);
  const logic = logics[isMulti ? 'multiple' : 'single'];

  useEffect(() => {
    if (optionsDefinition) {
      if (Array.isArray(optionsDefinition)) {
        setOptions(optionsDefinition);
      } else {
        setLoading(true);
        // See https://github.com/microsoft/TypeScript/issues/17002
        // to learn why TS errors here.
        // @todo: Monitor the above issue to get rid of these comments.
        // @ts-expect-error TS2349
        (optionsDefinition instanceof Promise ? optionsDefinition : optionsDefinition())
          .then(setOptions)
          .catch(() => toast.error(t("Can't fetch options.")))
          .finally(() => setLoading(false));
      }
    }
  }, [optionsDefinition]);

  return (
    <Select<Form.Option, boolean>
      {...rest}
      inputId={name}
      className={classNames('select-container own-reset-button', className, { [classNamesKnown.multiple]: isMulti })}
      classNames={getClassNames(readOnly)}
      classNamePrefix={classNamePrefix}
      onChange={(selected) => setValue(logic.onChange(selected as Any))}
      noOptionsMessage={() => message || t('There are no matching options.')}
      value={logic.selected(value as Any, options)}
      options={options}
      isLoading={loading}
      isDisabled={readOnly || disabled || loading}
      isClearable={clearable}
      isMulti={!!isMulti}
      unstyled
    />
  );
};

export default InputSelect;

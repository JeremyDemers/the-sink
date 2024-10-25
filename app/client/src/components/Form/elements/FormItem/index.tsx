import React, { type ComponentType } from 'react';
import { OverlayTrigger, Tooltip, type OverlayProps, type OverlayTriggerProps } from 'react-bootstrap';
import { ErrorMessage, Field, getIn, type FieldProps } from 'formik';
import classNames from 'classnames';
import isEqual from 'lodash.isequal';

import type { Form } from '@typedef/form';

import { t } from '@plugins/i18n';
import { formUtils } from '@utils/form';

interface HasIsValueUnchanged {
  readonly isValueUnchanged: (initial: Any, current: Any) => boolean;
}

/**
 * @example
 * ```typescript tsx
 * import { Popover, Tooltip } from 'react-bootstrap';
 *
 * (
 *   <Popover>
 *     <Popover.Body>The content</Popover.Body>
 *   </Popover>
 * )
 *
 * (
 *   <Tooltip>
 *     The content
 *   </Tooltip>
 * )
 *
 * {
 *   trigger: ['click'],
 *   overlay: (
 *     <Tooltip>
 *       The content
 *     </Tooltip>
 *   ),
 * }
 *
 * 'The content'
 * ```
 */
type Overlay =
  | OverlayProps['children']
  | Omit<OverlayTriggerProps, 'children'>
  | string;

type Props<Attrs extends object, Value> =
  & Attrs
  & Partial<HasIsValueUnchanged>
  & {
    readonly name: string;
    readonly component: ComponentType<Form.Item.ChildProps<Attrs, Value>>;
    readonly id?: string;
    readonly help?: Overlay;
    readonly label?: string;
    readonly required?: boolean;
    readonly clearable?: boolean;
    readonly description?: string;
  };

export type FormItemProps<Item extends ComponentType<Form.Item.ChildProps<Any, Any>>> = Props<
  Item extends ComponentType<infer ItemProps>
    ? (ItemProps extends Form.Item.ChildProps<infer ItemAttrs, Any> ? ItemAttrs : never)
    : never,
  Item extends ComponentType<infer ItemProps>
    ? (ItemProps extends Form.Item.ChildProps<Any, infer ItemValue> ? ItemValue : never)
    : never
>;

const texts = {
  dirty: t('This field has been modified.'),
} as const;

const ButtonClear: React.FC<Omit<FieldProps, 'meta'> & HasIsValueUnchanged> = ({
  field,
  form,
  isValueUnchanged,
}) => {
  const emptyValue = formUtils.field.getEmptyValue(getIn(form.initialValues, field.name));

  function onClear(): ReturnType<FieldProps['form']['setFieldValue']> {
    return form.setFieldValue(field.name, emptyValue);
  }

  // Offer clearing the value only in case the current one
  // doesn't match the one to be set as a result of clearing.
  return !isValueUnchanged(field.value, emptyValue) && (
    <button
      type="button"
      onClick={onClear}
      className="reset-button reset-field-value"
    >
      <i className="font-icon-close icon-xs" />
    </button>
  );
};

function getOverlayTriggerProps(overlay: Overlay): Omit<OverlayTriggerProps, 'children'> {
  if (typeof overlay === 'string') {
    return {
      overlay: <Tooltip>{overlay}</Tooltip>,
    };
  }

  if ('overlay' in overlay) {
    return overlay;
  }

  return { overlay };
}

function FormItem<Item extends ComponentType<Form.Item.ChildProps<Any, Any>>>({
  name,
  help,
  label,
  description,
  required,
  clearable,
  isValueUnchanged,
  component: Component,
  ...rest
}: FormItemProps<Item>) {
  const isUnchanged = isValueUnchanged || isEqual;

  return (
    <Field name={name}>
      {({ field, meta, form }: FieldProps) => {
        const dirty = !isUnchanged(meta.initialValue, field.value);

        return (
          <div
            className={classNames('form-item mb-4', { touched: meta.touched, 'has-error': !!meta.error, dirty })}
            title={dirty ? texts.dirty : undefined}
          >
            {label && (
              <label htmlFor={field.name} className="label d-inline-flex align-items-center">
                {label}
                {required && <span className="asteriks">*</span>}
                {help && (
                  <OverlayTrigger {...getOverlayTriggerProps(help)}>
                    <i className="font-icon-info ms-1 fs-6" />
                  </OverlayTrigger>
                )}
              </label>
            )}

            <div className="field position-relative">
              <Component
                name={field.name}
                value={field.value}
                setValue={(value: Any) => form.setFieldValue(field.name, value)}
                clearable={clearable}
                attributes={{ ...rest, required, onChange: field.onChange, onBlur: field.onBlur }}
              />

              {clearable && <ButtonClear field={field} form={form} isValueUnchanged={isUnchanged} />}
            </div>
            <ErrorMessage name={field.name} component="div" className="error" />
            {description && <p className="mt-2 mb-0 lh-sm">{description}</p>}
          </div>
        );
      }}
    </Field>
  );
}

export default FormItem;

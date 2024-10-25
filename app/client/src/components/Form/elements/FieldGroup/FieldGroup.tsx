import React from 'react';
import classNames from 'classnames';
import { FieldArray, getIn } from 'formik';

import { t } from '@plugins/i18n';

type FieldGroupItemCallback<T = void> = (index: number) => T;

interface HasName {
  readonly name: string;
}

interface FieldGroupChildProps extends HasName {
  readonly index: number;
}

interface FieldGroupProps<Value extends string | number | object | object[]> extends HasName {
  readonly children: React.FC<FieldGroupChildProps>;
  readonly newValue: Value;
  readonly max?: number;
  readonly header?: React.ReactElement;
  readonly className?: classNames.Argument;
  readonly itemClassName?: classNames.Argument;
  readonly removeButtonLabel?: string | React.ReactElement;
  readonly addNewButtonLabel?: string | React.ReactElement;
  readonly hidden?: FieldGroupItemCallback<boolean>;
  readonly onRemove?: FieldGroupItemCallback;
  readonly onAdd?: FieldGroupItemCallback;
}

export function FieldGroup<Value extends string | number | object | object[]>({
  name,
  children,
  newValue,
  max,
  header,
  className,
  itemClassName,
  removeButtonLabel = t('Remove'),
  addNewButtonLabel = t('Add new item'),
  hidden,
  onRemove,
  onAdd,
}: FieldGroupProps<Value>): React.ReactElement | null {
  const removeButton = typeof removeButtonLabel === 'string'
    ? {
      label: removeButtonLabel,
      className: 'mt-2 font-icon-delete icon-m',
      children: (
        <span className="visibility-hidden">
          {removeButtonLabel}
        </span>
      ),
    }
    : {
      label: undefined,
      className: 'btn--secondary',
      children: removeButtonLabel,
    };

  return (
    <FieldArray name={name}>
      {
        (group) => {
          const values = getIn(group.form.values, name, []) as unknown[];

          if (values.length === 0) {
            values.push(newValue);
          }

          const addGroupItem = () => {
            group.push(newValue);
            onAdd?.(values.length);
          };

          return (
            <div className={classNames(className)}>
              {header}

              {
                values.map((_, index) => {
                  const isHidden = hidden?.(index);
                  const removeGroupItem = () => {
                    group.remove(index);
                    onRemove?.(index);
                  };

                  return (
                    <div
                      key={index}
                      hidden={isHidden}
                      className={classNames('gap-3', { 'd-flex': !isHidden }, itemClassName || 'align-items-start')}
                    >
                      {children({ name, index })}
                      <div className="pt-4">
                        <button
                          type="button"
                          title={removeButton.label}
                          onClick={removeGroupItem}
                          className={classNames('button--remove ms-auto btn', removeButton.className)}
                        >
                          {removeButton.children}
                        </button>
                      </div>
                    </div>
                  );
                })
              }

              <button
                type="button"
                onClick={addGroupItem}
                disabled={max !== undefined && values.length === max}
                className="button--add btn btn--primary"
              >
                {addNewButtonLabel}
              </button>
            </div>
          );
        }
      }
    </FieldArray>
  );
}

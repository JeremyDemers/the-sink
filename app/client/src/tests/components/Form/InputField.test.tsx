import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import InputField from '@components/Form/elements/InputField';

import { renderFormItem } from '@tests/jestUtils/RenderFormItem';

const renderInput = renderFormItem.bind(undefined, InputField);

describe(InputField, () => {
  it('should render text component by default', () => {
    renderInput();
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');
  });

  it('should extend default class', async () => {
    renderInput(
      undefined,
      {
        className: 'custom-class',
      },
    );

    expect(screen.getByRole('textbox')).toHaveClass('custom-class');
  });

  it('should render email component', () => {
    renderInput(
      undefined,
      {
        type: 'email',
      },
    );

    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
  });

  it('should render password component', () => {
    renderInput(
      undefined,
      {
        type: 'password',
        'data-testid': 'input-password',
      },
    );

    expect(screen.getByTestId('input-password')).toHaveAttribute('type', 'password');
  });

  it('should render number component', () => {
    renderInput(
      undefined,
      {
        type: 'number',
        'data-testid': 'input-number',
      },
    );

    expect(screen.getByTestId('input-number')).toHaveAttribute('type', 'number');
  });

  it('should render number component and cast the type', async () => {
    let fieldValue: unknown;
    const { container } = render(
      <InputField
        name="testField"
        value=""
        setValue={(v) => (fieldValue = v)}
        attributes={{
          type: 'number',
        }}
      />
    );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const field = container.querySelector('input')!;
    const assertInput = (value: string, expectedNumber: number) => {
      const event = { target: { value } } as const;

      fireEvent.change(field, event);
      expect(fieldValue).toBe(value);
      fireEvent.blur(field, event);
      expect(fieldValue).toBe(expectedNumber);
    };

    expect(field).toHaveAttribute('type', 'number');
    expect(fieldValue).toBeUndefined();

    assertInput('.1', 0.1);
    assertInput('.0021', 0.0021);
    assertInput('0.000423', 0.000423);
    assertInput('0.1', 0.1);
    assertInput('4.03', 4.03);
    assertInput('123', 123);
  });


  it('should not become dirty after reset', async () => {
    renderInput(
      {
        initialValues: {
          testField: null,
        },
      },
      {
        clearable: true,
      },
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('value', '');

    // Show reset button.
    await userEvent.type(input, 'a');
    await waitFor(() => {
      expect(input).toHaveAttribute('value', 'a');
    });

    const resetButton = input.closest('.field')?.querySelector('button.reset-field-value');
    await userEvent.click(resetButton as HTMLButtonElement);
    await waitFor(() => {
      expect(input).toHaveAttribute('value', '');
    });

    const formItem = input.closest('.form-item') as HTMLDivElement;
    expect(formItem).not.toHaveClass('dirty');
  });
});

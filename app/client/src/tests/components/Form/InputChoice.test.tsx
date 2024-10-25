import { queryHelpers, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { t } from '@plugins/i18n';

import InputChoice from '@components/Form/elements/InputChoice';

import { optionsList } from '@tests/jestUtils/form';
import { renderFormItem } from '@tests/jestUtils/RenderFormItem';

const renderInputChoice = renderFormItem.bind(undefined, InputChoice);

describe(InputChoice,() => {
  describe('Errors', () => {
    it ('should be rendered with empty options', () => {
      renderInputChoice(
        undefined,
        { value: 'testValue' },
      );

      expect(screen.getByText(t('There are no list options!'))).toBeInTheDocument();
    });
  });

  describe('Radio', () => {
    it('should render radio list according to provided options', () => {
      renderInputChoice(
        undefined,
        {
          type: 'radio',
          options: optionsList,
        },
      );

      expect(screen.getAllByText(/option label/)).toHaveLength(3);
    });

    it('should render preselected value', () => {
      renderInputChoice(
        {
          initialValues: {
            testField: '1',
          },
        },
        {
          type: 'radio',
          options: optionsList,
        },
      );

      expect(screen.getByRole('radio', { name: 'option label 1' })).toHaveAttribute('checked', '');
    });

    it('should switch item', async () => {
      renderInputChoice(
        undefined,
        {
          type: 'radio',
          options: optionsList,
        },
      );

      await userEvent.click(screen.getByText('option label 3'));

      await waitFor(() => {
        expect(screen.getByRole('radio', { checked: true })).toBeChecked();
      });
    });
  });

  describe('Checkbox', () => {
    it('should render preselected values', () => {
      renderInputChoice(
        {
          initialValues: {
            testField: ['1', '2'],
          },
        },
        {
          type: 'checkbox',
          options: optionsList,
        },
      );

      const checked = screen.getAllByRole('checkbox')
        .filter((item) => item.hasAttribute('checked'));

      expect(checked).toHaveLength(2);
    });

    it ('should switch item', async () => {
      renderInputChoice(
        {
          initialValues: {
            testField: [],
          },
        },
        {
          type: 'checkbox',
          options: optionsList,
        },
      );

      await userEvent.click(screen.getByText('option label 2'));
      await userEvent.click(screen.getByText('option label 3'));

      await waitFor(() => {
        expect(screen.getAllByRole('checkbox', { checked: true })).toHaveLength(2);
      });
    });

    it('should toggle boolean item', async () => {
      renderInputChoice(
        {
          initialValues: {
            testField: false,
          },
        },
        {
          type: 'checkbox',
          options: [
            {
              label: 'toggle checkbox',
              value: false,
            },
          ],
        },
      );

      await userEvent.click(screen.getByText('toggle checkbox'));

      await waitFor(() => {
        expect(screen.getByRole('checkbox', { checked: true })).toBeChecked();
      });
    });

    it('should extend default class', async () => {
      const { container } = renderInputChoice(
        undefined,
        {
          type: 'checkbox',
          options: [{ label: 'toggle checkbox', value: false }],
          className: 'custom-class',
        },
      );

      const checkbox = queryHelpers.queryByAttribute(
        'class',
        container,
        'input-checkbox-wrapper custom-class'
      ) as HTMLLabelElement;

      expect(checkbox).toBeInTheDocument();
    });
  });
});

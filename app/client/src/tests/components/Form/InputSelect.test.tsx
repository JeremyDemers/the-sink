import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { t } from '@plugins/i18n';

import InputSelect from '@components/Form/elements/InputSelect';

import { optionsList } from '@tests/jestUtils/form';
import { renderFormItem } from '@tests/jestUtils/RenderFormItem';

const renderInputSelect = renderFormItem.bind(undefined, InputSelect);

describe(InputSelect, () => {
  it('should render default', () => {
    renderInputSelect(
      undefined,
      {
        label: 'Select',
        options: optionsList,
        placeholder: 'Select element',
      },
    );

    expect(screen.getByText('Select element')).toBeInTheDocument();
  });

  it('should render preselected value', () => {
    renderInputSelect(
      {
        initialValues: {
          testField: '1',
        },
      },
      {
        label: 'Select',
        options: optionsList,
        placeholder: 'Select element',
      },
    );

    expect(screen.getByText('option label 1')).toBeInTheDocument();
  });

  it('should select option', async () => {
    renderInputSelect(
      undefined,
      {
        label: 'Select',
        options: optionsList,
      },
    );

    await userEvent.click(screen.getByText('Select...'));
    await userEvent.click(screen.getByText('option label 1'));

    await waitFor(() => {
      expect(screen.getByText('option label 1')).toBeInTheDocument();
    });
  });

  it('should display no options message', async () => {
    renderInputSelect(
      undefined,
      {
        label: 'Select',
        options: optionsList,
      },
    );

    await userEvent.click(screen.getByText('Select...'));
    await userEvent.type(screen.getByRole('combobox'), 'random text');

    await waitFor(() => {
      expect(screen.getByText(t('There are no matching options.'))).toBeInTheDocument();
    });
  });
});

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderFormItem } from '@tests/jestUtils/RenderFormItem';
import Textarea from '@components/Form/elements/Textarea';

const renderTextArea = renderFormItem.bind(undefined, Textarea, {
  initialValues: {
    testField: '',
  },
});

describe(Textarea, () => {
  it('should render textarea with all available options', async () => {
    renderTextArea({
      cols: 5,
      placeholder: 'text area placeholder',
    });

    const textarea: HTMLTextAreaElement = screen.getByRole('textbox');

    expect(textarea).toHaveValue('');
    expect(textarea.id).toBe('testField');
    expect(textarea.name).toBe('testField');
    expect(textarea.cols).toBe(5);
    expect(textarea.rows).toBe(2);
    expect(textarea.placeholder).toBe('text area placeholder');

    const value1 = 'First line\nSecondLine' as const;

    await userEvent.type(textarea, value1);
    expect(textarea).toHaveValue(value1);
  });

  it('should extend default class', async () => {
    renderTextArea({
      className: 'custom-class'
    });

    expect(screen.getByRole('textbox')).toHaveClass('custom-class');
  });
});

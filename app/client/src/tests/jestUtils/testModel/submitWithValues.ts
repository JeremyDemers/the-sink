import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';

const submitWithValues = async (text: string) => {
  const inputField = screen.getByTestId('field-title');

  await userEvent.clear(inputField);
  await userEvent.type(inputField, text);
  await userEvent.click(screen.getByTestId('submit'));
};

export default submitWithValues;

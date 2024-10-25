import * as Yup from 'yup';

import { t } from '@plugins/i18n';

Yup.setLocale({
  number: {
    positive: t('Value should be greater than zero'),
    integer: t('Value should be an integer'),
  },
  string: {
    email: t('Enter a valid email'),
  },
  mixed: {
    required: t('This field is required'),
  },
});

export default Yup;

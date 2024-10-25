import React, { type ComponentType } from 'react';
import { Form, Formik, type FormikConfig } from 'formik';
import { render } from '@testing-library/react';

import type { Form as FormTypes } from '@typedef/form';

import FormItem from '@components/Form/elements/FormItem';

const defaultFormConfig: Omit<FormikConfig<Any>, 'onSubmit'> = {
  initialValues: {
    testField: null,
  },
};

export function renderFormItem<Component extends ComponentType<FormTypes.Item.ChildProps<Any, Any>>>(
  component: Component,
  formConfig = defaultFormConfig,
  attributes: Any = {},
) {
  return render(
    <Formik {...formConfig} onSubmit={() => undefined}>
      <Form>
        <FormItem<Component>
          name="testField"
          component={component}
          {...attributes}
        />
      </Form>
    </Formik>
  );
}

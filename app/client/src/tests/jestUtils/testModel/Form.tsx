import React from 'react';
import Model from '@tests/jestUtils/testModel/Model';
import type { ModelFormProps } from '@typedef/models';
import { Form, Formik } from 'formik';
import InputField from '@components/Form/elements/InputField';
import FormItem from '@components/Form/elements/FormItem';

const TestForm: React.FC<ModelFormProps<typeof Model>> = ({ config }) => {
  return (
    <Formik {...config}>
      <Form>
        <FormItem<typeof InputField>
          name="title"
          label="Test title"
          data-testid="field-title"
          component={InputField}
        />

        <button type="submit" data-testid="submit">
          Save
        </button>
      </Form>
    </Formik>
  );
};

export default TestForm;

/* istanbul ignore file */
import React from 'react';
import { Popover, Tooltip } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { Formik, Form } from 'formik';
import classNames from 'classnames';

import type { Form as FormTypes } from '@typedef/form';

import { t } from '@plugins/i18n';
import Yup from '@plugins/yup';

import { Dropzone, acceptedFiles } from '@components/Form/elements/Dropzone';
import { FieldGroup } from '@components/Form/elements/FieldGroup';
import FormItem from '@components/Form/elements/FormItem';
import InputField from '@components/Form/elements/InputField';
import Textarea from '@components/Form/elements/Textarea';
import InputSelect from '@components/Form/elements/InputSelect';
import InputChoice from '@components/Form/elements/InputChoice';

/**
 * NOTE! This function is for the demo purposes only.
 */
async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * NOTE! This function is for the demo purposes only.
 *
 * @param values
 *   Collected form values.
 * @param submitDelayMs
 *   A delay demo that the form is responding to the
 *   submit action and to show a success popup.
 */
async function callToExternalService(values: object, submitDelayMs: number): Promise<void> {
  await sleep(submitDelayMs);

  toast.success('Form data sent successfully.');
  // eslint-disable-next-line no-console
  console.log(values);
  alert(JSON.stringify(values, null, 2));
}

/**
 * NOTE! This function is for the demo purposes only.
 */
async function fetchOptions(): Promise<readonly FormTypes.Option[]> {
  // Simulate an API call.
  await sleep(3000);

  return [
    {
      label: t('Option 1'),
      value: 'option1',
    },
    {
      label: t('Option 2'),
      value: 'option2',
    },
    {
      label: t('Option 3'),
      value: 'option3',
    },
  ];
}

const validationSchema = Yup.object().shape({
  textField: Yup
    .string()
    .min(2, t('Too Short!'))
    .max(70, t('Too Long!'))
    .required(t('Required')),
  emailField: Yup
    .string()
    .email(t('Invalid email'))
    .required(t('Required')),
  fieldGroup: Yup
    .array()
    .min(1)
    .of(
      Yup.object()
        .shape({
          name: Yup.string()
            .min(2, t('Name to short!'))
            .required(),
          email: Yup
            .string()
            .email(t('Invalid email')),
        }),
    ),
});

const dataset = {
  toggleValues: false,
  emptyChoice: false,
  textField: '',
  emailField: '',
  numberField: '',
  passwordField: '',
  textareaField: '',
  selectField: '',
  selectFieldMulti: null,
  selectFieldDynamic: '',
  singleCheckbox: false,
  multipleCheckboxes: [],
  fieldRadio: null,
  fieldRadioInline: null,
  fieldGroup: [],
  singleFile: null,
  multipleFiles: null,
} as const;

const options: readonly FormTypes.Option[] = [
  {
    label: t('Email'),
    value: 'email',
  },
  {
    label: t('Phone'),
    value: 'phone',
  },
  {
    label: t('Mail'),
    value: 'mail',
  },
];

const FormikForm: React.FC = () => {
  return (
    <Formik<typeof dataset>
      initialValues={dataset}
      validationSchema={validationSchema}
      onSubmit={async (values) => {
        await callToExternalService(values, 3000);
      }}
    >
      {({ values, resetForm, isSubmitting, dirty}) => (
        <Form>
          <p><strong>{t('Input components')}</strong></p>
          <p>
            {t('There are four types of input elements than can be used in the project: text (default), number, password, email.\n To choose the type of field, set the type property:')}
          </p>
          <pre className="pre" style={{'width': 'fit-content'}}>
            type=&quot;text/number/password/email&quot;
          </pre>
          <div className={classNames('view-form-values', { on: values.toggleValues })}>
            <pre className="pre">
              {JSON.stringify(values, null, 2)}
            </pre>
          </div>

          <FormItem<typeof InputChoice>
            name="toggleValues"
            component={InputChoice}
            type="checkbox"
            options={
              [
                {
                  label: 'Show form values',
                  value: false,
                },
              ]
            }
          />

          <div className="row">
            <div className="col-md-6">
              <FormItem<typeof InputField>
                name="textField"
                component={InputField}
                label={t('Text')}
                placeholder={t('Type or insert something...')}
                help={t('Input some text to the field.')}
                clearable
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="col-md-6">
              <FormItem<typeof InputField>
                name="emailField"
                component={InputField}
                label={t('Email')}
                placeholder="example@gmail.com"
                help={<Tooltip>{t('Enter the email')}</Tooltip>}
                type="email"
                clearable
                required
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <FormItem<typeof InputField>
                name="passwordField"
                component={InputField}
                label={t('Password')}
                type="password"
                help={
                  {
                    trigger: ['click'],
                    placement: 'right',
                    overlay: (
                      <Popover>
                        <Popover.Header>{t('The good password rules are:')}</Popover.Header>
                        <Popover.Body>
                          <ul className="mb-0 ps-3">
                            <li>{t('Must consist of 8+ characters.')}</li>
                            <li>{t('Must include at least one symbol.')}</li>
                            <li>{t('Must include at least one capital letter.')}</li>
                          </ul>
                        </Popover.Body>
                      </Popover>
                    ),
                  }
                }
              />
            </div>
            <div className="col-md-6">
              <FormItem<typeof InputField>
                name="numberField"
                component={InputField}
                label={t('Number')}
                type="number"
                clearable
              />
            </div>
          </div>

          <div className="row">
            <p>
              <strong>{t('Select elements:')}</strong>
            </p>
            <div className="col-md-4">
              <FormItem<typeof InputSelect>
                name="selectField"
                component={InputSelect}
                label={t('Select')}
                placeholder={t('Select one item')}
                options={options}
                message={t('There are no matched options.')}
                clearable
              />
            </div>

            <div className="col-md-4">
              <FormItem<typeof InputSelect>
                name="selectFieldMulti"
                component={InputSelect}
                label={t('Multi select')}
                placeholder={t('Select multiple items')}
                options={options}
                isMulti
                clearable
              />
            </div>

            <div className="col-md-4">
              <FormItem<typeof InputSelect>
                name="selectFieldDynamic"
                component={InputSelect}
                label={t('Select with dynamic values')}
                placeholder={t('Select one item')}
                options={fetchOptions}
                description={t('The data is fetched when the page is loaded. Refresh the page to see the behavior.')}
                clearable
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <p>
                <strong>{t('Checkboxes:')}</strong>
              </p>
              <FormItem<typeof InputChoice>
                name="singleCheckbox"
                component={InputChoice}
                label={t('Single checkbox')}
                type="checkbox"
                options={
                  [
                    {
                      label: t('Toggle'),
                      value: true,
                    },
                  ]
                }
              />
              <FormItem<typeof InputChoice>
                name="multipleCheckboxes"
                component={InputChoice}
                label={t('Multiple checkboxes')}
                type="checkbox"
                options={options}
              />
            </div>

            <div className="col-md-6">
              <p>
                <strong>{t('Radio:')}</strong>
              </p>
              <FormItem<typeof InputChoice>
                name="fieldRadioInline"
                component={InputChoice}
                label={t('Inline elements view')}
                type="radio"
                inline
                options={options}
              />

              <FormItem<typeof InputChoice>
                name="fieldRadio"
                component={InputChoice}
                label={t('Radio')}
                type="radio"
                options={options}
              />
            </div>
          </div>

          <div className="row">
            <FormItem<typeof Textarea>
              name="textareaField"
              component={Textarea}
              label={t('Textarea')}
              placeholder={t('Provide short description on the subject.')}
            />
          </div>

          <div className="row">
            <div className="form-item">
              <hr/>
              <p><strong>{t('Fields group:')}</strong></p>
              <FieldGroup<{ name: string; email: string }>
                max={10}
                name="fieldGroup"
                newValue={{ name: '', email: '' }}
              >
                {({name, index}) => (
                  <div className="row col-md-11" key={index}>
                    <div className="col-md-6">
                      <FormItem<typeof InputField>
                        name={`${name}.${index}.name`}
                        component={InputField}
                        label={t('Text')}
                        placeholder={t('Type or insert something...')}
                        type="text"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <FormItem<typeof InputField>
                        name={`${name}.${index}.email`}
                        component={InputField}
                        label={t('Email')}
                        placeholder="example@gmail.com"
                        type="email"
                      />
                    </div>
                  </div>
                )}
              </FieldGroup>
              <hr/>
            </div>
          </div>

          <div className="row">
            <FormItem<typeof Dropzone>
              name="singleFile"
              component={Dropzone}
              label={t('Default file uploader, that will accept only PDF files. File size limit is 32 MB by default.')}
            />

            <FormItem<typeof Dropzone>
              name="multipleFiles"
              component={Dropzone}
              label={t('Adjusted file uploader, file type along with maximum file size has been changed.')}
              dropZoneConfig={{
                accept: acceptedFiles.images,
                maxSize: 5 * 1024 * 1024,
                maxFiles: 12,
              }}
            />
          </div>

          <div className="mt-3 d-flex">
            <button
              type="reset"
              className="btn btn--outline ms-auto"
              onClick={() => resetForm()}
              disabled={!dirty || isSubmitting}
            >
              {t('Reset')}
            </button>
            <button
              type="submit"
              className={classNames('btn btn--primary ms-3', { 'btn--loading': isSubmitting })}
              disabled={!dirty || isSubmitting}
            >
              {t('Submit')}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default FormikForm;

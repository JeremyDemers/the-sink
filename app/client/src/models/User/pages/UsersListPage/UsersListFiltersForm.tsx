import React, { useEffect, useState } from 'react';
import { Form, Formik } from 'formik';
import { useSearchParams } from 'react-router-dom';

import type { Form as FormTypes } from '@typedef/form';
import type { EntityFiltersType } from '@typedef/models';
import type { FilterFormProps } from '@typedef/table';

import { t } from '@plugins/i18n';

import FormItem from '@components/Form/elements/FormItem';
import InputField from '@components/Form/elements/InputField';
import InputSelect from '@components/Form/elements/InputSelect';

import type { User, UserModel } from '@models/User';
import { UserRoleMetadata } from '../../constants';

const defaultValues: Required<User.Filters> = {
  role_filter: '',
  name_filter: '',
  email_filter: '',
} as const;

const roleOptions: readonly FormTypes.Option[] = Object
  .entries(UserRoleMetadata)
  .map(([role, metadata]) => ({
    label: metadata.label,
    value: role,
  }));

export const UsersListFiltersForm: React.FC<FilterFormProps<UserModel>> = ({
  config,
  filters,
  isLoading,
}) => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [params] = useSearchParams();

  useEffect(() => {
    setIsBlocked(params.get('status_filter') === '0');
  }, [params]);

  const resetForm = () => config.resetForm(
    isBlocked
      ? { ...filters, status_filter: '' }
      : filters,
  );

  return (
    <Formik<EntityFiltersType<UserModel>>
      {...config}
      initialValues={{ ...defaultValues, ...filters }}
    >
      {({ dirty }) => (
        <Form className="form-filters mb-5" aria-label="form">
          <div className="row">
            <div className="col-md-4">
              <FormItem<typeof InputField>
                name="name_filter"
                component={InputField}
                label={t('Name')}
                placeholder={t('Search by user name')}
                disabled={isLoading}
              />
            </div>
            <div className="col-md-4">
              <FormItem<typeof InputField>
                name="email_filter"
                component={InputField}
                label={t('Email')}
                placeholder={t('Search by user email address')}
                disabled={isLoading}
              />
            </div>
            <div className="col-md-4">
              <FormItem<typeof InputSelect>
                name="role_filter"
                component={InputSelect}
                label={t('Role')}
                placeholder={t('Search by user role')}
                options={roleOptions}
                disabled={isLoading}
                clearable
              />
            </div>
          </div>
          <div className="form-filters__actions d-flex">
            <button
              type="submit"
              className="btn btn--secondary"
              disabled={isLoading || !dirty}
            >
              {t('Apply')}
            </button>
            <button
              type="reset"
              className="btn btn--reset ms-md-3"
              onClick={resetForm}
              disabled={isLoading}
            >
              <i className="font-icon-reset icon-m btn--icon-left" />
              {t('Reset')}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

import React, { useContext } from 'react';
import { Formik, Form } from 'formik';
import classNames from 'classnames';

import type { Form as FormTypes } from '@typedef/form';
import type { ModelFormProps } from '@typedef/models';

import { AuthContext } from '@context/AuthProvider';
import { t } from '@plugins/i18n';

import Note from '@components/Note';
import FormItem from '@components/Form/elements/FormItem';
import InputField from '@components/Form/elements/InputField';
import InputSelect from '@components/Form/elements/InputSelect';
import InputChoice from '@components/Form/elements/InputChoice';

import type { UserModel } from '@models/User';
import { UserRoleMetadata } from '../../constants';

const roleOptions: readonly FormTypes.Option[] = Object
  .entries(UserRoleMetadata)
  .map(([role, metadata]) => ({
    label: metadata.label,
    value: Number(role),
  }));

export const UserUpsertForm: React.FC<ModelFormProps<UserModel>> = ({
  model,
  config,
}) => {
  const { initialValues: user } = config;
  const { auth, hasAccess } = useContext(AuthContext);
  const userExists = !model.isNew(user);
  const isViewMode = !(
    userExists
      ? hasAccess(model.routes.edit) && model.canBeEdited(user, auth?.user)
      : hasAccess(model.routes.add)
  );

  return (
    <>
      <div className="page-header">
        <h1 className="col-md-10">
          {user.id ? user.email : t('Create new user')}
        </h1>
      </div>
      <Formik {...config}>
        {({ isSubmitting, dirty, values }) => {
          const isBlocked = !values.is_active;

          return (
            <Form aria-label="form">
              {
                isBlocked && <Note description={t('You need to unblock user before editing.')} />
              }
              {userExists &&
                <FormItem<typeof InputField>
                  name="name"
                  component={InputField}
                  type="email"
                  label={t('Name')}
                  placeholder={t("Value will be automatically populated after the first user's login.")}
                  disabled={isSubmitting}
                  readOnly
                />
              }
              <FormItem<typeof InputField>
                name="email"
                component={InputField}
                type="email"
                label={t('Email')}
                placeholder="example-email@gmail.com"
                description={t('Use the email of a colleague who can log in using Sink SSO.')}
                readOnly={userExists || isViewMode}
                disabled={isSubmitting}
                required
              />
              <FormItem<typeof InputSelect>
                name="role"
                component={InputSelect}
                options={roleOptions}
                label={t('Role')}
                placeholder={t('Select user Role')}
                readOnly={isViewMode}
                disabled={isSubmitting || isBlocked}
                required
              />
              <FormItem<typeof InputChoice>
                name="is_active"
                component={InputChoice}
                type="checkbox"
                label={t('Status')}
                options={
                  [{
                    label: t('Active'),
                    value: !!user.is_active,
                  }]
                }
                disabled={!userExists || isSubmitting || isViewMode}
              />
              {!isViewMode && (
                <div className="py-3">
                  <div className="d-flex justify-content-end">
                    <button
                      type="submit"
                      className={classNames('btn btn--primary ms-3', { 'btn--loading': isSubmitting })}
                      disabled={isSubmitting || !dirty}
                    >
                      {t('Save user')}
                    </button>
                  </div>
                </div>
              )}
            </Form>
          );
        }}
      </Formik>
    </>
  );
};

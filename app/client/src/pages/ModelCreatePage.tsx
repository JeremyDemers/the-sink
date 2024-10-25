import React, { useContext } from 'react';
import { type FormikConfig } from 'formik';
import { toast } from 'react-toastify';
import { NavLink, useNavigate } from 'react-router-dom';

import type { EntityType, ModelFormPage } from '@typedef/models';
import type { BaseModel } from '@models/Base';

import { AuthContext } from '@context/AuthProvider';
import { t } from '@plugins/i18n';
import { formUtils } from '@utils/form';

export function ModelCreatePage<Model extends BaseModel<Any, Any>>({
  entityForm: EntityForm,
  model,
  successMessage,
  errorMessage,
}: ModelFormPage<Model>) {
  const { hasAccess } = useContext(AuthContext);
  const navigate = useNavigate();
  const formik: FormikConfig<EntityType<Model>> = {
    initialValues: model.emptyModel,
    validationSchema: model.validationSchema,
    onSubmit: (values) => (
      model
        .create(values)
        .then((created) => {
          toast.success(successMessage);

          for (const pathType of ['edit', 'view'] as const) {
            if (hasAccess(model.routes[pathType])) {
              return navigate(model.routes[pathType].toUrl(created.id as number), { replace: true });
            }
          }

          return navigate(model.routes.list.path);
        })
        .catch((error) => formUtils.toast.showResponseErrors(error, errorMessage))
    )
  };

  return (
    <>
      <NavLink
        to={model.routes.list.path}
        className="btn btn-icon btn--icon-small btn--icon-left"
      >
        <i className="font-icon-chevron-left"></i>
        {t('Back')}
      </NavLink>
      <EntityForm model={model} config={formik} />
    </>
  );
}

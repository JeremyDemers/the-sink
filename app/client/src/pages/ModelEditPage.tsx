import React, { useEffect, useState } from 'react';
import { type FormikConfig } from 'formik';
import { toast } from 'react-toastify';
import { NavLink, useParams } from 'react-router-dom';

import type { EntityType, ModelFormPage } from '@typedef/models';
import type { BaseModel } from '@models/Base';

import { t } from '@plugins/i18n';
import { formUtils } from '@utils/form';

import Spinner from '@components/Spinner';

import { PageError } from '@pages/Error';

export function ModelEditPage<Model extends BaseModel<Any, Any>>({
  entityForm: EntityForm,
  model,
  successMessage,
  errorMessage,
}: ModelFormPage<Model>) {
  const entityId = model.routes.edit.getPrimaryKey(useParams()) as number;
  const [entity, setEntity] = useState<EntityType<Model> | null | undefined>();

  useEffect(
    () => {
      model
        .load(entityId)
        .then(setEntity)
        .catch(() => setEntity(null));
    },
    [entityId, model],
  );

  if (entity === undefined) {
    return <Spinner />;
  }

  if (entity === null) {
    return <PageError />;
  }

  const formik: FormikConfig<EntityType<Model>> = {
    initialValues: entity,
    validationSchema: model.validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => (
      model
        .update(values)
        .then((updated) => {
          toast.success(successMessage);
          setEntity(updated);
          return updated;
        })
        .catch((error) => formUtils.toast.showResponseErrors(error, errorMessage))
    ),
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
      <EntityForm model={model} config={formik} setEntity={setEntity} />
    </>
  );
}

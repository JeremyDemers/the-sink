import React, { useContext, useState } from 'react';
import { Form, Formik } from 'formik';
import classNames from 'classnames';

import type { ModelFormProps } from '@typedef/models';

import { AuthContext } from '@context/AuthProvider';
import { t } from '@plugins/i18n';

import Note from '@components/Note';
import Spinner from '@components/Spinner';
import FormItem from '@components/Form/elements/FormItem';
import InputField from '@components/Form/elements/InputField';
import Textarea from '@components/Form/elements/Textarea';

import type { ProjectModel } from '../../ProjectModel';
import { ProjectStatusMetadata } from '../../constants';
import { ProjectTransitions } from './ProjectTransitions';

export const ProjectUpsertForm: React.FC<ModelFormProps<ProjectModel>> = ({
  model,
  config,
  setEntity,
}) => {
  const { initialValues: project } = config;
  const { auth, hasAccess } = useContext(AuthContext);
  const isNew = model.isNew(project);
  const userCanEdit = hasAccess(model.routes[isNew ? 'add' : 'edit']);
  const [processing, setProcessing] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  // Project can be edited only on edit page and if it's allowed.
  const canBeEdited = model.canBeEdited(project, auth?.user) && userCanEdit;
  // Display explanation text, on why project can be edited on the edit page.
  const noEditsNote = !canBeEdited && userCanEdit && project.status
    ? t(
      'Please note that currently no edits are allowed as the project is in the {{ status }} status',
      {
        status: ProjectStatusMetadata[project.status]?.label || project.status,
      },
    )
    : '';

  return (
    <>
      <div className="page-header">
        <h1 className="col-md-10">
          {project.id ? project.title : t('My new project')}
        </h1>
      </div>

      {project.status && (
        <ProjectTransitions
          model={model}
          project={project}
          userCanEdit={userCanEdit}
          isSubmitting={isFormSubmitting}
          setEntity={setEntity}
          setProcessing={setProcessing}
        />
      )}

      {processing
        ? <Spinner />
        : <Formik
          {...config}
          onSubmit={async (values, actions) => {
            setIsFormSubmitting(true);
            await config.onSubmit(values, actions);
            setIsFormSubmitting(false);
          }}
        >
          {({ isSubmitting, dirty }) => (
            <Form aria-label="form">
              {
                noEditsNote && <Note description={noEditsNote} />
              }
              <FormItem<typeof InputField>
                name="title"
                component={InputField}
                label={t('Project title')}
                placeholder={t('My new project')}
                disabled={isSubmitting}
                readOnly={!canBeEdited}
                required
              />
              <FormItem<typeof Textarea>
                name="description"
                component={Textarea}
                label={t('Description')}
                placeholder={t('My new project description')}
                disabled={isSubmitting}
                readOnly={!canBeEdited}
                required
              />
              {canBeEdited && (
                <div className="py-3">
                  <div className="d-flex justify-content-end">
                    <button
                      type="submit"
                      className={classNames('btn btn--primary ms-3', { 'btn--loading': isSubmitting })}
                      disabled={isSubmitting || !dirty}
                    >
                      {t('Save project')}
                    </button>
                  </div>
                </div>
              )}
            </Form>
          )}
        </Formik>
      }
    </>
  );
};

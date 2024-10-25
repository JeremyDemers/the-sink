import React, { useEffect, useState } from 'react';
import { Form, Formik } from 'formik';
import { useSearchParams } from 'react-router-dom';
import classNames from 'classnames';

import type { Form as FormTypes } from '@typedef/form';
import type { EntityFiltersType } from '@typedef/models';
import type { FilterFormProps } from '@typedef/table';

import { t } from '@plugins/i18n';
import Yup from '@plugins/yup';

import CollapsibleContent from '@components/CollapsibleContent';
import FormItem from '@components/Form/elements/FormItem';
import InputField from '@components/Form/elements/InputField';
import InputSelect from '@components/Form/elements/InputSelect';

import type { Project, ProjectModel } from '@models/Project';
import { ProjectStatus, ProjectStatusMetadata } from '../../constants';

const defaultValues: Required<Project.Filters> = {
  title_filter: '',
  status_filter: '',
  author_name_filter: '',
  created_from_filter: '',
  created_to_filter: '',
} as const;

const statusOptions: readonly FormTypes.Option[] = Object
  .entries(ProjectStatusMetadata)
  .filter(([status, _]) => status !== ProjectStatus.Archived)
  .map(([value, metadata]) => ({
    label: metadata.label,
    value,
  }));

const validationSchema = Yup.object().shape({
  created_to_filter: Yup.date().nullable(),
  created_from_filter: Yup.date().nullable().test(
    'is-valid',
    t('"Created from" must be earlier than "Created to"'),
    (value: Date | null | undefined, context: Yup.TestContext) => {
      const { created_to_filter } = context.parent;
      if (!value || !created_to_filter) {
        return true;
      }
      return value <= created_to_filter;
    }),
});

export const ProjectsListFiltersForm: React.FC<FilterFormProps<ProjectModel>> = ({
  filters,
  config,
  isLoading,
}) => {
  const [isArchived, setIsArchived] = useState(false);
  const [params] = useSearchParams();

  useEffect(() => {
    setIsArchived(params.get('status_filter') === ProjectStatus.Archived);
  }, [params]);

  const resetForm = () => config.resetForm(
    isArchived
      ? { ...filters, status_filter: '' }
      : filters,
  );

  return (
    <Formik<EntityFiltersType<ProjectModel>>
      {...config}
      validationSchema={validationSchema}
      initialValues={{ ...defaultValues, ...filters }}
    >
      {({ dirty }) => (
        <Form
          className={classNames('form-filters mb-5', { 'form-filters__archived': isArchived })}
          aria-label="form"
        >
          <div className="form-filters__search">
            <FormItem<typeof InputField>
              name="title_filter"
              component={InputField}
              label={t('Title')}
              placeholder={t('Search by project title')}
              disabled={isLoading}
              clearable
            />
          </div>

          <CollapsibleContent
            buttonConfig={{
              buttonWrapperClassName: 'form-filters__btn-container',
              className: 'btn btn-link btn--toggle-filters mb-2 mb-md-0',
              buttonLabel: {
                activeName: t('Less filters'),
                inactiveName: t('More filters'),
              },
              icon: {
                activeName: 'close',
                inactiveName: 'filter',
                size: 'icon-xs',
                position: 'right'
              }
            }}
            contentConfig={{
              wrapperClassName: 'form-filters__wrapper',
              contentClassName: 'form-filters__content'
            }}
          >
            {!isArchived && (
              <div className="form-filters__item-small">
                <FormItem<typeof InputSelect>
                  name="status_filter"
                  component={InputSelect}
                  options={statusOptions}
                  label={t('Status')}
                  placeholder={t('Search by project status')}
                  disabled={isLoading}
                  clearable
                />
              </div>
            )}
            <div className="form-filters__item-small">
              <FormItem<typeof InputField>
                name="author_name_filter"
                component={InputField}
                label={t('Author')}
                placeholder={t("Search by author's name")}
                disabled={isLoading}
                clearable
              />
            </div>
            <div className="form-filters__item-small">
              <FormItem<typeof InputField>
                name="created_from_filter"
                component={InputField}
                label={t('Created from')}
                type="date"
                disabled={isLoading}
                clearable
              />
            </div>
            <div className="form-filters__item-small">
              <FormItem<typeof InputField>
                name="created_to_filter"
                component={InputField}
                label={t('Created to')}
                type="date"
                disabled={isLoading}
                clearable
              />
            </div>
          </CollapsibleContent>
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

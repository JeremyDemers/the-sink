import React, { Dispatch, SetStateAction, useState } from 'react';
import { toast } from 'react-toastify';

import type { EntityType, ModelComponentProps } from '@typedef/models';

import { t } from '@plugins/i18n';

import { Modal } from '@components/Modal';

import type { Project, ProjectModel } from '@models/Project';
import { ProjectStatusMetadata, ProjectTransitionMetadata } from '../../constants';

interface Props extends ModelComponentProps<ProjectModel> {
  readonly project: EntityType<ProjectModel>;
  readonly userCanEdit: boolean;
  readonly isSubmitting: boolean;
  readonly setEntity: ((entity: EntityType<ProjectModel>) => void) | undefined;
  readonly setProcessing: Dispatch<SetStateAction<boolean>>;
}

export const ProjectTransitions: React.FC<Props> = ({
  model,
  project,
  userCanEdit,
  isSubmitting,
  setEntity,
  setProcessing,
}) => {
  const { status } = project;
  // Transition buttons are available only if a user can edit the project.
  const allowedTransitions = userCanEdit ? project.allowed_transitions : [];
  const [confirmModal, setConfirmModal] = useState(false);
  const [actionName, setActionName] = useState<Project.Transition | ''>('');
  const executeTransition = (transition: Project.Transition) => {
    setConfirmModal(false);
    setProcessing(true);

    model
      .changeStatus(project, transition)
      .then((updated) => {
        toast.success(t('Project status has been updated.'));
        setEntity?.(updated);
        return updated;
      })
      .catch(() => toast.error(t('Unable to transition project to the status. Please contact website administrator.')))
      .finally(() => {
        setProcessing(false);
        setActionName('');
      });
  };

  const showConfirmModal = (transition: Project.Transition) => {
    setConfirmModal(true);
    setActionName(transition);
  };

  return (
    <>
      {status && (
        <div className="my-5 card header-actions">
          <div className="status">
            {t('Status:')}
            <div className="d-flex align-items-center">
              <i className={`font-icon-${status} status-${status} icon-m`} />
              <strong className="status-name">
                {ProjectStatusMetadata[status]?.label || status}
              </strong>
            </div>
          </div>

          {allowedTransitions && (
            <div className="transition-actions">
              {allowedTransitions.map((transition) => (
                <div key={transition} className="transition-actions--item">
                  <button
                    type="button"
                    name={transition}
                    className="btn btn-icon btn--icon-small btn--icon-m"
                    disabled={isSubmitting}
                    onClick={() => showConfirmModal(transition)}
                  >
                    <i className={`font-icon-${transition}`} />
                    {ProjectTransitionMetadata[transition]?.label || transition}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {confirmModal && actionName && (
        <Modal
          close={setConfirmModal.bind(undefined, false)}
          accept={executeTransition.bind(undefined, actionName)}
          title={t('Project status change')}
          text={t('You are about to execute "{{ transition }}" action. Do you want to proceed?', {
            transition: ProjectTransitionMetadata[actionName]?.label || actionName,
          })}
          closeButtonText={t('Cancel')}
          acceptButtonText={t('Confirm')}
          icon={{ name: 'warning', color: 'red' }}
          closeOnOverlayClick={false}
        />
      )}
    </>
  );
};

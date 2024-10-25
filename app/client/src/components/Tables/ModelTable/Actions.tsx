import React, { useContext, Fragment } from 'react';
import { toast } from 'react-toastify';
import { NavLink } from 'react-router-dom';
import type { Row } from '@tanstack/react-table';

import 'bootstrap/js/dist/dropdown';

import type { EntityListItemType } from '@typedef/models';
import type { BaseModel } from '@models/Base';

import { AuthContext } from '@context/AuthProvider';
import { t } from '@plugins/i18n';
import { noop } from '@utils/misc';

import { useModal } from '@components/Modal';

import type { Table } from './types';

interface ActionsProps<Model extends BaseModel<Any, Any>> {
  readonly row: Row<EntityListItemType<Model>>;
  readonly model: Model;
  readonly actions?: readonly Table.Model.Action<Any>[];
  readonly onDelete: VoidFunction;
}

interface ActionProps {
  readonly action: Table.Model.Action<Any>;
  readonly className: string;
}

const classes = (() => {
  const button = 'btn btn-secondary btn-sm' as const;
  const item = 'd-inline-flex align-items-center gap-2' as const;

  return {
    main: `${button} ${item}`,
    toggle: `${button} dropdown-toggle dropdown-toggle-split`,
    item: `${item} dropdown-item`,
  } as const;
})();

const Action: React.FC<ActionProps> = ({ action, className }) => {
  return (
    <action.component {...{ ...action.props, className }}>
      <i title={action.label} className={`${action.icon} icon-s`}/>
      {action.label}
    </action.component>
  );
};

export function Actions<Model extends BaseModel<Any, Any>>({
  row,
  model,
  actions,
  onDelete,
}: ActionsProps<Model>) {
  let dividerIndex = -1;
  const { auth, hasAccess } = useContext(AuthContext);
  const actionsList: Table.Model.Action<Any>[] = [];
  const deletionModal = useModal({
    title: t('Delete the record'),
    close: noop,
    closeButtonText: t('No, let it stay'),
    accept: () => model
      .delete(row.original.id)
      .then(onDelete),
    acceptButtonText: t('Yes, delete it'),
    text: t(
      'Do you want to delete the "{{ name }}" record? This action cannot be undone.',
      {
        name: model.getLabel(row.original),
      },
    ),
    onError: () => {
      toast.error(t('Unable to delete the record. Please retry or contact the website administrator.'));
    },
  });

  if (hasAccess(model.routes.edit) && model.canBeEdited(row.original, auth?.user)) {
    const action: Table.Model.Action<typeof NavLink> = {
      label: t('Edit'),
      icon: 'font-icon-edit',
      component: NavLink,
      props: {
        to: model.routes.edit.toUrl(row.original.id),
      },
    };

    actionsList.push(action);
  } else if (hasAccess(model.routes.view)) {
    const action: Table.Model.Action<typeof NavLink> = {
      label: t('View'),
      icon: 'font-icon-file',
      component: NavLink,
      props: {
        to: model.routes.view.toUrl(row.original.id),
      },
    };

    actionsList.push(action);
  }

  if (model.access.delete && hasAccess(model.access.delete) && model.canBeDeleted(row.original, auth?.user)) {
    const action: Table.Model.Action<'button'> = {
      label: t('Delete'),
      icon: 'font-icon-delete',
      component: 'button',
      props: {
        type: 'button',
        onClick: deletionModal.show,
      },
    };

    actionsList.push(action);
  }

  if (actions?.length) {
    // The custom actions starts after this index.
    dividerIndex = actionsList.length - 1;
    actionsList.push(...actions);
  }

  if (actionsList.length === 0) {
    return null;
  }

  const [firstAction, ...restActions] = actionsList;

  return (
    <div className="btn-group" role="group">
      <Action action={firstAction} className={classes.main} />
      {restActions.length > 0 && (
        <>
          <button
            type="button"
            className={classes.toggle}
            aria-expanded="false"
            data-bs-toggle="dropdown"
          >
            <span className="visually-hidden">
              {t('Toggle Actions')}
            </span>
          </button>

          <ul className="dropdown-menu">
            {restActions.map((action, index) => (
              <Fragment key={index}>
                {index === dividerIndex && (
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                )}
                <li>
                  <Action action={action} className={classes.item}/>
                </li>
              </Fragment>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

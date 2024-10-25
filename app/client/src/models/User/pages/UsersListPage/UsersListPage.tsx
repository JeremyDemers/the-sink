import React from 'react';
import type { ColumnDef } from '@tanstack/react-table';

import type { EntityListItemType, ModelComponentProps } from '@typedef/models';
import type { TabsList } from '@typedef/table';

import useTabs from '@hooks/useTabs';
import { t } from '@plugins/i18n';
import { formatDatetime } from '@utils/date';

import { ModelTable } from '@components/Tables/ModelTable';

import type { UserModel } from '@models/User';
import { UsersListFiltersForm } from './UsersListFiltersForm';
import { UserRoleMetadata } from '../../constants';

const tabsList: TabsList = [
  {
    id: 'active',
    title: t('Users'),
  },
  {
    id: 'blocked',
    title: t('Blocked users'),
    params: {
      status_filter: '0',
    },
  },
];

const columns: ColumnDef<EntityListItemType<UserModel>>[] = [
  {
    accessorKey: 'name',
    header: t('Name'),
  },
  {
    accessorKey: 'email',
    header: t('Email'),
  },
  {
    accessorKey: 'role',
    header: t('Role'),
    cell: ({ row }) => (
      UserRoleMetadata[row.original.role]?.label
      || row.original.role
    ),
  },
  {
    accessorKey: 'created_at',
    header: t('Created'),
    cell: ({ row }) => formatDatetime(row.original.created_at),
    maxSize: 140,
  },
  {
    accessorKey: 'updated_at',
    header: t('Updated'),
    cell: ({ row }) => formatDatetime(row.original.updated_at),
    maxSize: 140,
  },
];

export const UsersListPage: React.FC<ModelComponentProps<UserModel>> = ({ model }) => {
  const activeTab = useTabs(tabsList);

  return (
    <div className="users-list">
      <ModelTable<typeof model>
        filterForm={UsersListFiltersForm}
        pageTabs={tabsList}
        pageTitle={activeTab.title}
        createNewLink={t('Create new user')}
        model={model}
        fetchErrorMsg={t('Unable to fetch the users list. Please contact site administrator.')}
        noResults={t('There are no users matching your search criteria')}
        columns={columns}
      />
    </div>
  );
};

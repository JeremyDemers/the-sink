import React from 'react';
import type { ColumnDef } from '@tanstack/react-table';

import type { EntityListItemType, ModelComponentProps } from '@typedef/models';
import type { TabsList } from '@typedef/table';

import useTabs from '@hooks/useTabs';
import { t } from '@plugins/i18n';
import { formatDatetime } from '@utils/date';

import { ModelTable } from '@components/Tables/ModelTable';

import type { ProjectModel } from '@models/Project';
import { ProjectsListFiltersForm } from './ProjectsListFiltersForm';
import { ProjectStatusMetadata } from '../../constants';

const tabsList: TabsList = [
  {
    id: 'active',
    title: t('Projects'),
  },
  {
    id: 'archived',
    title: t('Archived projects'),
    params: {
      status_filter: 'archived',
    },
  },
];

const columns: ColumnDef<EntityListItemType<ProjectModel>>[] = [
  {
    accessorKey: 'title',
    header: t('Title'),
    cell: ({ row }) => (
      <strong>
        {row.original.title}
      </strong>
    ),
  },
  {
    accessorKey: 'author.name',
    header: t('Author'),
  },
  {
    accessorKey: 'status',
    header: t('Status'),
    cell: ({ row }) => (
      ProjectStatusMetadata[row.original.status]?.label
      || row.original.status
    ),
    maxSize: 100,
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

export const ProjectsListPage: React.FC<ModelComponentProps<ProjectModel>> = ({ model }) => {
  const activeTab = useTabs(tabsList);

  return (
    <div className="projects-list">
      <ModelTable<typeof model>
        filterForm={ProjectsListFiltersForm}
        pageTabs={tabsList}
        pageTitle={activeTab.title}
        createNewLink={t('Create new project')}
        model={model}
        fetchErrorMsg={t('Unable to fetch projects list. Please contact site administrator.')}
        noResults={t('There are no projects matching your search criteria')}
        columns={columns}
      />
    </div>
  );
};

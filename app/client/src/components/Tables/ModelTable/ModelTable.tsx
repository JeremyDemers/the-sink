import React, { useCallback, useContext, useEffect, useState, type ComponentType } from 'react';
import { NavLink, SetURLSearchParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import type { ColumnDef, Row } from '@tanstack/react-table';

import type { EntityListItemType, ModelListResponse, ModelComponentProps, EntityFiltersType } from '@typedef/models';
import type { FilterFormProps, TabsList } from '@typedef/table';
import type { BaseModel } from '@models/Base';

import { AuthContext } from '@context/AuthProvider';
import { t } from '@plugins/i18n';

import PageNavTabs from '@components/PageNavTabs';
import { ServerTable } from '@components/Tables/ServerTable';

import type { Table } from './types';
import { Actions } from './Actions';

interface Props<Model extends BaseModel<Any, Any>> extends ModelComponentProps<Model> {
  readonly fetchErrorMsg: string;
  readonly noResults?: string;
  readonly columns: ColumnDef<EntityListItemType<Model>>[];
  readonly filterForm?: ComponentType<FilterFormProps<Model>>;
  readonly pageTitle: string;
  readonly pageTabs?: TabsList;
  readonly createNewLink?: string;
  readonly actions?: (row: Row<EntityListItemType<Model>>) => readonly Table.Model.Action<Any>[];
}

function getFiltersFormConfig<
  Model extends BaseModel<Any, Any>,
>(
  setSearchParams: SetURLSearchParams,
): FilterFormProps<Model>['config'] {
  return {
    enableReinitialize: true,
    onSubmit: (values) => setSearchParams((prev) => {
      const newState = new URLSearchParams(prev.toString());
      // Always reset the pager.
      newState.delete('page');

      for (const key in values) {
        if (values[key]) {
          newState.set(key, values[key]);
        } else {
          newState.delete(key);
        }
      }

      return newState;
    }),
    resetForm: (filters) => {
      setSearchParams((prev) => {
        const newState = new URLSearchParams(prev.toString());
        // Always reset the pager.
        newState.delete('page');

        for (const key in filters) {
          newState.delete(key);
        }

        return newState;
      });
    }
  };
}

export function ModelTable<Model extends BaseModel<Any, Any>>({
  filterForm: FilterForm,
  model,
  columns,
  pageTitle,
  pageTabs,
  createNewLink,
  fetchErrorMsg,
  noResults,
  actions,
}: Props<Model>) {
  const { hasAccess } = useContext(AuthContext);
  const [params, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [response, setResponse] = useState<ModelListResponse<Model>>({
    items: [],
    sort: [],
    filters: {} as EntityFiltersType<Model>,
    pager: {
      per_page: 10,
      page: 1,
      total: 0,
    },
  });
  const query = useCallback(
    () => {
      setIsLoading(true);
      model
        .list(params)
        .then(setResponse)
        .catch(() => toast.error(fetchErrorMsg))
        .finally(() => setIsLoading(false));
    },
    [model, params, fetchErrorMsg],
  );
  const columnsList: typeof columns = [
    ...columns,
    {
      accessorKey: 'action',
      enableSorting: false,
      header: t('Actions'),
      maxSize: 100,
      minSize: 50,
      size: 50,
      cell: (props) => (
        <Actions
          row={props.row}
          model={model}
          actions={actions?.(props.row)}
          onDelete={query}
        />
      ),
    },
  ];

  useEffect(query, [query]);

  return (
    <div>
      <div className="d-flex justify-content-between flex-wrap mb-4">
        <h2>{pageTitle}</h2>
        {createNewLink && hasAccess(model.routes.add) && (
          <NavLink to={model.routes.add.path} className="add-link btn btn--primary mb-4 align-self-center">
            <i className="font-icon-plus icon-s icon-left" />
            {createNewLink}
          </NavLink>
        )}
      </div>
      {pageTabs && pageTabs.length > 1 && <PageNavTabs items={pageTabs} />}
      {FilterForm && (
        <FilterForm
          filters={response.filters}
          config={getFiltersFormConfig(setSearchParams)}
          isLoading={isLoading}
        />
      )}
      <ServerTable<EntityListItemType<Model>>
        columns={columnsList}
        data={response.items}
        sorting={response.sort}
        noResultsText={noResults}
        isLoading={isLoading}
        setSearchParams={setSearchParams}
        pagination={{
          pageIndex: response.pager.page,
          pageSize: response.pager.per_page,
          rowCount: response.pager.total,
        }}
      />
    </div>
  );
}

import React from 'react';
import { Column, flexRender, type Table } from '@tanstack/react-table';
import { t } from '@plugins/i18n';
import classNames from 'classnames';

interface SortIconProps {
  readonly column: Column<Any>;
}

interface TableHeadProps {
  readonly table: Table<Any>;
}

function getSortingLabel(asc: boolean): string {
  return asc ? t('Sort ascendingly') : t('Sort descendingly');
}

const SortIcon: React.FC<SortIconProps> = ({ column }) => {
  // Do not render sortable icon for not sortable columns.
  if (!column.getCanSort()) {
    return null;
  }

  const isSorted = column.getIsSorted();

  if (!isSorted) {
    // Render default sortable icon.
    return (
      <i className="font-icon-sort icon-m" />
    );
  }

  // Render icon depending on current sort state: ascending or descending
  return (
    <i className={`font-icon-arrow-${isSorted === 'asc' ? 'up' : 'down'} icon-s`} />
  );
};

export const TableHead: React.FC<TableHeadProps> = ({ table }) => {
  return (
    <thead>
      {table.getHeaderGroups().map((group) => (
        <tr key={group.id}>
          {group.headers.map((header) => (
            <th
              key={header.id}
              className={classNames(header.id, { active: header.column.getIsSorted() })}
              onClick={header.column.getToggleSortingHandler()}
              title={
                header.column.getCanSort()
                  ? getSortingLabel(header.column.getNextSortingOrder() === 'asc')
                  : undefined
              }
            >
              <span className="d-flex justify-content-between">
                {flexRender(header.column.columnDef.header, header.getContext())}
                <SortIcon column={header.column} />
              </span>
            </th>
          ))}
        </tr>
      ))}
    </thead>
  );
};

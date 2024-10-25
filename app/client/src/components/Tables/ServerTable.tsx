import React from 'react';
import { type SetURLSearchParams } from 'react-router-dom';
import classNames from 'classnames';
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef, type SortingState, type Updater } from '@tanstack/react-table';

import type { PaginationState } from '@typedef/table';

import { t } from '@plugins/i18n';

import Spinner from '@components/Spinner';
import { TableHead } from '@components/Tables/TableHead';
import { TablePager } from '@components/Tables/TablePager';

export interface Props<Item extends object> {
  readonly columns: ColumnDef<Item>[];
  readonly data: Item[];
  readonly sorting: SortingState;
  readonly setSearchParams: SetURLSearchParams;
  readonly pagination: PaginationState;
  readonly noResultsText?: string;
  readonly isLoading: boolean;
}

export function ServerTable<Item extends object>({
  columns,
  data,
  sorting,
  isLoading,
  pagination,
  noResultsText,
  setSearchParams
}: Props<Item>) {
  const table = useReactTable<Item>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableSortingRemoval: false,
    manualSorting: true,
    manualPagination: true,
    onSortingChange: (updater: Updater<unknown>) => (
      setSearchParams((prev) => {
        const newSorting: SortingState = updater instanceof Function ? updater(sorting) : updater;

        const newState = new URLSearchParams(prev.toString());
        newState.set('sort', newSorting[0].id);
        newState.set('desc', newSorting[0].desc.toString());

        return newState;
      })
    ),
    onPaginationChange: (updater: Updater<unknown>) => (
      setSearchParams((prev) => {
        const { pageIndex }: { pageIndex: number } = updater instanceof Function ? updater(sorting) : updater;

        const newState = new URLSearchParams(prev.toString());
        newState.set('page', pageIndex.toString());

        return newState;
      })
    ),
    state: {
      sorting,
      pagination: {
        pageIndex: pagination.pageIndex - 1,
        pageSize: pagination.pageSize,
      }
    },
    rowCount: pagination.rowCount,
  });

  return (isLoading ? <Spinner />
    : (
      <>
        <div className="d-flex mb-3">
          <div className="ms-auto">
            {t('Total: {{ total }}', { total: pagination.rowCount })}
          </div>
        </div>
        <table>
          <TableHead table={table} />
          <tbody>
            { data.length
              ? table.getRowModel().rows.map((row) => {
                const cells = row.getVisibleCells();

                return (
                  <tr
                    key={row.id}
                    className={cells.length % 2 ? 'odd-cols' : 'even-cols'}
                  >
                    {cells.map((cell, index) => (
                      <td
                        key={cell.id}
                        className={classNames(
                          'table-col',
                          `table-col-${index + 1}`,
                          {'actions-col': cells.length - 1 === index}
                        )}
                        style={{
                          width: cell.column.columnDef.size || 'auto',
                          minWidth: cell.column.columnDef.minSize,
                          maxWidth: cell.column.columnDef.maxSize,
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })
              : (
                <tr className="no-results">
                  <td colSpan={columns.length}>{noResultsText || t('There are no results.')}</td>
                </tr>
              )
            }
          </tbody>
        </table>
        <TablePager
          table={table}
          pagination={pagination}
        />
      </>
    )
  );
}

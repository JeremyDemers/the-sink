import React from 'react';
import classNames from 'classnames';
import { NavLink, useLocation } from 'react-router-dom';
import { type Table } from '@tanstack/table-core';

import type { PaginationState } from '@typedef/table';
import { t } from '@plugins/i18n';

import './_pager.scss';

interface HasTable {
  readonly table: Table<Any>;
}

interface TablePagerUrl {
  readonly url: string;
  readonly pageNum: number;
}

interface TablePagerProps extends HasTable {
  readonly pagination: PaginationState;
}

interface TablePagerLinkBaseProps extends HasTable {
  readonly url: TablePagerUrl;
  readonly className?: classNames.Argument;
}

interface TablePagerLinkProps extends TablePagerLinkBaseProps, React.PropsWithChildren {
}

interface TablePagerLinkShiftProps extends TablePagerLinkBaseProps {
  readonly icon: string;
  readonly label: string;
}

const TablePagerLink: React.FC<TablePagerLinkProps> = ({
  url,
  table,
  className,
  children,
}) => {
  return (
    <NavLink
      to={url.url}
      // Must be a function to override the `active` class
      // computation provided by the `NavLink` component.
      className={() => classNames(className)}
      onClick={(event) => {
        event.preventDefault();
        table.setPageIndex(url.pageNum);
      }}
    >
      {children || url.pageNum}
    </NavLink>
  );
};

const TablePagerLinkShift: React.FC<TablePagerLinkShiftProps> = ({
  icon,
  label,
  ...props
}) => {
  return (
    <TablePagerLink {...props}>
      <i className={`icon-m ${icon}`} title={label} />
      <span className="visibility-hidden">{label}</span>
    </TablePagerLink>
  );
};

export const TablePager: React.FC<TablePagerProps> = ({
  table,
  pagination,
}) => {
  const { pathname, search } = useLocation();
  const pageCount = Math.ceil(pagination.rowCount / pagination.pageSize);

  // No need to render pager for the table with only one page.
  if (pageCount <= 1) {
    return null;
  }

  const params = new URLSearchParams(search);
  const urls: TablePagerUrl[] = [];

  for (let i = 1; i <= pageCount; i++) {
    params.set('page', i.toString());
    urls.push({
      url: `${pathname}?${params}`,
      pageNum: i,
    });
  }

  return (
    <ul className="pager">
      {pagination.pageIndex !== 1 && (
        <li>
          <TablePagerLinkShift
            // array index is zero based, to get the correct element
            // we need decrease pageIndex by 2.
            url={urls[pagination.pageIndex - 2]}
            icon="font-icon-chevron-left"
            table={table}
            label={t('Prev page')}
          />
        </li>
      )}

      {urls.map((item) => (
        <li key={item.url} className="pager__item">
          <TablePagerLink
            url={item}
            table={table}
            className={['pager__link', { active: item.pageNum === pagination.pageIndex }]}
          />
        </li>
      ))}

      {pagination.pageIndex !== urls.length && (
        <li>
          <TablePagerLinkShift
            url={urls[pagination.pageIndex]}
            icon="font-icon-chevron-right"
            table={table}
            label={t('Next page')}
          />
        </li>
      )}
    </ul>
  );
};

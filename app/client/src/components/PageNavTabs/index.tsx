import React from 'react';
import classNames from 'classnames';
import { NavLink, useLocation } from 'react-router-dom';

import type { TabsList } from '@typedef/table';

import useTabs from '@hooks/useTabs';

interface Props {
  readonly items: TabsList;
}

const PageNavTabs: React.FC<Props> = ({ items }) => {
  const { pathname } = useLocation();
  const activeTab = useTabs(items);

  return (
    <div className="d-flex flex-wrap align-items-start my-3">
      <ul className="nav nav__tabs me-5">
        {items.map((item) => (
          <li key={item.title} className="nav__tabs__item">
            <NavLink
              // eslint-disable-next-line sonarjs/no-nested-template-literals
              to={`${pathname}${item.params ? `?${new URLSearchParams(item.params)}` : ''}`}
              // IMPORTANT! Must be a function to override the `active` class
              // computation provided by the `NavLink` internally.
              className={() => classNames('nav__tabs__link', { active: activeTab.id === item.id })}
            >
              {item.title}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PageNavTabs;

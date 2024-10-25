import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import classNames from 'classnames';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';

import { AppMetadata } from '@constants';

import { AuthContext } from '@context/AuthProvider';
import { t } from '@plugins/i18n';

import ProjectModel from '@models/Project';
import UserModel from '@models/User';

import { SiteNav, type Nav } from '@components/SiteNav';

import { Docs } from '@pages/Docs';
import { PageExamplesRoute } from '@pages/Examples';

const menu: readonly Nav.Link[] = [
  {
    route: PageExamplesRoute,
    title: t('Examples'),
  },
  {
    route: ProjectModel.routes.list,
    title: t('Projects'),
  },
  {
    route: UserModel.routes.list,
    title: t('Users'),
  },
  {
    route: Docs.routes.docs,
    title: t('Docs'),
  },
];

const Header: React.FC = () => {
  const { auth, logout } = useContext(AuthContext);
  const { pathname , search} = useLocation();
  const [hasMenu, setHasMenu] = useState(false);
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const toggleMenu = () => setMenuIsOpen((prevState) => !prevState);

  useEffect(() => {
    setHasMenu(!!menuRef.current);
  }, [menuRef]);

  useEffect(() => {
    const menu = menuRef.current;
    if (menu?.parentElement) {
      menuIsOpen ? disableBodyScroll(menu.parentElement) : enableBodyScroll(menu.parentElement);
    }
  }, [menuRef, menuIsOpen]);

  const hideMenu = useCallback(() => {
    setMenuIsOpen(false);
    clearAllBodyScrollLocks();
    // Prevent multiple function calls on window resize.
    window.removeEventListener('resize', hideMenu);
    window.removeEventListener('orientationchange', hideMenu);
  }, []);

  // Hide menu whenever user clicks on the link, even if it stays on the same page.
  const handleLinksClick = useCallback((event: MouseEvent) => {
    if ((event.target as Node).nodeName === 'A') {
      hideMenu();
      window.removeEventListener('mousedown', handleLinksClick);
    }
  }, [hideMenu]);

  useEffect(() => {
    window.addEventListener('resize', hideMenu);
    window.addEventListener('orientationchange', hideMenu);
    window.addEventListener('mousedown', handleLinksClick);
    // Cleanup event listener on component unmount.
    return () => {
      window.removeEventListener('resize', hideMenu);
      window.removeEventListener('orientationchange', hideMenu);
      window.removeEventListener('mousedown', handleLinksClick);
    };
  }, [menuIsOpen, hideMenu, handleLinksClick]);

  // Hide menu whenever route or search parameters are changed.
  useEffect(() => {
    hideMenu();
  }, [hideMenu, pathname, search]);

  return (
    <header className="site-header">
      <div className="container d-flex align-items-center justify-content-between">
        <Link rel="home" to="/" className="site-header__logo">
          {AppMetadata.title}
        </Link>
        {hasMenu && (
          <button
            className={classNames('btn menu__btn', { active: menuIsOpen })}
            onClick={toggleMenu}
          >
            <span />
            <i className="visually-hidden">
              {t('Toggle main menu')}
            </i>
          </button>
        )}
        <div
          className={classNames('main-menu d-flex flex-grow-1', { active: menuIsOpen })}
        >
          <div>
            <SiteNav links={menu} ref={menuRef} />
          </div>

          {auth && (
            <div className="d-flex gap-3">
              <button className="btn logout-mobile" onClick={logout}>
                <i className="font-icon-logout icon-s me-2" />
                {t('Sign out')}
              </button>

              <button className="btn btn--secondary btn--small logout-desktop" onClick={logout}>
                {t('Sign out')}
              </button>
            </div>
          )}
        </div>

        {menuIsOpen && <div role="presentation" className="dialog-popup__overlay" />}
      </div>
    </header>
  );
};

export default Header;

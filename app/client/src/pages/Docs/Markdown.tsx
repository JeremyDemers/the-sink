import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate, NavLink, type Location } from 'react-router-dom';
import classNames from 'classnames';
import mermaid from 'mermaid';
import type { Md2Ts } from 'md2ts';

import './Hljs.scss';
import './Markdown.scss';

interface PageMarkdownProps {
  readonly page: Md2Ts.Page;
}

interface PageMarkdownBreadcrumbsProps {
  readonly items: readonly Md2Ts.Breadcrumb[];
}

interface PageMarkdownAnchorsListProps {
  readonly items: readonly Md2Ts.Anchor[];
  readonly location: Location;
}

mermaid.initialize({
  startOnLoad: false,
});

const PageMarkdownBreadcrumbs: React.FC<PageMarkdownBreadcrumbsProps> = ({
  items,
}) => {
  const links = [...items];
  const page = links.pop();

  return !page ? null : (
    <nav className="breadcrumbs">
      {links.map((item) => (
        <NavLink key={item.path} to={item.path}>
          {item.title}
        </NavLink>
      ))}
      <span>
        {page.title}
      </span>
    </nav>
  );
};

const PageMarkdownAnchors: React.FC<PageMarkdownAnchorsListProps> = ({
  items,
  location,
}) => {
  return items.length === 0 ? null : (
    <ul className="m-0 p-0">
      {items.map((item) => {
        const anchor = `#${item.id}`;

        return (
          <li key={item.id}>
            <a
              href={anchor}
              className={classNames('d-block text-white', { active: anchor === location.hash })}
            >
              {item.title}
            </a>
            {item.children.length > 0 && <PageMarkdownAnchors items={item.children} location={location} />}
          </li>
        );
      })}
    </ul>
  );
};

export const PageMarkdown: React.FC<PageMarkdownProps> = ({ page }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const element = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const { current: markdown } = element;

    if (markdown) {
      // noinspection JSIgnoredPromiseFromCall
      mermaid.run({
        querySelector: '.language-mermaid',
      });

      if (location.hash) {
        markdown
          .querySelector(location.hash)
          ?.scrollIntoView();
      }

      markdown.querySelectorAll<HTMLImageElement>('img[id]').forEach((element) => {
        const src = page.images[element.id];

        if (src) {
          element.src = src;
        }
      });

      markdown.querySelectorAll<HTMLAnchorElement>('a.inlink').forEach((element) => {
        element.addEventListener('click', (event) => {
          event.preventDefault();
          navigate(element.pathname + element.search + element.hash);
        });
      });
    }
  });

  return (
    <div className="documentation">
      <PageMarkdownBreadcrumbs items={page.metadata.breadcrumbs} />

      <div className="row">
        <article
          ref={element}
          className="markdown-body col-9 px-4 py-3 bg-white"
          dangerouslySetInnerHTML={{
            // eslint-disable-next-line xss/no-mixed-html
            __html: page.html,
          }}
        />
        {page.metadata.navigation.length > 0 && (
          <aside className="sidebar col-3">
            <nav className="navigation">
              <PageMarkdownAnchors location={location} items={page.metadata.navigation} />
            </nav>
          </aside>
        )}
      </div>
    </div>
  );
};

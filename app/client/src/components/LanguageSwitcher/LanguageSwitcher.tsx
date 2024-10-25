import React from 'react';
import Select, { type MenuPlacement, type Props } from 'react-select';

import { i18n, type I18n } from '@plugins/i18n';

import './LanguageSwitcher.scss';

interface LanguageSwitcherProps {
  readonly placement?: MenuPlacement;
}

const config: Partial<Props<I18n.Locale.Metadata.Defined, false>> | null = i18n.locales.length < 2 ? null : {
  value: i18n.activeLocale,
  options: i18n.locales,
  className: 'language-switcher',
  hideSelectedOptions: true,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  onChange: (option) => i18n.setActiveLocale(option!.id),
  getOptionValue: (option) => option.id,
  getOptionLabel: (option) => `${option.emoji} ${option.name}`,
};

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  placement,
}) => {
  return config && (
    <Select<I18n.Locale.Metadata.Defined, false>
      {...config}
      menuPlacement={placement || 'top'}
    />
  );
};

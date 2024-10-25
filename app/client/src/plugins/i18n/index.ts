import type { I18n } from './types.d';
import { Internationalization } from './i18n';

const storageKey = 'app:lang' as const;
const i18n = new Internationalization({
  defaultLocale: {
    id: 'en-US',
    name: 'English (United States)',
  },
  locales: [
  ],
  activeLocaleId: window.localStorage.getItem(storageKey),
  onLocaleChange: (id) => {
    window.localStorage.setItem(storageKey, id);
    // The page reload is required as the `t()` func
    // can be/is used statically in random TS files.
    window.location.reload();
  },
});

const t = i18n.getTranslator();

export {
  t,
  i18n,
  Internationalization,
  type I18n,
};

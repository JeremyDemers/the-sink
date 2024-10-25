import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import sass from 'sass';

import { compilerOptions } from './tsconfig.json';

const backendPrefix = `/${process.env.FLASK_APP || 'api'}`;

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tsconfigPaths(),
  ],
  build: {
    target: 'es6',
    outDir: 'build',
  },
  resolve: {
    alias: {
      // Matters for the imports inside the SCSS. Irrelevant
      // otherwise as the `tsconfigPaths()` covers aliasing.
      '@': `${process.cwd()}/${compilerOptions.baseUrl}`,
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        implementation: sass,
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: Number(process.env.PORT_REACT),
    proxy: {
      [backendPrefix]: `http://localhost:${process.env.PORT_FLASK}`,
    },
  },
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
    __TEST__: JSON.stringify(process.env.NODE_ENV === 'test'),
    __APP_NAME__: JSON.stringify(process.env.APP_NAME),
    __BACKEND_PREFIX__: JSON.stringify(backendPrefix),
    __AUTH_API__: (() => {
      const prefix = '/auth/cognito' as const;
      const noCognito = !!process.env.AWS_COGNITO_DISABLED;
      const values: AuthApi = {
        login: `${prefix}/${noCognito ? 'fake' : 'login'}`,
        logout: `${prefix}/${noCognito ? 'post-' : ''}logout`,
        refresh: `${prefix}/refresh`,
        currentUser: '/users/current',
      };

      return JSON.stringify(values);
    })(),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: `./${compilerOptions.baseUrl}/tests/setup.ts`,
    css: true,
    reporters: ['verbose'],
    coverage: {
      reporter: [
        'text',
        'json',
        'html',
      ],
      include: [
        `${compilerOptions.baseUrl}/**/*`,
        'tools/**/*',
      ],
      exclude: [
        `${compilerOptions.baseUrl}/tests/jestUtils/*`,
        `${compilerOptions.baseUrl}/lang/*`,
      ],
    },
  },
});

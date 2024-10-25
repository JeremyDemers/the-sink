// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

type AuthApi = Readonly<Record<'login' | 'logout' | 'refresh' | 'currentUser', string>>;

declare const __DEV__: boolean;

declare const __TEST__: boolean;

declare const __APP_NAME__: string | undefined;

/**
 * The base path of the Flask app.
 */
declare const __BACKEND_PREFIX__: string;

declare const __AUTH_API__: AuthApi;

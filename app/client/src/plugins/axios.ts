import axios from 'axios';

function getEndpoint(url: string): string {
  if (url.startsWith('/') && !url.startsWith(__BACKEND_PREFIX__)) {
    return __BACKEND_PREFIX__ + url;
  }

  return url;
}

export function visit(url: string): void {
  // eslint-disable-next-line xss/no-location-href-assign
  window.location.href = getEndpoint(url);
}

axios.interceptors.request.use(
  async (config) => {
    if (config.url) {
      config.url = getEndpoint(config.url);
    }

    return config;
  },
  async (error) => {
    throw error;
  },
);

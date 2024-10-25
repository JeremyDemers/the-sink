import React from 'react';
import { AxiosError } from 'axios';
import { toast as toastify, type ToastContent } from 'react-toastify';

type ToastLineFormatter = (field: string, messages: readonly string[]) => ToastContent;

const formatToastLineDefault: ToastLineFormatter = (field, messages) => {
  return (
    <div key={field} className="fs-6">
      <h6>{field}:</h6>
      <ul>
        {messages.map((message, index) => (
          <li key={index} className="fw-light">
            {message}
          </li>
        ))}
      </ul>
    </div>
  );
};

function showResponseErrors(
  error: unknown,
  defaultMessage: string,
  format: ToastLineFormatter = formatToastLineDefault,
  key = 'errors',
) {
  const content: ToastContent[] = [];

  if (error instanceof AxiosError) {
    const errors = error.response?.data?.[key];

    if (errors && typeof errors === 'object' && !Array.isArray(errors)) {
      for (const [field, messages] of Object.entries(errors)) {
        if (Array.isArray(messages)) {
          const list = messages.filter((message) => typeof message === 'string' && message.trim() !== '');

          if (list.length > 0) {
            content.push(format(field, list));
          }

          if (__DEV__) {
            if (messages.length === 0) {
              // eslint-disable-next-line no-console
              console.error(`[dev] The "${key}.${field}" array must not be empty.`);
            } else if (list.length !== messages.length) {
              // eslint-disable-next-line no-console
              console.error(`[dev] Every item of "${key}.${field}" array must be a non-empty string.`);
            }
          }
        } else if (__DEV__) {
          // eslint-disable-next-line no-console, xss/no-mixed-html
          console.error('[dev] The response "errors" must be of "Record<string, string[]>" type.');
        }
      }
    }
  }

  if (content.length === 0) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.error('[dev]', error);
    }

    toastify.error(defaultMessage);
  } else {
    toastify.error(<>{content}</>);
  }
}

export const toast = {
  showResponseErrors,
} as const;

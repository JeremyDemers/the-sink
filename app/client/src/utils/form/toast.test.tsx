import React from 'react';
import { MockInstance } from 'vitest';
import { AxiosError, type AxiosResponse } from 'axios';
import { toast as toastify } from 'react-toastify';
import { render } from '@testing-library/react';

import { toast } from './toast';

vi.mock('react-toastify');

describe('@utils/form', () => {
  const mock = toastify.error as unknown as MockInstance;

  function assertCall(times: number, element: React.ReactNode): void {
    expect(mock).toHaveBeenCalledTimes(times);
    expect(render(mock.mock.calls[times - 1][0]).container.innerHTML).toBe(render(element).container.innerHTML);
  }

  function getAxiosError<T>(data: T): AxiosError<T, unknown> {
    return new AxiosError<T, unknown>(
      'Failed',
      '400',
      undefined,
      undefined,
      { data } as AxiosResponse,
    );
  }

  beforeEach(() => {
    mock.mockReset();
  });

  describe('toast', () => {
    for (const [error] of [
      [
        new Error('Oops'),
      ],
      [
        getAxiosError({}),
      ],
      [
        getAxiosError({ errors: {} }),
      ],
      [
        getAxiosError({ errors: [] }),
      ],
      [
        getAxiosError({ errors: 1 }),
      ],
      [
        getAxiosError({ errors: true }),
      ],
      [
        getAxiosError({ errors: false }),
      ],
      [
        getAxiosError({ errors: null }),
      ],
      [
        getAxiosError({ errors: undefined }),
      ],
    ] as const) {
      it(`should render the default message and log the error (${error})`, () => {
        const defaultMessage = 'Unable to do this!';
        const consoleErrorSpy = vi
          .spyOn(console, 'error')
          .mockImplementation(vi.fn());

        toast.showResponseErrors(error, defaultMessage);

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy).toHaveBeenCalledWith('[dev]', error);
        assertCall(1, defaultMessage);
      });
    }

    it('should render multiple messages', () => {
      const error = getAxiosError({
        errors: {
          field1: ['error1', 'error2'],
          field2: ['error1'],
        },
      });

      toast.showResponseErrors(error, error.message);
      assertCall(
        1,
        <>
          <div className="fs-6">
            {/* eslint-disable-next-line quotes */}
            <h6>{`field1`}:</h6>
            <ul>
              <li className="fw-light">error1</li>
              <li className="fw-light">error2</li>
            </ul>
          </div>
          <div className="fs-6">
            {/* eslint-disable-next-line quotes */}
            <h6>{`field2`}:</h6>
            <ul>
              <li className="fw-light">error1</li>
            </ul>
          </div>
        </>,
      );
    });

    // @todo: Test every `console.error`.
  });
});

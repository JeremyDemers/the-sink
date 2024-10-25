import type { Access } from '@typedef/access';

import { AuthProvider, hasAccess } from '@context/AuthProvider';

import { EntityRouteCanonical } from '@models/Base';
import { UserRole } from '@models/User';

import { getAuthUser } from '@tests/jestUtils/authUser';

const noopComponent = () => null;

describe(AuthProvider, () => {
  describe(hasAccess, () => {
    type TestCase = [
      thing: Access.Argument,
      expected: boolean,
      name?: string,
    ];

    const authUser = getAuthUser({
      role: UserRole.Scientist,
      permissions: ['do this', 'do that'],
    });

    const testCases: readonly TestCase[] = [
      [
        'do this',
        true,
      ],
      [
        'do that',
        true,
      ],
      [
        'undo this',
        false,
      ],
      [
        'undo that',
        false,
      ],
      [
        new EntityRouteCanonical({
          path: ['path', 'to', 'page1'],
          model: undefined,
          component: noopComponent,
        }),
        true,
        'with entity path without access constraints',
      ],
      [
        new EntityRouteCanonical({
          path: ['path', 'to', 'page1'],
          component: noopComponent,
          model: undefined,
          constraints: {
            permission: 'do this',
          },
        }),
        true,
        "with entity path with user's permission",
      ],
      [
        new EntityRouteCanonical({
          path: ['path', 'to', 'page1'],
          model: undefined,
          component: noopComponent,
          constraints: {
            permission: 'undo this',
          },
        }),
        false,
        "with entity path that requires a permission an auth user doesn't have",
      ],
      [
        {
          constraints: undefined,
        },
        true,
        'with object with no access constraints',
      ],
      [
        {
          constraints: {
            permission: 'do this',
          },
        },
        true,
        "with object with a user's permission",
      ],
      [
        {
          constraints: {
            permission: 'undo this',
          },
        },
        false,
        "with object with a permission an auth user doesn't have",
      ],
      [
        {
          constraints: {
            permission: 'do this',
            role: UserRole.Administrator,
          },
        },
        false,
        "with object with a user's permission and a role a user doesn't have",
      ],
      [
        {
          constraints: {
            permission: 'do this',
            role: UserRole.Administrator,
            oneOf: true,
          },
        },
        true,
        "with object with a user's permission and a role a user doesn't have (oneOf)",
      ],
      [
        {
          constraints: {
            permission: 'undo this',
            role: UserRole.Scientist,
            oneOf: true,
          },
        },
        true,
        "with object with a permission an auth user doesn't have and a role a user has (oneOf)",
      ],
      [
        {
          constraints: {
            role: UserRole.Authenticated,
          },
        },
        true,
        'with object with a requirement to be authenticated',
      ],
      [
        {
          constraints: false,
        },
        false,
        'with object with a requirement to be unauthenticated',
      ],
    ] as const;

    for (const [thing, expected, name] of testCases) {
      // eslint-disable-next-line sonarjs/no-nested-template-literals
      it(`${name || `${hasAccess.name}('${thing}')`} should return "${expected}"`, () => {
        expect(hasAccess(authUser, thing)).toBe(expected);
      });
    }
  });
});

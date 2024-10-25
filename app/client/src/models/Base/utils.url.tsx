import React from 'react';
import type { ComponentType } from 'react';
import type { Params } from 'react-router-dom';

import type { Access } from '@typedef/access';
import type { HasPath } from '@typedef/global';
import type { ModelComponentProps } from '@typedef/models';
import type { Route } from '@typedef/routing';

import { pkParam, pkParamName, pkParamNew, pkParamNewValue } from './constants';

type UrlPart =
  | string
  | typeof pkParam
  | typeof pkParamNew;

type EntityRouteConfig<T extends UrlPart> =
  & HasPath<readonly T[]>
  & Omit<Route.Definition<ModelComponentProps<Any>>, 'path'>
  & ModelComponentProps<Any>;

export interface EntityRoutes {
  readonly add: EntityRouteNew;
  readonly view: EntityRoute;
  readonly edit: EntityRoute;
  readonly list: EntityRouteCanonical;
}

const pkParamId = `:${pkParamName}` as const;

function transformPart(part: UrlPart): string {
  switch (part) {
    case pkParam:
      return pkParamId;

    case pkParamNew:
      return pkParamNewValue;

    default:
      if (__DEV__ && part.includes('/')) {
        throw new Error('The path chunk must not contain slashes!');
      }

      return part;
  }
}

/**
 * The base specification of an entity route.
 */
abstract class EntityRouteSpec<T extends UrlPart> implements Route.Definition {
  // noinspection JSUnusedGlobalSymbols
  protected static requiredSymbols: readonly symbol[] = [];

  public readonly constraints!: Access.Constraints | undefined;

  public readonly component!: ComponentType;

  public readonly path!: string;

  // eslint-disable-next-line sonarjs/cognitive-complexity
  public constructor(config: EntityRouteConfig<T>) {
    if (__DEV__) {
      // @ts-expect-error TS2339: Property `requiredSymbols` does not exist on type `Function`.
      const { requiredSymbols } = this.constructor;
      const findings = new Map<T, number>();

      for (const requiredSymbol of requiredSymbols) {
        if (!config.path.includes(requiredSymbol)) {
          throw new Error(`The "${String(requiredSymbol)}" symbol is required.`);
        }
      }

      for (const chunk of config.path) {
        // noinspection SuspiciousTypeOfGuard
        if (typeof chunk === 'symbol') {
          if (requiredSymbols.includes(chunk)) {
            findings.set(chunk, (findings.get(chunk) ?? 0) + 1);
          } else {
            throw new Error(`The "${String(chunk)}" symbol is not allowed.`);
          }
        }
      }

      for (const [requiredSymbol, foundTimes] of findings.entries()) {
        if (foundTimes > 1) {
          throw new Error(`The "${String(requiredSymbol)}" symbol cannot be used more than once.`);
        }
      }
    }

    this.path = `/${config.path.map(transformPart).join('/')}`;
    this.component = () => <config.component model={config.model} />;
    this.constraints = config.constraints || undefined;
  }

  public toString(): string {
    return this.path;
  }
}

/**
 * The route where an entity can be viewed/edited.
 */
export class EntityRoute extends EntityRouteSpec<string | typeof pkParam> {
  protected static requiredSymbols = [
    pkParam,
  ];

  public toUrl(id: number): string {
    return this.toString().replace(pkParamId, String(id));
  }

  public getPrimaryKey(params: Readonly<Params>): number | undefined {
    const pk = Number(params[pkParamName]);

    return Number.isNaN(pk) || pk < 1 ? undefined : pk;
  }
}

/**
 * The route where a new entity can be created.
 */
export class EntityRouteNew extends EntityRouteSpec<string | typeof pkParamNew> {
  protected static requiredSymbols = [
    pkParamNew,
  ];
}

/**
 * The route where a list of entities can be viewed.
 */
export class EntityRouteCanonical extends EntityRouteSpec<string> {
}

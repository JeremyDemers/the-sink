import axios from 'axios';
import { AnySchema } from 'yup';

import type { Access } from '@typedef/access';
import type { AuthUser } from '@typedef/auth';
import type { ModelBase, ModelBaseExisting, ModelListResponse } from '@typedef/models';
import type { Form } from '@typedef/form';

import {
  EntityRoute,
  EntityRouteNew,
  EntityRouteCanonical,
  type EntityRoutes,
} from './utils.url';

export * from './utils.url.noop';

export { pkParam, pkParamNew } from './constants';

export {
  EntityRoute,
  EntityRouteNew,
  EntityRouteCanonical,
};

export type {
  EntityRoutes,
};

export type AccessDetails = Readonly<
  Partial<
    Record<
      | 'delete',
      Access.HasConstraints
    >
  >
>;

/**
 * Abstract base class for models that provides common CRUD operations.
 *
 * @template Model
 *   The type of the model, which should include an optional `id` field.
 */
export abstract class BaseModel<
  Model extends ModelBase,
  ModelListItem extends ModelBaseExisting,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Filters extends Record<string, string> = Record<string, string>,
> {
  /**
   * The formik validation schema for the model.
   */
  abstract validationSchema: AnySchema;

  /**
   * An empty model object, that is used for the model create form.
   */
  abstract emptyModel: Model;

  /**
   * The base API endpoint for the model.
   */
  abstract endpoint: string;

  abstract access: AccessDetails;

  abstract routes: EntityRoutes;

  abstract getLabel: (entity: ModelListItem) => string;

  /**
   * Create a new entity.
   *
   * @param entity
   *   The entity to be created.
   *
   * @return
   *   A promise that resolves to the created entity.
   */
  create = (entity: Model): Promise<Model> => (
    axios
      .post(this.endpoint, entity)
      .then((response) => response.data)
  );
  /**
   * Update an existing entity.
   *
   * @param entity
   *   The entity to be updated (must include the `id`).
   *
   * @return
   *   A promise that resolves to the updated entity.
   */
  update = (entity: Model): Promise<Model> => (
    axios
      .put(`${this.endpoint}/${entity.id}`, entity)
      .then((response) => response.data)
  );
  /**
   * Load an entity by ID.
   *
   * @param id
   *   The ID of the entity to be loaded.
   *
   * @return
   *   A promise that resolves to the loaded entity.
   */
  load = (id: number): Promise<Model> => (
    axios
      .get(`${this.endpoint}/${id}`)
      .then((response) => response.data)
  );
  /**
   * Delete an existing entity.
   */
  delete = (id: number): Promise<void> => (
    axios
      .delete(`${this.endpoint}/${id}`)
      .then(() => undefined)
  );
  /**
   * Convert the URL search params into an object.
   *
   * @param urlParams
   *   Params to convert.
   *
   * @return
   *   The params that can be used by `axios` as a `params` value.
   */
  convertUrlParamsIntoListPayload = (urlParams: URLSearchParams): Record<string, string> => {
    const params: Record<string, string> = {};
    urlParams.forEach((value, key) => {
      if (key === 'desc') {
        params['order'] = value === 'true' ? 'desc' : 'asc';
      } else {
        params[key] = value;
      }
    });
    return params;
  };
  /**
   * Get list of entities, based on URLSearchParams params.
   *
   * @param params
   *   Object build from URL query, that may include: sorting, pager, filters.
   *
   * @return
   *   A promise that resolves to sorted, filtered, paginated list of entities.
   */
  list = (params: URLSearchParams): Promise<ModelListResponse<this>> => (
    axios
      .get(this.endpoint, { params: this.convertUrlParamsIntoListPayload(params) })
      .then((response) => response.data)
  );

  /**
   * Loads the entire models' collection.
   *
   * CAUTION! The bigger the collection the slower the execution!
   *
   * @param parallel
   *   The state of whether to fetch a collection using subsequent
   *   or parallel requests.
   * @param perPage
   *   The number of items per page.
   */
  async all(
    parallel = false,
    perPage = 100,
  ): Promise<readonly ModelListItem[]> {
    const query = new URLSearchParams(`per_page=${perPage}`);
    const items: ModelListItem[] = [];

    if (parallel) {
      // Grab the first page.
      const response = await this.list(query);

      await Promise.all(
        // Compute the total number of pages.
        Array(Math.ceil(response.pager.total / response.pager.per_page))
          .fill(undefined)
          .map(async (_, index) => {
            if (index === 0) {
              // Insert the results from the first page.
              items.push(...response.items);
            } else {
              const newQuery = new URLSearchParams(query);

              newQuery.set('page', String(index + 1));
              items.push(...(await this.list(newQuery)).items);
            }
          }),
      );
    } else {
      let page: number | null = 1;

      while (page !== null) {
        try {
          query.set('page', String(page));

          const response = await this.list(query);

          items.push(...response.items);

          if (items.length < response.pager.total) {
            page++;
          } else {
            page = null;
          }
        } catch {
          // eslint-disable-next-line no-empty
        }
      }
    }

    return items;
  }

  /**
   * @example
   * ```jsx
   * const labs = useMemo(LabModel.references.bind(LabModel), []);
   *
   * return (
   *  <!-- The result is cached. -->
   *   <FormItem<typeof InputSelect>
   *     name="labs"
   *     component={InputSelect}
   *     label="Lab name"
   *     options={labs}
   *     required
   *   />
   *
   *   <!-- Re-fetch on every form change. -->
   *   <FormItem<typeof InputSelect>
   *     name="labs"
   *     component={InputSelect}
   *     label="Lab name"
   *     options={LabModel.references.bind(LabModel)}
   *     required
   *   />
   *
   *  <!-- Re-fetch on every form change. -->
   *   <FormItem<typeof InputSelect>
   *     name="labs"
   *     component={InputSelect}
   *     label="Lab name"
   *     options={() => LabModel.references(true, 10)}
   *     required
   *   />
   * );
   * ```
   */
  async references(
    parallel = false,
    perPage = 100,
  ): Promise<readonly Form.Option[]> {
    return this
      .all(parallel, perPage)
      .then(
        (items) => items.map(
          (item) => ({
            value: item.id,
            label: this.getLabel(item),
          }),
        ),
      );
  }

  isNew = (model: Model): boolean => !model.id;

  canBeEdited = (model: Model, _authUser: AuthUser | undefined): boolean => true;

  canBeDeleted = (model: Model, _authUser: AuthUser | undefined): boolean => true;
}

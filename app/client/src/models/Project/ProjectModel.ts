import axios from 'axios';
import type { AnySchema } from 'yup';

import type { AuthUser } from '@typedef/auth';

import Yup from '@plugins/yup';
import {
  BaseModel,
  EntityRoute,
  EntityRouteNew,
  EntityRouteCanonical,
  pkParam,
  pkParamNew,
  type AccessDetails,
  type EntityRoutes,
} from '@models/Base';

import type { Project } from './types';
import { ProjectStatus } from './constants';
import { ProjectCreatePage } from './pages/ProjectCreatePage';
import { ProjectEditPage } from './pages/ProjectEditPage';
import { ProjectsListPage } from './pages/ProjectsListPage';

export class ProjectModel extends BaseModel<Project.Model, Project.ModelListItem, Project.Filters> {
  endpoint = '/projects' as const;

  access: AccessDetails = {
    delete: {
      constraints: {
        permission: 'delete projects',
      },
    },
  } as const;

  routes: EntityRoutes = {
    add: new EntityRouteNew({
      path: ['projects', pkParamNew],
      model: this,
      component: ProjectCreatePage,
      constraints: {
        permission: 'create projects',
      },
    }),
    edit: new EntityRoute({
      path: ['projects', pkParam],
      model: this,
      component: ProjectEditPage,
      constraints: {
        permission: 'edit projects',
      },
    }),
    view: new EntityRoute({
      path: ['projects', pkParam],
      model: this,
      component: ProjectEditPage,
      constraints: {
        permission: 'view projects',
      },
    }),
    list: new EntityRouteCanonical({
      path: ['projects'],
      model: this,
      component: ProjectsListPage,
      constraints: {
        permission: 'view projects',
      },
    }),
  };

  validationSchema: AnySchema = Yup.object().shape({
    title: Yup.string().required(),
    description: Yup.string().required(),
  });

  emptyModel: Project.Model = {
    title: '',
    description: '',
  };

  getLabel = (entity: Project.ModelListItem): string => entity.title;

  /**
   * Change the project status.
   *
   * @param project
   *   The project to be transitioned.
   * @param transition
   *   The transition id to execute.
   *
   * @return
   *   The updated project entity.
   */
  changeStatus = (project: Project.Model, transition: Project.Transition): Promise<Project.Model> => (
    axios
      .put(`${this.endpoint}/${project.id}/transition/${transition}`)
      .then(response => response.data)
  );

  /**
   * Whether it is allowed to edit project.
   */
  canBeEdited = (project: Project.Model, _authUser: AuthUser | undefined): boolean => (
    this.isNew(project) || project.status === ProjectStatus.Draft
  );
}

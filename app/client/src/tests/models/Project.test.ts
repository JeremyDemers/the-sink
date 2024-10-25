import axios from 'axios';
import { type Mock } from 'vitest';
import ProjectModel, { ProjectStatus, type Project } from '@models/Project';

vi.mock('axios');

const project: Project.Model = {
  ...ProjectModel.emptyModel,
  id: 1,
  title: 'Test Project',
  description: 'Test Description',
  status: ProjectStatus.Draft,
};

describe('ProjectModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a project', async () => {
    (axios.post as Mock).mockResolvedValue({ data: project });
    const created = await ProjectModel.create(project);
    expect(created).toEqual(project);
    expect(axios.post).toHaveBeenCalledWith('/projects', project);
  });

  it('should update a project', async () => {
    (axios.put as Mock).mockResolvedValue({ data: project });
    const updatedProject = await ProjectModel.update(project);
    expect(updatedProject).toEqual(project);
    expect(axios.put).toHaveBeenCalledWith('/projects/1', project);
  });

  it('should load a project', async () => {
    (axios.get as Mock).mockResolvedValue({ data: project });
    const loadedProject = await ProjectModel.load(1);
    expect(loadedProject).toEqual(project);
    expect(axios.get).toHaveBeenCalledWith('/projects/1');
  });

  it('should return the edit URI', () => {
    const uri = ProjectModel.routes.edit.toUrl(1);
    expect(uri).toEqual('/projects/1');
  });

  it('should change the status of a project', async () => {
    (axios.put as Mock).mockResolvedValue({ data: project });
    const updatedProject = await ProjectModel.changeStatus(project, 'complete');
    expect(updatedProject).toEqual(project);
    expect(axios.put).toHaveBeenCalledWith('/projects/1/transition/complete');
  });

  it('should check if a project can be edited', () => {
    const canEdit = ProjectModel.canBeEdited(project, undefined);
    expect(canEdit).toBe(true);

    const completedProject = { ...project, status: ProjectStatus.Completed };
    const cannotEdit = ProjectModel.canBeEdited(completedProject, undefined);
    expect(cannotEdit).toBe(false);
  });

  describe('convertUrlParamsIntoListPayload', () => {
    it('should handle multiple parameters', () => {
      const urlParams = new URLSearchParams('sort=title&desc=false&page=2');
      const expected = { sort: 'title', order: 'asc', page: '2' };

      const result = ProjectModel.convertUrlParamsIntoListPayload(urlParams);

      expect(result).toEqual(expected);
    });

    it('should handle no parameters', () => {
      const urlParams = new URLSearchParams();

      const result = ProjectModel.convertUrlParamsIntoListPayload(urlParams);

      expect(result).toEqual({});
    });
  });

  it('should fetch list of projects', async () => {
    (axios.get as Mock).mockResolvedValue({ data: { items: [project], foo: 'bar' } });
    const urlParams = new URLSearchParams('sort=title&desc=false&page=2');
    const result = await ProjectModel.list(urlParams);

    expect(result).toStrictEqual({ items: [project], foo: 'bar' });
    expect(axios.get as Mock).toHaveBeenCalledWith(
      '/projects', {
        'params': {
          'order': 'asc',
          'page': '2',
          'sort': 'title'
        },
      }
    );
  });
});

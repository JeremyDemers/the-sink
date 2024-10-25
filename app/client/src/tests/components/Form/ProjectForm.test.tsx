import React from 'react';
import { type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { FormikConfig } from 'formik';
import userEvent from '@testing-library/user-event';
import { AuthContext } from '@context/AuthProvider';
import AuthContextStub from '@tests/jestUtils/authContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import ProjectModel, { ProjectStatus, ProjectStatusMetadata, type Project } from '@models/Project';
import submitWithValues from '@tests/jestUtils/projectForm';
import { ProjectUpsertForm } from '@models/Project/pages/components/ProjectUpsertForm';
import { t } from '@plugins/i18n';

const project: Project.Model = {
  ...ProjectModel.emptyModel,
  id: 1,
  title: 'Test Project',
  description: 'Test Description',
  status: ProjectStatus.Draft,
  allowed_transitions: ['complete', 'archive'],
};
const mockSubmit = vi.fn();

const config: FormikConfig<Project.Model> = {
  initialValues: project,
  validationSchema: ProjectModel.validationSchema,
  onSubmit: (values) => {
    mockSubmit(values);
  },
};

vi.mock('axios');
vi.mock('react-toastify');

const renderProjectForm = (formik: FormikConfig<Project.Model> = config, canEdit = true) => (
  render(
    <AuthContext.Provider value={{ ...AuthContextStub, hasAccess: () => canEdit }}>
      <ProjectUpsertForm model={ProjectModel} config={formik} />
    </AuthContext.Provider>
  )
);

describe(ProjectUpsertForm, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the form with initial values', () => {
    renderProjectForm();

    expect(screen.getByRole('heading')).toHaveTextContent(project.title);
    expect(screen.getByText(t('Draft'))).toBeInTheDocument();
    expect(screen.getByText(t('Project title'))).toBeInTheDocument();
    const title = screen.getByDisplayValue(project.title);
    expect(title).toHaveAttribute('placeholder', t('My new project'));

    expect(screen.getByText(t('Description'))).toBeInTheDocument();
    const description = screen.getByDisplayValue('Test Description');
    expect(description).toHaveAttribute('placeholder', t('My new project description'));

    expect(screen.getByRole('button', { name: t('Save project') })).toBeInTheDocument();
  });

  it('should display different title for project add form', () => {
    renderProjectForm({ ...config, initialValues: ProjectModel.emptyModel });

    expect(screen.getByRole('heading')).toHaveTextContent(t('My new project'));
  });

  it('should call onSubmit when the form is submitted', async () => {
    renderProjectForm();

    await submitWithValues('Test Project change', 'Test Description change');

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        ...project,
        title: 'Test Project change',
        description: 'Test Description change',
      });
    });
  });

  it('should execute transition and show success message', async () => {
    renderProjectForm();
    (axios.put as Mock).mockResolvedValue(project);

    await userEvent.click(screen.getByRole('button', { name: t('Complete') }));

    await waitFor(() => {
      // Show confirmation modal.
      expect(screen.getByRole('presentation')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: t('Confirm') }));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith('/projects/1/transition/complete');
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        t('Project status has been updated.'),
      );
    });
  });

  it('should show error message if execute transition ended with error.', async () => {
    renderProjectForm();
    (axios.put as Mock).mockRejectedValue(new Error('Operation not permitted'));

    await userEvent.click(screen.getByRole('button', { name: t('Complete') }));

    await waitFor(() => {
      // Show confirmation modal.
      expect(screen.getByRole('presentation')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: t('Confirm') }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        t('Unable to transition project to the status. Please contact website administrator.'),
      );
    });
  });

  it('should show validation errors for empty fields', async () => {
    renderProjectForm();

    await submitWithValues('', '');

    await waitFor(() => {
      expect(screen.getAllByText(t('This field is required'))).toHaveLength(2);
    });
  });

  it('should render readonly form in case project is completed', async () => {
    renderProjectForm({ ...config, initialValues: { ...project, status: ProjectStatus.Completed } });

    const readonlyNote = t(
      'Please note that currently no edits are allowed as the project is in the {{ status }} status',
      {
        status: ProjectStatusMetadata[ProjectStatus.Completed].label,
      },
    );

    // Verify that explanation text is there.
    expect(screen.getByText(readonlyNote)).toBeInTheDocument();

    // Verify that "save" button is disabled, but status transitions are allowed.
    expect(screen.queryByText(t('Save project'))).not.toBeInTheDocument();
    expect(screen.getByText(t('Complete'))).not.toHaveAttribute('disabled');
    expect(screen.getByText(t('Archive'))).not.toHaveAttribute('disabled');
  });

  it('should not render buttons and "disable" inputs in the view mode', async () => {
    renderProjectForm({ ...config, initialValues: { ...project, status: ProjectStatus.Completed } }, false);

    expect(screen.getByRole('textbox', { name: `${t('Project title')} *` })).toHaveAttribute('readonly');
    expect(screen.getByRole('textbox', { name: `${t('Description')} *` })).toHaveAttribute('readonly');
    expect(screen.queryByText(t('Save project'))).not.toBeInTheDocument();
    expect(screen.queryByText(t('Complete'))).not.toBeInTheDocument();
    expect(screen.queryByText(t('Archive'))).not.toBeInTheDocument();
  });
});

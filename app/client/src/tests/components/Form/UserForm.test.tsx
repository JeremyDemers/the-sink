import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { FormikConfig } from 'formik';
import userEvent from '@testing-library/user-event';
import { AuthContext } from '@context/AuthProvider';
import AuthContextStub from '@tests/jestUtils/authContext';
import UserModel, { type User, UserRole, UserRoleMetadata } from '@models/User';
import submitWithValues from '@tests/jestUtils/userForm';
import { UserUpsertForm } from '@models/User/pages/components/UserUpsertForm';
import { t } from '@plugins/i18n';

const user: User.Model = {
  ...UserModel.emptyModel,
  id: 1,
  name: 'Test User',
  email: 'example@domain.com',
  is_active: true,
  role: UserRole.Scientist,
};

const mockSubmit = vi.fn();

const config: FormikConfig<User.Model> = {
  initialValues: user,
  validationSchema: UserModel.validationSchema,
  onSubmit: (values) => {
    mockSubmit(values);
  },
};

vi.mock('axios');
vi.mock('react-toastify');

const renderUserForm = (formik: FormikConfig<User.Model> = config, canEdit = true) => (
  render(
    <AuthContext.Provider value={{...AuthContextStub, hasAccess: () => canEdit}}>
      <UserUpsertForm model={UserModel} config={formik}/>
    </AuthContext.Provider>
  )
);

describe(UserUpsertForm, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the form with initial values', async () => {
    renderUserForm();

    expect(screen.getByRole('heading')).toHaveTextContent(user.email);
    expect(screen.getByText(t('Name'))).toBeInTheDocument();
    const name = screen.getByDisplayValue(user.name as string);
    expect(name).toHaveAttribute('placeholder', t("Value will be automatically populated after the first user's login."));

    expect(screen.getByText(t('Email'))).toBeInTheDocument();
    const email = screen.getByDisplayValue(user.email);
    expect(email).toHaveAttribute('placeholder', 'example-email@gmail.com');

    // Role select and it's options.
    const role = screen.getByRole('combobox', { name: `${t('Role')} *` });
    await userEvent.click(role);

    Object
      .values(UserRoleMetadata)
      .forEach((role) => (
        // In case value has been preselected, react-select will render multiple texts with the
        // option name, nevertheless we just need to confirm that it was rendered.
        expect(screen.getAllByText(role.label)[0]).toBeInTheDocument()
      ));

    expect(screen.getByRole('button', { name: t('Save user') })).toBeInTheDocument();
  });

  it('should display different title for user add form', () => {
    renderUserForm({ ...config, initialValues: UserModel.emptyModel });

    expect(screen.getByRole('heading')).toHaveTextContent(t('Create new user'));
  });

  it('should call onSubmit when the form is submitted', async () => {
    renderUserForm();

    await submitWithValues(user.email, UserRole.Administrator);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        ...user,
        role: UserRole.Administrator,
      });
    });
  });

  it('should show validation errors for empty fields', async () => {
    renderUserForm({ ...config, initialValues: UserModel.emptyModel });

    // Select User role and don't fill any email.
    await submitWithValues('', UserRole.Administrator);

    await waitFor(() => {
      expect(screen.getByText(t('This field is required'))).toBeInTheDocument();
    });
  });
});

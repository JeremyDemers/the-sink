/* istanbul ignore file */
import type { AuthContextValues } from '@typedef/auth';

const AuthContextStub: AuthContextValues = {
  hasAccess: vi.fn().mockReturnValue(false),
  refreshSession: vi.fn().mockResolvedValue(undefined),
  login: vi.fn(),
  logout: vi.fn(),
};

export default AuthContextStub;

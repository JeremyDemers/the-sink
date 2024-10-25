import axios from 'axios';
import { type Mock } from 'vitest';
import UserModel, { type User, UserRole } from '@models/User';

vi.mock('axios');

const user: User.Model = {
  ...UserModel.emptyModel,
  id: 1,
  name: 'Test User',
  email: 'example@domain.com',
  role: UserRole.Scientist,
};

describe('UserModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create the user', async () => {
    (axios.post as Mock).mockResolvedValue({ data: user });
    const created = await UserModel.create(user);
    expect(created).toEqual(user);
    expect(axios.post).toHaveBeenCalledWith('/users', user);
  });

  it('should update the user', async () => {
    (axios.put as Mock).mockResolvedValue({ data: user });
    const updatedUser = await UserModel.update(user);
    expect(updatedUser).toEqual(user);
    expect(axios.put).toHaveBeenCalledWith('/users/1', user);
  });

  it('should load the user', async () => {
    (axios.get as Mock).mockResolvedValue({ data: user });
    const loadedUser = await UserModel.load(1);
    expect(loadedUser).toEqual(user);
    expect(axios.get).toHaveBeenCalledWith('/users/1');
  });

  it('should return the edit URI', () => {
    const uri = UserModel.routes.edit.toUrl(1);
    expect(uri).toEqual('/users/1');
  });

  it('should fetch list of users', async () => {
    (axios.get as Mock).mockResolvedValue({ data: { items: [user], foo: 'bar' } });
    const urlParams = new URLSearchParams('sort=name&desc=false&page=2');
    const result = await UserModel.list(urlParams);

    expect(result).toStrictEqual({ items: [user], foo: 'bar' });
    expect(axios.get as Mock).toHaveBeenCalledWith(
      '/users', {
        'params': {
          'order': 'asc',
          'page': '2',
          'sort': 'name'
        },
      }
    );
  });
});

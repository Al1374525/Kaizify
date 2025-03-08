import configureMockStore from 'redux-mock-store';
import thunkMiddleware from 'redux-thunk';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import authSlice, { 
  getProfile, 
  updateProfile, 
  clearError 
} from '../authSlice';

const middlewares = [thunkMiddleware];
const createMockStore = configureMockStore(middlewares);

describe('authSlice', () => {
  let store;
  let mockAxios;

  beforeEach(() => {
    store = createMockStore({
      auth: {
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      }
    });
    mockAxios = new MockAdapter(axios);
  });

  afterEach(() => {
    mockAxios.restore();
    store.clearActions();
  });

  describe('getProfile', () => {
    it('fetches profile successfully', async () => {
      const profileData = { _id: '1', displayName: 'Test User', avatar: {} };
      mock.onGet('/api/users/profile').reply(200, profileData);

      await store.dispatch(getProfile());
      const actions = store.getActions();

      expect(actions[0].type).toBe(getProfile.pending.type);
      expect(actions[1].type).toBe(getProfile.fulfilled.type);
      expect(actions[1].payload).toEqual(profileData);
    });

    it('handles fetch profile failure', async () => {
      mock.onGet('/api/users/profile').reply(404, { message: 'User not found' });

      await store.dispatch(getProfile());
      const actions = store.getActions();

      expect(actions[0].type).toBe(getProfile.pending.type);
      expect(actions[1].type).toBe(getProfile.rejected.type);
      expect(actions[1].payload).toBe('User not found');
    });
  });

  describe('updateProfile', () => {
    it('updates profile successfully', async () => {
      const updatedProfile = { displayName: 'New Name' };
      mock.onPut('/api/users/profile').reply(200, updatedProfile);

      await store.dispatch(updateProfile({ displayName: 'New Name' }));
      const actions = store.getActions();

      expect(actions[0].type).toBe(updateProfile.pending.type);
      expect(actions[1].type).toBe(updateProfile.fulfilled.type);
      expect(actions[1].payload).toEqual(updatedProfile);
    });

    it('handles update profile failure', async () => {
      mock.onPut('/api/users/profile').reply(400, { message: 'Invalid data' });

      await store.dispatch(updateProfile({ displayName: 'New Name' }));
      const actions = store.getActions();

      expect(actions[0].type).toBe(updateProfile.pending.type);
      expect(actions[1].type).toBe(updateProfile.rejected.type);
      expect(actions[1].payload).toBe('Invalid data');
    });
  });

  describe('reducers', () => {
    it('sets user and authentication status', () => {
      const initialState = { user: null, isAuthenticated: false, loading: false, error: null };
      const newState = authSlice(initialState, setUser({ displayName: 'Test User' }));
      expect(newState.user).toEqual({ displayName: 'Test User' });
      expect(newState.isAuthenticated).toBe(true);
    });

    it('clears error', () => {
      const initialState = { user: null, isAuthenticated: false, loading: false, error: 'Error' };
      const newState = authSlice(initialState, clearError());
      expect(newState.error).toBe(null);
    });
  });
});
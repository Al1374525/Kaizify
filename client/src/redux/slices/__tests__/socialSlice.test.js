import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import socialSlice, {
  fetchGuilds,
  createGuild,
  joinGuild,
  leaveGuild,
  fetchActivityFeed,
  clearError,
} from '../socialSlice';

const mockStore = configureStore([thunk]);
const mock = new MockAdapter(axios);

describe('socialSlice', () => {
  let store;

  beforeEach(() => {
    store = mockStore({ social: { guilds: [], activityFeed: [], loading: false, error: null } });
    mock.reset();
  });

  // Thunks
  describe('fetchGuilds', () => {
    it('fetches guilds successfully', async () => {
      const guildsData = [{ _id: '1', name: 'Guild A' }];
      mock.onGet('/api/social').reply(200, guildsData);

      await store.dispatch(fetchGuilds());
      const actions = store.getActions();

      expect(actions[0].type).toBe(fetchGuilds.pending.type);
      expect(actions[1].type).toBe(fetchGuilds.fulfilled.type);
      expect(actions[1].payload).toEqual(guildsData);
    });

    it('handles fetch guilds failure', async () => {
      mock.onGet('/api/social').reply(500, { message: 'Server error' });

      await store.dispatch(fetchGuilds());
      const actions = store.getActions();

      expect(actions[0].type).toBe(fetchGuilds.pending.type);
      expect(actions[1].type).toBe(fetchGuilds.rejected.type);
      expect(actions[1].payload).toBe('Server error');
    });
  });

  describe('createGuild', () => {
    it('creates guild successfully', async () => {
      const guildData = { _id: '1', name: 'New Guild' };
      mock.onPost('/api/social').reply(201, guildData);

      await store.dispatch(createGuild({ name: 'New Guild' }));
      const actions = store.getActions();

      expect(actions[0].type).toBe(createGuild.pending.type);
      expect(actions[1].type).toBe(createGuild.fulfilled.type);
      expect(actions[1].payload).toEqual(guildData);
    });
  });

  describe('joinGuild', () => {
    it('joins guild successfully', async () => {
      const guildData = { _id: '1', name: 'Guild A', members: ['user1'] };
      mock.onPost('/api/social/1/join').reply(200, guildData);

      await store.dispatch(joinGuild('1'));
      const actions = store.getActions();

      expect(actions[0].type).toBe(joinGuild.pending.type);
      expect(actions[1].type).toBe(joinGuild.fulfilled.type);
      expect(actions[1].payload).toEqual(guildData);
    });
  });

  describe('leaveGuild', () => {
    it('leaves guild successfully', async () => {
      mock.onPost('/api/social/1/leave').reply(200, { message: 'Left guild successfully' });

      await store.dispatch(leaveGuild('1'));
      const actions = store.getActions();

      expect(actions[0].type).toBe(leaveGuild.pending.type);
      expect(actions[1].type).toBe(leaveGuild.fulfilled.type);
      expect(actions[1].payload).toEqual({ guildId: '1', message: 'Left guild successfully' });
    });
  });

  describe('fetchActivityFeed', () => {
    it('fetches activity feed successfully', async () => {
      const feedData = [{ id: '1', message: 'User joined guild' }];
      mock.onGet('/api/social/activity').reply(200, feedData);

      await store.dispatch(fetchActivityFeed());
      const actions = store.getActions();

      expect(actions[0].type).toBe(fetchActivityFeed.pending.type);
      expect(actions[1].type).toBe(fetchActivityFeed.fulfilled.type);
      expect(actions[1].payload).toEqual(feedData);
    });
  });

  // Reducers
  describe('reducers', () => {
    it('clears error', () => {
      const initialState = { guilds: [], activityFeed: [], loading: false, error: 'Error' };
      const newState = socialSlice.reducer(initialState, clearError());
      expect(newState.error).toBe(null);
    });
  });
});
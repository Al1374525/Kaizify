import configureMockStore from 'redux-mock-store'; // Change this import
import thunk from 'redux-thunk';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import analyticsSlice, { fetchAnalyticsSummary, clearError } from '../analyticsSlice';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares); // This is the correct way

const mock = new MockAdapter(axios);

describe('analyticsSlice', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      analytics: {
        summary: { questsCompleted: 0, questsByCategory: {}, currentStreak: 0, longestStreak: 0, totalXp: 0, skillPoints: {} },
        loading: false,
        error: null,
      },
    });
    mock.reset();
  });

  afterEach(() => {
    mock.restore();
  });
  describe('fetchAnalyticsSummary', () => {
    it('fetches analytics summary successfully', async () => {
      const summaryData = { questsCompleted: 5, currentStreak: 3, longestStreak: 4, totalXp: 100 };
      mock.onGet('/api/analytics/summary').reply(200, summaryData);

      await store.dispatch(fetchAnalyticsSummary());
      const actions = store.getActions();

      expect(actions[0].type).toBe(fetchAnalyticsSummary.pending.type);
      expect(actions[1].type).toBe(fetchAnalyticsSummary.fulfilled.type);
      expect(actions[1].payload).toEqual(summaryData);
    });

    it('handles fetch analytics failure', async () => {
      mock.onGet('/api/analytics/summary').reply(500, { message: 'Server error' });

      await store.dispatch(fetchAnalyticsSummary());
      const actions = store.getActions();

      expect(actions[0].type).toBe(fetchAnalyticsSummary.pending.type);
      expect(actions[1].type).toBe(fetchAnalyticsSummary.rejected.type);
      expect(actions[1].payload).toBe('Server error');
    });
  });

  describe('reducers', () => {
    it('clears error', () => {
      const initialState = { summary: {}, loading: false, error: 'Error' };
      const newState = analyticsSlice(initialState, clearError());
      expect(newState.error).toBe(null);
    });
  });
});
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import analyticsSlice, { fetchAnalyticsSummary, clearError } from '../analyticsSlice';

const mockStore = configureStore([thunk]);
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

  // Thunks
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

  // Reducers
  describe('reducers', () => {
    it('clears error', () => {
      const initialState = { summary: {}, loading: false, error: 'Error' };
      const newState = analyticsSlice.reducer(initialState, clearError());
      expect(newState.error).toBe(null);
    });
  });
});
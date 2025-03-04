import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import rewardSlice, { fetchRewards, purchaseReward, clearError } from '../rewardSlice';

const mockStore = configureStore([thunk]);
const mock = new MockAdapter(axios);

describe('rewardSlice', () => {
  let store;

  beforeEach(() => {
    store = mockStore({ rewards: { rewards: [], loading: false, error: null } });
    mock.reset();
  });

  // Thunks
  describe('fetchRewards', () => {
    it('fetches rewards successfully', async () => {
      const rewardsData = [{ _id: '1', name: 'Sword', cost: { coins: 50 } }];
      mock.onGet('/api/rewards').reply(200, rewardsData);

      await store.dispatch(fetchRewards());
      const actions = store.getActions();

      expect(actions[0].type).toBe(fetchRewards.pending.type);
      expect(actions[1].type).toBe(fetchRewards.fulfilled.type);
      expect(actions[1].payload).toEqual(rewardsData);
    });

    it('handles fetch rewards failure', async () => {
      mock.onGet('/api/rewards').reply(500, { message: 'Server error' });

      await store.dispatch(fetchRewards());
      const actions = store.getActions();

      expect(actions[0].type).toBe(fetchRewards.pending.type);
      expect(actions[1].type).toBe(fetchRewards.rejected.type);
      expect(actions[1].payload).toBe('Server error');
    });
  });

  describe('purchaseReward', () => {
    it('purchases reward successfully', async () => {
      const purchaseData = { message: 'Reward purchased', user: { coins: 50 } };
      mock.onPost('/api/rewards/1/purchase').reply(200, purchaseData);

      await store.dispatch(purchaseReward('1'));
      const actions = store.getActions();

      expect(actions[0].type).toBe(purchaseReward.pending.type);
      expect(actions[1].type).toBe(purchaseReward.fulfilled.type);
      expect(actions[1].payload).toEqual(purchaseData);
    });

    it('handles purchase reward failure', async () => {
      mock.onPost('/api/rewards/1/purchase').reply(400, { message: 'Insufficient currency' });

      await store.dispatch(purchaseReward('1'));
      const actions = store.getActions();

      expect(actions[0].type).toBe(purchaseReward.pending.type);
      expect(actions[1].type).toBe(purchaseReward.rejected.type);
      expect(actions[1].payload).toBe('Insufficient currency');
    });
  });

  // Reducers
  describe('reducers', () => {
    it('clears error', () => {
      const initialState = { rewards: [], loading: false, error: 'Error' };
      const newState = rewardSlice.reducer(initialState, clearError());
      expect(newState.error).toBe(null);
    });
  });
});
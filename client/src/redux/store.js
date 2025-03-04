import { configureStore } from '@reduxjs/toolkit';
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';

// Import slices
import authReducer from './slices/authSlice';
import questReducer from './slices/questSlice';
import uiReducer from './slices/uiSlice';
import rewardReducer from './slices/rewardSlice';
import socialReducer from './slices/socialSlice';
import notificationReducer from './slices/notificationSlice';
import achievementReducer from './slices/achievementSlice';
import analyticsReducer from './slices/analyticsSlice';

// Configure redux-persist
const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['auth', 'ui'], // Only persist these reducers
};

const rootReducer = combineReducers({
  auth: authReducer,
  quests: questReducer,
  ui: uiReducer,
  rewards: rewardReducer,
  social: socialReducer,
  notifications: notificationReducer,
  achievements: achievementReducer,
  analytics: analyticsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create the Redux store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);
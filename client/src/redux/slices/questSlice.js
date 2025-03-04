import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

const initialState = {
  quests: {
    daily: [],
    weekly: [],
    epic: [],
    side: []
  },
  currentQuest: null,
  loading: false,
  error: null,
  filter: {
    status: 'active',
    category: 'all',
    search: ''
  },
  stats: {
    totalActive: 0,
    totalCompleted: 0,
    completionRate: 0
  }
};

// Async thunks
export const fetchQuests = createAsyncThunk(
  'quests/fetchQuests',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { filter } = getState().quests;
      let url = '/api/quests';
      
      // Add filter params
      const params = new URLSearchParams();
      if (filter.status !== 'all') params.append('status', filter.status);
      if (filter.category !== 'all') params.append('category', filter.category);
      if (filter.search) params.append('search', filter.search);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await axios.get(url);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch quests');
    }
  }
);

export const fetchQuestById = createAsyncThunk(
  'quests/fetchQuestById',
  async (questId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/quests/${questId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch quest');
    }
  }
);

export const createQuest = createAsyncThunk(
  'quests/createQuest',
  async (questData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/quests', questData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create quest');
    }
  }
);

export const updateQuest = createAsyncThunk(
  'quests/updateQuest',
  async ({ questId, questData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/quests/${questId}`, questData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update quest');
    }
  }
);

export const deleteQuest = createAsyncThunk(
  'quests/deleteQuest',
  async (questId, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/quests/${questId}`);
      return questId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete quest');
    }
  }
);

export const completeQuest = createAsyncThunk(
  'quests/completeQuest',
  async (questId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/quests/${questId}/complete`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to complete quest');
    }
  }
);

export const updateQuestProgress = createAsyncThunk(
  'quests/updateQuestProgress',
  async ({ questId, progress }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/quests/${questId}/progress`, { progress });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update quest progress');
    }
  }
);

export const fetchQuestStats = createAsyncThunk(
  'quests/fetchQuestStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/quests/stats');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch quest statistics');
    }
  }
);

// Quest slice
const questSlice = createSlice({
  name: 'quests',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.filter = { ...state.filter, ...action.payload };
    },
    clearCurrentQuest: (state) => {
      state.currentQuest = null;
    },
    clearQuestError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch quests
      .addCase(fetchQuests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuests.fulfilled, (state, action) => {
        state.loading = false;
        
        // Organize quests by type
        const daily = [];
        const weekly = [];
        const epic = [];
        const side = [];
        
        action.payload.forEach(quest => {
          switch(quest.type) {
            case 'daily':
              daily.push(quest);
              break;
            case 'weekly':
              weekly.push(quest);
              break;
            case 'epic':
              epic.push(quest);
              break;
            case 'side':
              side.push(quest);
              break;
            default:
              break;
          }
        });
        
        state.quests = { daily, weekly, epic, side };
      })
      .addCase(fetchQuests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Failed to fetch quests');
      })
      
      // Fetch quest by ID
      .addCase(fetchQuestById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuest = action.payload;
      })
      .addCase(fetchQuestById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Failed to fetch quest details');
      })
      
      // Create quest
      .addCase(createQuest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createQuest.fulfilled, (state, action) => {
        state.loading = false;
        const quest = action.payload;
        
        // Add new quest to appropriate array
        state.quests[quest.type].push(quest);
        
        toast.success('Quest created successfully!');
      })
      .addCase(createQuest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Failed to create quest');
      })
      
      // Update quest
      .addCase(updateQuest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateQuest.fulfilled, (state, action) => {
        state.loading = false;
        const updatedQuest = action.payload;
        
        // Update in appropriate array
        const index = state.quests[updatedQuest.type].findIndex(q => q._id === updatedQuest._id);
        
        if (index !== -1) {
          state.quests[updatedQuest.type][index] = updatedQuest;
        }
        
        // Update current quest if it's the one being viewed
        if (state.currentQuest && state.currentQuest._id === updatedQuest._id) {
          state.currentQuest = updatedQuest;
        }
        
        toast.success('Quest updated successfully!');
      })
      .addCase(updateQuest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Failed to update quest');
      })
      
      // Delete quest
      .addCase(deleteQuest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteQuest.fulfilled, (state, action) => {
        state.loading = false;
        const questId = action.payload;
        
        // Find and remove from appropriate array
        for (const type in state.quests) {
          const index = state.quests[type].findIndex(q => q._id === questId);
          if (index !== -1) {
            state.quests[type].splice(index, 1);
            break;
          }
        }
        
        // Clear current quest if it's the one being deleted
        if (state.currentQuest && state.currentQuest._id === questId) {
          state.currentQuest = null;
        }
        
        toast.success('Quest deleted successfully!');
      })
      .addCase(deleteQuest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Failed to delete quest');
      })
      
      // Complete quest
      .addCase(completeQuest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeQuest.fulfilled, (state, action) => {
        state.loading = false;
        const { quest, rewards } = action.payload;
        
        // Update in appropriate array
        const index = state.quests[quest.type].findIndex(q => q._id === quest._id);
        
        if (index !== -1) {
          state.quests[quest.type][index] = quest;
        }
        
        // Update current quest if it's the one being completed
        if (state.currentQuest && state.currentQuest._id === quest._id) {
          state.currentQuest = quest;
        }
        
        toast.success(`Quest completed! +${rewards.xp} XP, +${rewards.coins} Coins`);
      })
      .addCase(completeQuest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Failed to complete quest');
      })
      
      // Update quest progress
      .addCase(updateQuestProgress.fulfilled, (state, action) => {
        const updatedQuest = action.payload;
        
        // Update in appropriate array
        const index = state.quests[updatedQuest.type].findIndex(q => q._id === updatedQuest._id);
        
        if (index !== -1) {
          state.quests[updatedQuest.type][index] = updatedQuest;
        }
        
        // Update current quest if it's the one being updated
        if (state.currentQuest && state.currentQuest._id === updatedQuest._id) {
          state.currentQuest = updatedQuest;
        }
      })
      .addCase(updateQuestProgress.rejected, (state, action) => {
        console.error('Failed to update quest progress:', action.payload);
      })
      
      // Fetch quest stats
      .addCase(fetchQuestStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  }
});

export const { setFilter, clearCurrentQuest, clearQuestError } = questSlice.actions;

export default questSlice.reducer;
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Grid, 
  Box, 
  Typography, 
  Paper, 
  Button,
  Divider,
  CircularProgress,
  LinearProgress,
  IconButton,
  Chip,
  useTheme
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// Components
import AvatarDisplay from '../components/dashboard/AvatarDisplay';
import DailyQuestList from '../components/quests/DailyQuestList';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import ProgressSummary from '../components/dashboard/ProgressSummary';
import AchievementWidget from '../components/achievements/AchievementWidget';
import QuestCreateDialog from '../components/quests/QuestCreateDialog';
import StatsWidget from '../components/analytics/StatsWidget';

// Redux actions
import { fetchQuests, completeQuest } from '../redux/slices/questSlice';
import { fetchAchievements } from '../redux/slices/achievementSlice';
import { fetchActivityFeed } from '../redux/slices/socialSlice';
import { fetchAnalyticsSummary } from '../redux/slices/analyticsSlice';

const Dashboard = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user } = useSelector(state => state.auth);
  const { quests, loading: questsLoading } = useSelector(state => state.quests);
  const { recentAchievements, loading: achievementsLoading } = useSelector(state => state.achievements);
  const { activityFeed, loading: socialLoading } = useSelector(state => state.social);
  const { summary, loading: analyticsLoading } = useSelector(state => state.analytics);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Calculate XP progress for current level
  const currentXP = user?.currencies?.xp || 0;
  const xpForNextLevel = Math.floor(100 * Math.pow(1.5, (user?.avatar?.level || 1) - 1));
  const xpProgress = Math.min(100, Math.floor((currentXP / xpForNextLevel) * 100));
  
  // Fetch data when component mounts
  useEffect(() => {
    dispatch(fetchQuests());
    dispatch(fetchAchievements());
    dispatch(fetchActivityFeed());
    dispatch(fetchAnalyticsSummary());
  }, [dispatch]);
  
  const handleCompleteQuest = (questId) => {
    dispatch(completeQuest(questId));
  };
  
  const handleOpenCreateDialog = () => {
    setDialogOpen(true);
  };
  
  const handleCloseCreateDialog = () => {
    setDialogOpen(false);
  };
  
  const refreshData = () => {
    dispatch(fetchQuests());
    dispatch(fetchActivityFeed());
  };
  
  const dailyQuests = quests.daily.filter(quest => quest.status === 'active');
  const todaysCompletedQuests = quests.daily.filter(quest => 
    quest.status === 'completed' && 
    new Date(quest.completedDates[quest.completedDates.length - 1]).toDateString() === new Date().toDateString()
  );
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Dashboard
        </Typography>
        <IconButton onClick={refreshData} color="primary">
          <RefreshIcon />
        </IconButton>
      </Box>
      
      <Grid container spacing={3}>
        {/* Avatar and Level Progress */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 3, 
              height: '100%',
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%)' 
                : 'linear-gradient(135deg, #f6f9fc 0%, #eaecef 100%)'
            }}
          >
            {user ? (
              <>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <AvatarDisplay 
                    level={user.avatar.level} 
                    characterClass={user.avatar.class}
                    customization={user.avatar.customization}
                    size="large"
                  />
                  <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold' }}>
                    {user.displayName}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    Level {user.avatar.level} {user.avatar.class}
                  </Typography>
                </Box>
                
                <Box sx={{ mt: 3, mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">XP</Typography>
                    <Typography variant="body2">{currentXP}/{xpForNextLevel}</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={xpProgress} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#7e57c2',
                      }
                    }}
                  />
                </Box>
                
                <Box sx={{ mt: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <img src="/assets/icons/coin.svg" alt="Coins" width={20} height={20} style={{ marginRight: 8 }} />
                      <Typography variant="body1">{user.currencies.coins}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <img src="/assets/icons/gem.svg" alt="Gems" width={20} height={20} style={{ marginRight: 8 }} />
                      <Typography variant="body1">{user.currencies.gems}</Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Skill Points
                  </Typography>
                  <Grid container spacing={1}>
                    {Object.entries(user.currencies.skillPoints).map(([skill, points]) => (
                      <Grid item key={skill}>
                        <Chip 
                          label={`${skill}: ${points}`} 
                          size="small"
                          sx={{ 
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4, pb: 4 }}>
                <CircularProgress />
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Daily Quests */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Today's Quests
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<AddIcon />}
                onClick={handleOpenCreateDialog}
                size="small"
              >
                New Quest
              </Button>
            </Box>
            
            {questsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4, pb: 4 }}>
                <CircularProgress />
              </Box>
            ) : dailyQuests.length === 0 && todaysCompletedQuests.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No quests available for today. Create a new quest to get started!
                </Typography>
              </Box>
            ) : (
              <>
                <DailyQuestList 
                  quests={dailyQuests} 
                  onCompleteQuest={handleCompleteQuest} 
                />
                {todaysCompletedQuests.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Divider />
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Completed Today
                      </Typography>
                      <DailyQuestList 
                        quests={todaysCompletedQuests} 
                        onCompleteQuest={handleCompleteQuest} 
                        completed
                      />
                    </Box>
                  </Box>
                )}
              </>
            )}
          </Paper>
        </Grid>
        
        {/* Activity Feed and Achievements */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Activity Feed
            </Typography>
            {socialLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4, pb: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <ActivityFeed feedItems={activityFeed} />
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Achievements
            </Typography>
            {achievementsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4, pb: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <AchievementWidget achievements={recentAchievements} />
            )}
          </Paper>
        </Grid>
        
        {/* Analytics Summary */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Analytics Summary
            </Typography>
            {analyticsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4, pb: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <StatsWidget summary={summary} />
            )}
          </Paper>
        </Grid>
      </Grid>
      
      <QuestCreateDialog open={dialogOpen} onClose={handleCloseCreateDialog} />
    </Container>
  );
};

export default Dashboard;

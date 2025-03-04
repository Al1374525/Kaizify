// client/src/containers/QuestJournal.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Typography,
  Tabs,
  Tab,
  Box,
  Button,
  CircularProgress,
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import QuestList from '../components/quests/QuestList'; // Assuming a reusable QuestList component
import QuestCreateDialog from '../components/quests/QuestCreateDialog';
import { fetchQuests, completeQuest, updateQuest } from '../redux/slices/questSlice';

const QuestJournal = () => {
  const dispatch = useDispatch();
  const { quests, loading } = useSelector((state) => state.quests);
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchQuests());
  }, [dispatch]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCompleteQuest = (questId) => {
    dispatch(completeQuest(questId));
  };

  const handleUpdateQuest = (questId, updatedData) => {
    dispatch(updateQuest({ questId, questData: updatedData }));
  };

  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);

  const questTypes = ['daily', 'weekly', 'epic', 'side'];
  const currentQuests = quests[questTypes[tabValue]] || [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Quest Journal
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          New Quest
        </Button>
      </Box>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Daily" />
        <Tab label="Weekly" />
        <Tab label="Epic" />
        <Tab label="Side" />
      </Tabs>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : currentQuests.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No {questTypes[tabValue]} quests yet. Create one to get started!
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <QuestList
              quests={currentQuests.filter((q) => q.status === 'active')}
              onCompleteQuest={handleCompleteQuest}
              onUpdateQuest={handleUpdateQuest}
            />
          </Grid>
          {currentQuests.some((q) => q.status === 'completed') && (
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Completed
              </Typography>
              <QuestList
                quests={currentQuests.filter((q) => q.status === 'completed')}
                completed
              />
            </Grid>
          )}
        </Grid>
      )}

      <QuestCreateDialog open={dialogOpen} onClose={handleCloseDialog} />
    </Container>
  );
};

export default QuestJournal;
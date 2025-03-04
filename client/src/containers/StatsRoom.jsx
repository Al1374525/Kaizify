// client/src/containers/StatsRoom.jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Typography, Grid } from '@mui/material';
import StatsWidget from '../components/analytics/StatsWidget';
import { fetchAnalyticsSummary } from '../redux/slices/analyticsSlice'; // New slice

const StatsRoom = () => {
  const dispatch = useDispatch();
  const { summary, loading } = useSelector((state) => state.analytics);

  useEffect(() => {
    dispatch(fetchAnalyticsSummary());
  }, [dispatch]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Stats Room
      </Typography>
      {loading ? <CircularProgress /> : <StatsWidget summary={summary} />}
    </Container>
  );
};

export default StatsRoom;
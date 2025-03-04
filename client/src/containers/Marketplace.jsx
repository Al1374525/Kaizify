// client/src/containers/Marketplace.jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Typography, Grid, CircularProgress } from '@mui/material';
import RewardCard from '../components/rewards/RewardCard'; // New component
import { fetchRewards, purchaseReward } from '../redux/slices/rewardSlice'; // New slice

const Marketplace = () => {
  const dispatch = useDispatch();
  const { rewards, loading } = useSelector((state) => state.rewards);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchRewards());
  }, [dispatch]);

  const handlePurchase = (rewardId) => {
    dispatch(purchaseReward(rewardId));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Marketplace
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={3}>
          {rewards.map((reward) => (
            <Grid item xs={12} sm={6} md={4} key={reward._id}>
              <RewardCard
                reward={reward}
                userCurrencies={user.currencies}
                onPurchase={() => handlePurchase(reward._id)}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Marketplace;
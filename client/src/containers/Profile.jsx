// client/src/containers/Profile.jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Typography, Box } from '@mui/material';
import AvatarDisplay from '../components/dashboard/AvatarDisplay';
import { getProfile, updateProfile } from '../redux/slices/authSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Profile
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <Box>
          <AvatarDisplay
            level={user.avatar.level}
            characterClass={user.avatar.class}
            customization={user.avatar.customization}
            size="large"
          />
          <Typography variant="h5">{user.displayName}</Typography>
          {/* Add settings form */}
        </Box>
      )}
    </Container>
  );
};

export default Profile;
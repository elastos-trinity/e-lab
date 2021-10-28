import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Card, Stack, Link, Container, Typography } from '@mui/material';
// layouts
import Page from '../components/Page';
import { MHidden } from '../components/@material-extend';
import { LoginForm } from '../components/authentication/login';
import UserContext from '../UserContext';

const RootStyle = styled(Page)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex'
  }
}));

const SectionStyle = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: 464,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  margin: theme.spacing(2, 0, 2, 2)
}));

const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  display: 'flex',
  minHeight: '100vh',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(12, 0)
}));

export default function Logout() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  // Delete the authentication token = sign out
  useEffect(() => {
    if (user) {
      console.log("Signing out user. Deleting session info, auth token", user, setUser);
      localStorage.removeItem("token");
      localStorage.removeItem("did");
      setUser(null);
    }

    setTimeout(() => {
      console.log("Going back to home page");
      navigate("/");
    }, 2000);
  });

  return (
    <RootStyle title="Logout | CR-Voting">
      <Container maxWidth="sm">
        <ContentStyle>
          <Stack sx={{ mb: 5 }}>
            <Typography variant="h4" gutterBottom textAlign="center">
              All right, you are signed out, see you!
            </Typography>
          </Stack>

        </ContentStyle>
      </Container>
    </RootStyle>
  );
}
